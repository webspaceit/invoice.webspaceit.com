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
            DB::table('invoice_items')
                ->join('invoices', 'invoices.id', '=', 'invoice_items.invoice_id')
                ->where('invoices.payment_status', 'paid')
        )
            ->select(
                DB::raw('COALESCE(SUM(invoice_items.line_total), 0) as revenue'),
                DB::raw('COALESCE(SUM(invoice_items.cost_amount * invoice_items.quantity), 0) as cost'),
            )
            ->first();

        $revenue = round((float) $aggregate->revenue, 2);
        $cost = round((float) $aggregate->cost, 2);
        $profit = round($revenue - $cost, 2);

        $invoices = (clone $base)
            ->with(['client:id,name,company', 'items'])
            ->orderByDesc('paid_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $invoices->through(function (Invoice $invoice): Invoice {
            $invoice->setAttribute('cost_total', $invoice->costFromItems());
            $invoice->setAttribute('profit', $invoice->profitFromItems());

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
            'filters' => $request->only('client_id', 'from', 'to'),
        ]);
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
