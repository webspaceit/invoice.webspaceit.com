<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Domain;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index(Request $request)
    {
        $query = Domain::query()->with('client:id,name,company,email,phone');

        if (!$request->user()->isSuperAdmin()) {
            $clientIds = $request->user()->clients()->pluck('clients.id');
            $query->whereIn('client_id', $clientIds);
        }

        return Inertia::render('domains/index', [
            'domains' => $query->latest()->paginate(10),
        ]);
    }

    public function create(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('domains/create', [
            'clients' => $this->clientOptions($request->user()),
        ]);
    }

    public function store(Request $request)
    {
        $request->user()->isAdmin() || abort(403);

        Domain::create($this->validateDomain($request));

        return redirect()->route('domains.index');
    }

    public function edit(Request $request, Domain $domain)
    {
        $request->user()->isAdmin() || abort(403);

        return Inertia::render('domains/edit', [
            'domain' => $domain,
            'clients' => $this->clientOptions($request->user()),
        ]);
    }

    public function update(Request $request, Domain $domain)
    {
        $request->user()->isAdmin() || abort(403);

        $domain->update($this->validateDomain($request));

        return redirect()->route('domains.index');
    }

    public function destroy(Request $request, Domain $domain)
    {
        $request->user()->isAdmin() || abort(403);

        $domain->delete();

        return redirect()->route('domains.index');
    }

    private function validateDomain(Request $request): array
    {
        return $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'domain_name' => ['required', 'string', 'max:255'],
            'domain_registered_email' => ['nullable', 'email', 'max:255'],
            'domain_registrar_link' => ['nullable', 'url', 'max:500'],
            'hosting_provider' => ['nullable', 'string', 'max:255'],
            'hosting_registration_date' => ['nullable', 'date'],
            'hosting_expiry_date' => ['nullable', 'date', 'after_or_equal:hosting_registration_date'],
            'registration_date' => ['required', 'date'],
            'expiry_date' => ['required', 'date', 'after_or_equal:registration_date'],
            'status' => ['required', Rule::in(['active', 'expired', 'pending'])],
        ]);
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
            ->get(['id', 'name', 'company', 'email', 'phone']);
    }
}
