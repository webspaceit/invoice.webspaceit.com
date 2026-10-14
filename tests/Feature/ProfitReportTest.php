<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;

function makeClient(): Client
{
    return Client::create([
        'name' => 'Acme',
        'billing_address' => 'Dhaka',
    ]);
}

function makeInvoice(Client $client, string $number, array $overrides = []): Invoice
{
    return Invoice::create([
        'client_id' => $client->id,
        'invoice_number' => $number,
        'invoice_date' => '2026-06-08',
        'due_date' => '2026-06-15',
        'subtotal' => 1000,
        'invoice_total' => 1000,
        'total_paid' => 1000,
        'amount_due' => 0,
        'payment_status' => 'paid',
        'paid_date' => '2026-06-10',
        ...$overrides,
    ]);
}

function addHostingItem(Invoice $invoice): void
{
    $invoice->items()->create([
        'description' => 'Hosting',
        'unit_amount' => 1000,
        'quantity' => 1,
        'line_total' => 1000,
    ]);
}

test('profit report shows profit for paid invoices based on domain and hosting cost', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = makeClient();

    $invoice = makeInvoice($client, 'WSI-2026-9001', [
        'domain_cost' => 150,
        'hosting_cost' => 250,
    ]);

    addHostingItem($invoice);

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profit/index')
            ->where('summary.revenue', fn ($value) => (float) $value === 1000.0)
            ->where('summary.cost', fn ($value) => (float) $value === 400.0)
            ->where('summary.profit', fn ($value) => (float) $value === 600.0)
            ->where('invoices.data.0.domain_cost', fn ($value) => (float) $value === 150.0)
            ->where('invoices.data.0.hosting_cost', fn ($value) => (float) $value === 250.0)
            ->where('invoices.data.0.cost_total', fn ($value) => (float) $value === 400.0)
            ->where('invoices.data.0.profit', fn ($value) => (float) $value === 600.0)
            ->missing('invoices.data.0.profit_source')
            ->missing('invoices.data.0.profit_amount')
        );
});

test('profit only counts paid invoices', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = makeClient();

    $unpaid = makeInvoice($client, 'WSI-2026-9002', [
        'subtotal' => 5000,
        'invoice_total' => 5000,
        'total_paid' => 0,
        'payment_status' => 'unpaid',
        'paid_date' => null,
        'domain_cost' => 100,
        'hosting_cost' => 200,
    ]);

    addHostingItem($unpaid);

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
    $client = makeClient();

    $user = User::factory()->create(['role' => 'client']);
    $user->clients()->attach($client->id);

    $invoice = makeInvoice($client, 'WSI-2026-9100', [
        'domain_cost' => 150,
        'hosting_cost' => 250,
    ]);

    addHostingItem($invoice);

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
            ->missing('invoice.domain_cost')
            ->missing('invoice.hosting_cost')
        );
});

test('admins can see profit and cost data', function () {
    $client = makeClient();

    $admin = User::factory()->create(['role' => 'admin']);
    $admin->clients()->attach($client->id);

    $invoice = makeInvoice($client, 'WSI-2026-9101', [
        'domain_cost' => 150,
        'hosting_cost' => 250,
    ]);

    addHostingItem($invoice);

    $this->actingAs($admin);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('canViewProfit', true)
            ->where('summary.profit', fn ($value) => (float) $value === 600.0)
        );

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data.0.domain_cost', fn ($value) => (float) $value === 150.0)
            ->where('invoices.data.0.hosting_cost', fn ($value) => (float) $value === 250.0)
        );
});

test('admins can update domain and hosting costs from the profit page', function () {
    $this->actingAs(User::factory()->create(['role' => 'super_admin']));

    $client = makeClient();

    $invoice = makeInvoice($client, 'WSI-2026-9005');

    addHostingItem($invoice);

    $this->put(route('profit.updateCosts', $invoice), [
        'domain_cost' => 150,
        'hosting_cost' => 250,
    ])->assertRedirect();

    $invoice->refresh();
    expect((float) $invoice->domain_cost)->toBe(150.0);
    expect((float) $invoice->hosting_cost)->toBe(250.0);

    $this->get(route('profit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.cost', fn ($value) => (float) $value === 400.0)
            ->where('summary.profit', fn ($value) => (float) $value === 600.0)
        );
});

test('clients cannot update domain and hosting costs', function () {
    $client = makeClient();

    $invoice = makeInvoice($client, 'WSI-2026-9006');

    $this->actingAs(User::factory()->create(['role' => 'client']));

    $this->put(route('profit.updateCosts', $invoice), [
        'domain_cost' => 150,
        'hosting_cost' => 250,
    ])->assertForbidden();

    $invoice->refresh();
    expect((float) $invoice->domain_cost)->toBe(0.0);
    expect((float) $invoice->hosting_cost)->toBe(0.0);
});
