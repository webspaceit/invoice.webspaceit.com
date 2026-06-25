<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        $query = User::query()->with('clients:id,name');

        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            $query->whereHas('clients', fn($q) => $q->whereIn('clients.id', $clientIds));
        }

        $clientsQuery = Client::query();

        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            $clientsQuery->whereIn('id', $clientIds);
        }

        return Inertia::render('users/index', [
            'users' => $query->latest()->paginate(20),
            'clients' => $clientsQuery->orderBy('name')->get(['id', 'name', 'company']),
        ]);
    }

    public function store(Request $request)
    {
        $request->user()->isSuperAdmin() || abort(403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'admin',
        ]);

        return redirect()->route('users.index');
    }

    public function update(Request $request, User $user)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        if ($user->isSuperAdmin()) {
            abort(403, 'Cannot change super admin role.');
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['client', 'admin'])],
            'client_ids' => ['nullable', 'array'],
            'client_ids.*' => ['exists:clients,id'],
        ]);

        $user->update(['role' => $validated['role']]);

        if ($validated['role'] === 'client') {
            $user->clients()->sync($validated['client_ids'] ?? []);
        } else {
            $user->clients()->detach();
        }

        return redirect()->route('users.index');
    }

    public function destroy(Request $request, User $user)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        if ($user->isSuperAdmin()) {
            abort(403, 'Cannot delete super admin.');
        }

        if ($user->id === $request->user()->id) {
            abort(403, 'Cannot delete yourself.');
        }

        $user->clients()->detach();
        $user->delete();

        return redirect()->route('users.index');
    }
}
