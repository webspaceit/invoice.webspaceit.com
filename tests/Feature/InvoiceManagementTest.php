<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated users can create invoices with calculated totals', function () {
    $this->actingAs(User::factory()->create());
    $client = Client::create([
        'name' => 'Web Space Client',
        'company' => 'Client Co',
        'email' => 'client@example.com',
        'phone' => '+8801711111111',
        'billing_address' => 'Mirpur, Dhaka',
    ]);

    $response = $this->post(route('invoices.store'), [
        'client_id' => $client->id,
        'invoice_number' => '',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'discount_amount' => 100,
        'tax_rate' => 10,
        'total_paid' => 500,
        'payment_status' => 'partial',
        'note' => '',
        'terms' => '',
        'items' => [
            ['description' => 'Website hosting', 'unit_amount' => 1000, 'quantity' => 2],
            ['description' => 'Domain renewal', 'unit_amount' => 500, 'quantity' => 1],
        ],
    ]);

    $invoice = Invoice::with('items')->firstOrFail();
    $response->assertRedirect(route('invoices.show', $invoice));

    expect($invoice->invoice_number)->toBe('WSI-2026-0001')
        ->and((float) $invoice->subtotal)->toBe(2500.0)
        ->and((float) $invoice->discount_amount)->toBe(100.0)
        ->and((float) $invoice->tax_amount)->toBe(240.0)
        ->and((float) $invoice->invoice_total)->toBe(2640.0)
        ->and((float) $invoice->total_paid)->toBe(500.0)
        ->and((float) $invoice->amount_due)->toBe(2140.0)
        ->and($invoice->items)->toHaveCount(2);
});

test('invoice numbers increment per current year', function () {
    Invoice::create([
        'client_id' => Client::create([
            'name' => 'Client',
            'billing_address' => 'Address',
        ])->id,
        'invoice_number' => 'WSI-'.now()->year.'-0001',
        'invoice_date' => now()->toDateString(),
        'due_date' => now()->addWeek()->toDateString(),
        'payment_status' => 'unpaid',
    ]);

    expect(Invoice::nextInvoiceNumber())->toBe('WSI-'.now()->year.'-0002');
});

test('dashboard renders invoice metrics', function () {
    $this->actingAs(User::factory()->create());
    $client = Client::create([
        'name' => 'Client',
        'billing_address' => 'Address',
    ]);

    Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-0100',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'invoice_total' => 1000,
        'total_paid' => 400,
        'amount_due' => 600,
        'payment_status' => 'partial',
    ]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('summary.total_invoices', 1)
            ->where('summary.paid_amount', 400)
            ->where('summary.due_amount', 600)
        );
});
