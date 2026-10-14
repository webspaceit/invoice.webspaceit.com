<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfitController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $user->isAdmin() || abort(403);
        $isSuperAdmin = $user->isSuperAdmin();
        $clientIds = $isSuperAdmin ? null : $user->clients()->pluck('clients.id');

        $applyFilters = function ($query) use ($request, $clientIds) {
            if ($clientIds !== null) {
                $query->whereIn('invoices.client_id', $clientIds);
            }

            if ($clientId = $request->query('client_id')) {
                $query->where('invoices.client_id', $clientId);
            }

            if ($from = $request->query('from')) {
                $query->whereDate('invoices.paid_date', '>=', $from);
            }

            if ($to = $request->query('to')) {
                $query->whereDate('invoices.paid_date', '<=', $to);
            }

            return $query;
        };

        $base = Invoice::query()->where('payment_status', 'paid');

        if ($clientIds !== null) {
            $base->whereIn('client_id', $clientIds);
        }
        if ($clientId = $request->query('client_id')) {
            $base->where('client_id', $clientId);
        }
        if ($from = $request->query('from')) {
            $base->whereDate('paid_date', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $base->whereDate('paid_date', '<=', $to);
        }

        $aggregate = $applyFilters(
            DB::table('invoices')->where('payment_status', 'paid')
        )
            ->select(
                DB::raw('COALESCE(SUM(subtotal), 0) as revenue'),
                DB::raw('COALESCE(SUM(domain_cost + hosting_cost), 0) as cost'),
            )
            ->first();

        $revenue = round((float) $aggregate->revenue, 2);
        $cost = round((float) $aggregate->cost, 2);
        $profit = round($revenue - $cost, 2);

        $clientProfit = $applyFilters(
            DB::table('invoices')
                ->join('clients', 'clients.id', '=', 'invoices.client_id')
                ->where('invoices.payment_status', 'paid')
        )
            ->groupBy('clients.id', 'clients.name', 'clients.company')
            ->orderByDesc('profit')
            ->select(
                'clients.id as client_id',
                'clients.name',
                'clients.company',
                DB::raw('COUNT(invoices.id) as invoice_count'),
                DB::raw('COALESCE(SUM(invoices.subtotal), 0) as revenue'),
                DB::raw('COALESCE(SUM(invoices.domain_cost + invoices.hosting_cost), 0) as cost'),
                DB::raw('COALESCE(SUM(invoices.subtotal - invoices.domain_cost - invoices.hosting_cost), 0) as profit'),
            )
            ->get()
            ->map(fn ($row): array => [
                'client_id' => (int) $row->client_id,
                'name' => $row->name,
                'company' => $row->company,
                'invoice_count' => (int) $row->invoice_count,
                'revenue' => round((float) $row->revenue, 2),
                'cost' => round((float) $row->cost, 2),
                'profit' => round((float) $row->profit, 2),
            ]);

        $invoices = (clone $base)
            ->with(['client:id,name,company'])
            ->orderByDesc('paid_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $invoices->through(function (Invoice $invoice): Invoice {
            // Admins edit domain/hosting cost from this page, so expose them.
            $invoice->makeVisible(['domain_cost', 'hosting_cost']);
            $invoice->setAttribute('cost_total', $invoice->totalCost());
            $invoice->setAttribute('profit', $invoice->profitAmount());

            return $invoice;
        });

        return Inertia::render('profit/index', [
            'invoices' => $invoices,
            'summary' => [
                'revenue' => $revenue,
                'cost' => $cost,
                'profit' => $profit,
                'invoice_count' => (clone $base)->count(),
            ],
            'clients' => $this->clientOptions($user),
            'clientProfit' => $clientProfit,
            'filters' => $request->only('client_id', 'from', 'to'),
        ]);
    }

    /**
     * Update the domain and hosting cost of the given invoice. These are the
     * only manually entered values behind the profit calculation.
     */
    public function updateCosts(Request $request, Invoice $invoice)
    {
        $user = $request->user();
        $user->isAdmin() || abort(403);

        if (!$user->isSuperAdmin()) {
            abort_unless($user->clients()->whereKey($invoice->client_id)->exists(), 403);
        }

        $data = $request->validate([
            'domain_cost' => ['nullable', 'numeric', 'min:0'],
            'hosting_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $invoice->update([
            'domain_cost' => round((float) ($data['domain_cost'] ?? 0), 2),
            'hosting_cost' => round((float) ($data['hosting_cost'] ?? 0), 2),
        ]);

        return back();
    }

    private function clientOptions($user)
    {
        $query = Client::query();

        if (!$user->isSuperAdmin()) {
            $query->whereIn('id', $user->clients()->pluck('clients.id'));
        }

        return $query->orderBy('name')->get(['id', 'name', 'company']);
    }
}
