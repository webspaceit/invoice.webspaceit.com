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
            ->missing('invoices.data.0.profit_source')
            ->missing('invoices.data.0.profit_amount')
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

test('clients never receive profit or cost data', function () {
    $client = Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);

    $user = User::factory()->create(['role' => 'client']);
    $user->clients()->attach($client->id);

    $invoice = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9100',
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

    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('canViewProfit', false)
            ->where('summary.profit', null)
        );

    $this->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->missing('invoice.items.0.cost_amount')
        );
});

test('admins can see profit and cost data', function () {
    $client = Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);

    $admin = User::factory()->create(['role' => 'admin']);
    $admin->clients()->attach($client->id);

    $invoice = Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => 'WSI-2026-9101',
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

    $this->actingAs($admin);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('canViewProfit', true)
            ->where('summary.profit', fn ($value) => (float) $value === 600.0)
        );

    $this->get(route('invoices.edit', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoice.items.0.cost_amount', fn ($value) => (float) $value === 400.0)
        );
});
