<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfitController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $user->isAdmin() || abort(403);

        $applyFilters = $this->filters($request, $user);
        $summary = $this->summaryData($applyFilters);

        $base = Invoice::query()->where('payment_status', 'paid');
        $applyFilters($base);

        $invoices = $base
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
            'summary' => $summary,
            'clients' => $this->clientOptions($user),
            'clientProfit' => $this->clientProfitData($applyFilters),
            'filters' => $request->only('client_id', 'from', 'to'),
        ]);
    }

    /**
     * Download the per-client profit breakdown as a CSV, honouring the
     * current filters.
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $user->isAdmin() || abort(403);

        $rows = $this->clientProfitData($this->filters($request, $user));

        $filename = 'profit-by-client-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');

            // UTF-8 BOM so Excel opens the file with the correct encoding.
            fwrite($out, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($out, ['Client', 'Company', 'Paid Invoices', 'Revenue', 'Cost', 'Profit']);

            $totals = ['invoices' => 0, 'revenue' => 0.0, 'cost' => 0.0, 'profit' => 0.0];

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row['name'],
                    $row['company'] ?? '',
                    $row['invoice_count'],
                    $row['revenue'],
                    $row['cost'],
                    $row['profit'],
                ]);

                $totals['invoices'] += $row['invoice_count'];
                $totals['revenue'] += $row['revenue'];
                $totals['cost'] += $row['cost'];
                $totals['profit'] += $row['profit'];
            }

            fputcsv($out, [
                'Total',
                '',
                $totals['invoices'],
                round($totals['revenue'], 2),
                round($totals['cost'], 2),
                round($totals['profit'], 2),
            ]);

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
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

    /**
     * Build a closure that applies the shared client/date filters to a query.
     */
    private function filters(Request $request, $user): Closure
    {
        $clientIds = $user->isSuperAdmin() ? null : $user->clients()->pluck('clients.id');

        return function ($query) use ($request, $clientIds) {
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
    }

    /**
     * Overall revenue, cost, profit and invoice count for the current filters.
     */
    private function summaryData(Closure $applyFilters): array
    {
        $aggregate = $applyFilters(
            DB::table('invoices')->where('payment_status', 'paid')
        )
            ->select(
                DB::raw('COALESCE(SUM(subtotal), 0) as revenue'),
                DB::raw('COALESCE(SUM(domain_cost + hosting_cost), 0) as cost'),
                DB::raw('COUNT(*) as invoice_count'),
            )
            ->first();

        $revenue = round((float) $aggregate->revenue, 2);
        $cost = round((float) $aggregate->cost, 2);

        return [
            'revenue' => $revenue,
            'cost' => $cost,
            'profit' => round($revenue - $cost, 2),
            'invoice_count' => (int) $aggregate->invoice_count,
        ];
    }

    /**
     * Revenue, cost and profit grouped by client for the current filters.
     */
    private function clientProfitData(Closure $applyFilters): Collection
    {
        return $applyFilters(
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
