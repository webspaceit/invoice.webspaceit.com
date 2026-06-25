<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $query = Client::query()->withCount('invoices');

        if ($request->user()->isSuperAdmin()) {
            $query->with('users:id,name');
        } else {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            $query->whereIn('id', $clientIds);
        }

        return Inertia::render('clients/index', [
            'clients' => $query->latest()->paginate(10),
            'admins' => $request->user()->isSuperAdmin()
                ? User::where('role', 'admin')->orderBy('name')->get(['id', 'name'])
                : [],
        ]);
    }

    public function create(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('clients/create');
    }

    public function store(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $data = $this->validateClient($request);
        $data['created_by'] = $request->user()->id;
        $client = Client::create($data);

        if (!$request->user()->isSuperAdmin()) {
            $client->users()->attach($request->user()->id);
        }

        return redirect()->route('clients.index');
    }

    public function edit(Request $request, Client $client)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('clients/edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $request->user()->isAdmin() || abort(403);

        $client->update($this->validateClient($request));

        return redirect()->route('clients.index');
    }

    public function destroy(Request $request, Client $client)
    {
        $request->user()->isAdmin() || abort(403);

        $client->delete();

        return redirect()->route('clients.index');
    }

    public function toggleAdmin(Request $request, Client $client)
    {
        $request->user()->isSuperAdmin() || abort(403);

        $validated = $request->validate([
            'admin_id' => ['required', 'exists:users,id'],
            'assign' => ['required', 'boolean'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->isAdmin()) {
            abort(422, 'User is not an admin.');
        }

        if ($validated['assign']) {
            $client->users()->syncWithoutDetaching($admin->id);
        } else {
            $client->users()->detach($admin->id);
        }

        return redirect()->route('clients.index');
    }

    private function validateClient(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'billing_address' => ['required', 'string'],
        ]);
    }
}
