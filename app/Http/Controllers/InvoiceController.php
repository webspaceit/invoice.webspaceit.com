<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query()->with('client:id,name,company');

        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            $query->whereIn('client_id', $clientIds);
        }

        return Inertia::render('invoices/index', [
            'invoices' => $query->latest()->paginate(10),
        ]);
    }

    public function create(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('invoices/create', [
            'clients' => $this->clientOptions($request->user()),
            'nextInvoiceNumber' => Invoice::nextInvoiceNumber(),
            'defaults' => [
                'note' => Invoice::DEFAULT_NOTE,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $data = $this->validateInvoice($request);
        $invoice = DB::transaction(function () use ($data, $request): Invoice {
            $items = $this->prepareItems($data['items']);
            $totals = Invoice::calculateTotals(
                $items,
                (float) ($data['discount_amount'] ?? 0),
                (float) ($data['tax_rate'] ?? 0),
                (float) ($data['total_paid'] ?? 0),
            );

            $signaturePath = null;
            if ($request->hasFile('signature')) {
                $signaturePath = $request->file('signature')->store('signatures', 'public');
            }

            $invoice = Invoice::create([
                ...Arr::except($data, ['items', 'signature']),
                ...$totals,
                'invoice_number' => $data['invoice_number'] ?: Invoice::nextInvoiceNumber(),
                'payment_status' => $data['payment_status'],
                'paid_date' => $this->resolvePaidDate($data),
                ...$this->resolvePaymentDetails($data),
                'note' => $data['note'] ?: Invoice::DEFAULT_NOTE,
                'signature' => $signaturePath,
                'signatory_designation' => $data['signatory_designation'] ?? null,
            ]);

            $invoice->items()->createMany($items);

            return $invoice;
        });

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Request $request, Invoice $invoice)
    {
        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            abort_unless($clientIds->contains($invoice->client_id), 403);
        }

        return Inertia::render('invoices/show', [
            'invoice' => $invoice->load(['client', 'items']),
        ]);
    }

    public function edit(Request $request, Invoice $invoice)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice->load(['client', 'items']),
            'clients' => $this->clientOptions($request->user()),
            'defaults' => [
                'note' => Invoice::DEFAULT_NOTE,
            ],
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->user()->isAdmin() || abort(403);

        $data = $this->validateInvoice($request, $invoice);
        DB::transaction(function () use ($data, $request, $invoice): void {
            $items = $this->prepareItems($data['items']);
            $totals = Invoice::calculateTotals(
                $items,
                (float) ($data['discount_amount'] ?? 0),
                (float) ($data['tax_rate'] ?? 0),
                (float) ($data['total_paid'] ?? 0),
            );

            $signaturePath = $invoice->signature;
            if ($request->hasFile('signature')) {
                // Delete old signature file if exists
                if ($invoice->signature) {
                    Storage::disk('public')->delete($invoice->signature);
                }
                $signaturePath = $request->file('signature')->store('signatures', 'public');
            } elseif ($request->input('remove_signature') === '1') {
                if ($invoice->signature) {
                    Storage::disk('public')->delete($invoice->signature);
                }
                $signaturePath = null;
            }

            $invoice->update([
                ...Arr::except($data, ['items', 'signature']),
                ...$totals,
                'payment_status' => $data['payment_status'],
                'paid_date' => $this->resolvePaidDate($data),
                ...$this->resolvePaymentDetails($data),
                'note' => $data['note'] ?: Invoice::DEFAULT_NOTE,
                'signature' => $signaturePath,
                'signatory_designation' => $data['signatory_designation'] ?? null,
            ]);

            $invoice->items()->delete();
            $invoice->items()->createMany($items);
        });

        return redirect()->route('invoices.show', $invoice);
    }

    public function destroy(Request $request, Invoice $invoice)
    {
        $request->user()->isAdmin() || abort(403);

        $invoice->delete();

        return redirect()->route('invoices.index');
    }

    public function downloadPdf(Request $request, Invoice $invoice)
    {
        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            abort_unless($clientIds->contains($invoice->client_id), 403);
        }

        $invoice->load(['client', 'items']);

        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice])
            ->setPaper('a4', 'portrait');

        $company = preg_replace('/[^a-zA-Z0-9_-]/', '_', $invoice->client->company);
        $date = now()->format('Y-m-d');

        if ($request->boolean('preview')) {
            return $pdf->stream("{$company}_{$date}_invoice-{$invoice->invoice_number}.pdf");
        }

        return $pdf->download("{$company}_{$date}_invoice-{$invoice->invoice_number}.pdf");
    }

    private function validateInvoice(Request $request, ?Invoice $invoice = null): array
    {
        return $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'invoice_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('invoices', 'invoice_number')->ignore($invoice),
            ],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:invoice_date'],
            'paid_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'max:255', Rule::in(Invoice::PAYMENT_METHODS)],
            'actual_paid_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'total_paid' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['required', Rule::in(Invoice::STATUSES)],
            'note' => ['nullable', 'string'],
            'signature' => ['nullable', 'image', 'max:2048'],
            'signatory_designation' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.unit_amount' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ]);
    }

    public function uploadPaymentSlip(Request $request, Invoice $invoice)
    {
        $request->user()->isAdmin() || abort(403);

        $data = $request->validate([
            'payment_slip' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        if ($invoice->payment_slip) {
            Storage::disk('public')->delete($invoice->payment_slip);
        }

        $invoice->update([
            'payment_slip' => $data['payment_slip']->store('payment-slips', 'public'),
        ]);

        return back();
    }

    public function removePaymentSlip(Request $request, Invoice $invoice)
    {
        $request->user()->isAdmin() || abort(403);

        if ($invoice->payment_slip) {
            Storage::disk('public')->delete($invoice->payment_slip);
            $invoice->update(['payment_slip' => null]);
        }

        return back();
    }

    private function resolvePaidDate(array $data): ?string
    {
        if (($data['payment_status'] ?? null) !== 'paid') {
            return null;
        }

        return ($data['paid_date'] ?? null) ?: now()->toDateString();
    }

    private function resolvePaymentDetails(array $data): array
    {
        $isPaid = ($data['payment_status'] ?? null) === 'paid';

        return [
            'payment_method' => $isPaid ? ($data['payment_method'] ?? null) : null,
            'actual_paid_amount' => $isPaid ? ($data['actual_paid_amount'] ?? null) : null,
        ];
    }

    private function prepareItems(array $items): array
    {
        return collect($items)
            ->map(fn (array $item): array => [
                'description' => $item['description'],
                'unit_amount' => round((float) $item['unit_amount'], 2),
                'quantity' => round((float) $item['quantity'], 2),
                'line_total' => round((float) $item['unit_amount'] * (float) $item['quantity'], 2),
            ])
            ->all();
    }

    private function clientOptions($user = null)
    {
        $query = Client::query();

        if ($user && !$user->isSuperAdmin()) {
            $clientIds = $user->clients()->pluck('clients.id');
            $query->whereIn('id', $clientIds);
        }

        return $query
            ->orderBy('name')
            ->get(['id', 'name', 'company', 'designation', 'email', 'phone', 'billing_address']);
    }
}
