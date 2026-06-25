import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Globe, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/invoice';
import type { Domain } from '@/types/domain';

type Props = {
    domains: Paginated<Domain>;
};

const statusClass: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    expired: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    expiring_soon: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
};

export default function DomainsIndex({ domains }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin');

    function deleteDomain(domain: Domain) {
        if (confirm(`Delete domain ${domain.domain_name}?`)) {
            router.delete(`/domains/${domain.id}`);
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Domains & Hosting</h1>
                    <p className="text-sm text-muted-foreground">
                        Track domain registrations and hosting subscriptions.
                    </p>
                </div>

                {isAdmin && (
                    <Button asChild>
                        <Link href="/domains/create">
                            <Plus className="mr-2 size-4" />
                            Add Domain
                        </Link>
                    </Button>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <table className="w-full min-w-[760px]">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-3 text-left">Domain Name</th>
                            <th className="p-3 text-left">Registrar</th>
                            <th className="p-3 text-left">Client</th>
                            <th className="p-3 text-left">Provider</th>
                            <th className="p-3 text-left">Domain Registered</th>
                            <th className="p-3 text-left">Domain Expires</th>
                            <th className="p-3 text-left">Hosting Registered</th>
                            <th className="p-3 text-left">Hosting Expires</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {domains.data.map((domain) => (
                            <tr key={domain.id} className="border-t">
                                <td className="p-3 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Globe className="size-4 text-muted-foreground" />
                                        {domain.domain_name}
                                    </div>
                                </td>
                                <td className="p-3 text-sm">
                                    <div className="space-y-0.5">
                                        <div>{domain.domain_registered_email ?? '-'}</div>
                                        {domain.domain_registrar_link ? (
                                            <a
                                                href={domain.domain_registrar_link}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="text-primary underline underline-offset-2 hover:opacity-80"
                                            >
                                                {new URL(domain.domain_registrar_link).hostname}
                                            </a>
                                        ) : null}
                                    </div>
                                </td>
                                <td className="p-3">
                                    {domain.client ? (
                                        <div className="space-y-0.5">
                                            <div className="font-medium">{domain.client.name}</div>
                                            {domain.client.company && (
                                                <div className="text-xs text-muted-foreground">{domain.client.company}</div>
                                            )}
                                            {domain.client.email && (
                                                <div className="text-xs text-muted-foreground">{domain.client.email}</div>
                                            )}
                                            {domain.client.phone && (
                                                <div className="text-xs text-muted-foreground">{domain.client.phone}</div>
                                            )}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-3">{domain.hosting_provider ?? '-'}</td>
                                <td className="p-3">{domain.registration_date}</td>
                                <td className="p-3">{domain.expiry_date}</td>
                                <td className="p-3">{domain.hosting_registration_date ?? '-'}</td>
                                <td className="p-3">{domain.hosting_expiry_date ?? '-'}</td>
                                <td className="p-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[domain.computed_status]}`}
                                    >
                                        {domain.computed_status === 'expiring_soon'
                                            ? 'Expiring Soon'
                                            : domain.computed_status.charAt(0).toUpperCase() + domain.computed_status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    {isAdmin && (
                                        <>
                                            <Link
                                                href={`/domains/${domain.id}/edit`}
                                                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <Edit className="size-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => deleteDomain(domain)}
                                                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
