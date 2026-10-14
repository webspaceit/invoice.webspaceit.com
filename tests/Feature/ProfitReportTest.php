<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;

test('profit report shows profit for paid invoices based on item cost', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);

    $invoice = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9001',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'subtotal' => 1000,
        'invoice_total' => 1000,
        'total_paid' => 1000,
        'amount_due' => 0,
        'payment_status' => 'paid',
        'paid_date' => '2026-06-10',
    ]);

    $invoice->items()->create([
        'description' => 'Hosting',
        'unit_amount' => 1000,
        'cost_amount' => 400,
        'quantity' => 1,
        'line_total' => 1000,
    ]);

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profit/index')
            ->where('summary.revenue', fn ($value) => (float) $value === 1000.0)
            ->where('summary.cost', fn ($value) => (float) $value === 400.0)
            ->where('summary.profit', fn ($value) => (float) $value === 600.0)
            ->where('invoices.data.0.profit', fn ($value) => (float) $value === 600.0)
        );
});

test('a manually entered profit overrides the calculated profit', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);

    $manual = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9003',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'subtotal' => 1000,
        'invoice_total' => 1000,
        'total_paid' => 1000,
        'amount_due' => 0,
        'profit_amount' => 250,
        'payment_status' => 'paid',
        'paid_date' => '2026-06-10',
    ]);

    $manual->items()->create([
        'description' => 'Hosting',
        'unit_amount' => 1000,
        'cost_amount' => 400,
        'quantity' => 1,
        'line_total' => 1000,
    ]);

    $computed = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9004',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'subtotal' => 1000,
        'invoice_total' => 1000,
        'total_paid' => 1000,
        'amount_due' => 0,
        'payment_status' => 'paid',
        'paid_date' => '2026-06-10',
    ]);

    $computed->items()->create([
        'description' => 'Hosting',
        'unit_amount' => 1000,
        'cost_amount' => 400,
        'quantity' => 1,
        'line_total' => 1000,
    ]);

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            // 250 entered manually + 600 calculated fallback
            ->where('summary.profit', fn ($value) => (float) $value === 850.0)
            ->where('invoices.data.0.profit', fn ($value) => (float) $value === 600.0)
            ->where('invoices.data.0.profit_source', 'auto')
            ->where('invoices.data.1.profit', fn ($value) => (float) $value === 250.0)
            ->where('invoices.data.1.profit_source', 'manual')
        );
});

test('profit only counts paid invoices', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);

    $unpaid = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9002',
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'subtotal' => 5000,
        'invoice_total' => 5000,
        'payment_status' => 'unpaid',
    ]);

    $unpaid->items()->create([
        'description' => 'Domain',
        'unit_amount' => 5000,
        'cost_amount' => 1000,
        'quantity' => 1,
        'line_total' => 5000,
    ]);

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.profit', fn ($value) => (float) $value === 0.0)
            ->where('summary.invoice_count', 0)
        );
});

test('non admin users cannot access the profit report', function () {
    $this->actingAs(User::factory()->create(['role' => 'client']));

    $this->get(route('profit.index'))->assertForbidden();
});
