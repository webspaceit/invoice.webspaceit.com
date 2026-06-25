<?php

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated users can manage clients', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('clients.index'))->assertOk();

    $this->post(route('clients.store'), [
        'name' => 'Acme Limited',
        'company' => 'Acme',
        'email' => 'billing@example.com',
        'phone' => '+8801700000000',
        'billing_address' => 'Dhaka, Bangladesh',
    ])->assertRedirect(route('clients.index'));

    $client = Client::firstOrFail();

    $this->put(route('clients.update', $client), [
        'name' => 'Acme Updated',
        'company' => 'Acme',
        'email' => 'billing@example.com',
        'phone' => '+8801700000000',
        'billing_address' => 'Pallabi, Dhaka',
    ])->assertRedirect(route('clients.index'));

    expect($client->fresh()->name)->toBe('Acme Updated');

    $this->delete(route('clients.destroy', $client))->assertRedirect(route('clients.index'));
    expect(Client::count())->toBe(0);
});
