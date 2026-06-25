<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $query = Invoice::query();
        $recentQuery = Invoice::query()->with('client:id,name,company');

        if (!$user->isSuperAdmin()) {
            $clientIds = $user->clients()->pluck('clients.id');
            $query->whereIn('client_id', $clientIds);
            $recentQuery->whereIn('client_id', $clientIds);
        }

        $totals = $query
            ->selectRaw('COUNT(*) as total_invoices')
            ->selectRaw('COALESCE(SUM(invoice_total), 0) as invoice_total')
            ->selectRaw('COALESCE(SUM(total_paid), 0) as paid_amount')
            ->selectRaw('COALESCE(SUM(amount_due), 0) as due_amount')
            ->first();

        $overdueQuery = Invoice::query()->where('payment_status', 'overdue');
        if (!$user->isSuperAdmin()) {
            $overdueQuery->whereIn('client_id', $clientIds);
        }

        $statusQuery = Invoice::query()
            ->selectRaw('payment_status, COUNT(*) as total')
            ->groupBy('payment_status')
            ->orderBy('payment_status');
        if (!$user->isSuperAdmin()) {
            $statusQuery->whereIn('client_id', $clientIds);
        }

        return Inertia::render('dashboard', [
            'summary' => [
                'total_invoices' => (int) $totals->total_invoices,
                'invoice_total' => (float) $totals->invoice_total,
                'paid_amount' => (float) $totals->paid_amount,
                'due_amount' => (float) $totals->due_amount,
                'overdue_invoices' => $overdueQuery->count(),
            ],
            'statusBreakdown' => $statusQuery->get(),
            'recentInvoices' => $recentQuery->latest()->limit(6)->get(),
        ]);
    }
}
