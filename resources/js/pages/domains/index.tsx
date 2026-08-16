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

const statusLabels: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    expiring_soon: 'Expiring Soon',
};

const barClass: Record<string, string> = {
    active: 'bg-emerald-500',
    expired: 'bg-red-500',
    pending: 'bg-amber-500',
    expiring_soon: 'bg-orange-500',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[status] ?? 'bg-muted text-muted-foreground'}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {statusLabels[status] ?? status}
        </span>
    );
}

function domainBarClass(status: string) {
    return barClass[status] ?? 'bg-muted';
}

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

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold">All Domains</h2>
                        <p className="text-xs text-muted-foreground">
                            {domains.data.length} domain{domains.data.length === 1 ? '' : 's'} listed
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[1240px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground [&_th]:border-l [&_th]:border-border [&_th]:first:border-l-0">
                            <th className="px-4 py-3 font-semibold">Domain Name</th>
                            <th className="px-4 py-3 font-semibold">Registrar</th>
                            <th className="px-4 py-3 font-semibold">Client</th>
                            <th className="px-4 py-3 font-semibold">Provider</th>
                            <th className="px-4 py-3 font-semibold">Domain Registered</th>
                            <th className="px-4 py-3 font-semibold">Domain Expires</th>
                            <th className="px-4 py-3 font-semibold">Hosting Registered</th>
                            <th className="px-4 py-3 font-semibold">Hosting Expires</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border [&_td]:border-l [&_td]:border-border [&_td]:first:border-l-0">
                        {domains.data.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-14 text-center text-muted-foreground">
                                    <Globe className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                    No domains found yet.
                                </td>
                            </tr>
                        )}
                        {domains.data.map((domain) => (
                            <tr key={domain.id} className="transition-colors hover:bg-muted/40">
                                <td className="relative py-3 pl-5 pr-4 font-medium">
                                    <span
                                        className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${domainBarClass(domain.computed_status)}`}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Globe className="size-4 text-muted-foreground" />
                                        {domain.domain_name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
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
                                <td className="px-4 py-3">
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
                                <td className="px-4 py-3">{domain.hosting_provider ?? '-'}</td>
                                <td className="whitespace-nowrap px-4 py-3">{domain.registration_date}</td>
                                <td className="whitespace-nowrap px-4 py-3">{domain.expiry_date}</td>
                                <td className="whitespace-nowrap px-4 py-3">{domain.hosting_registration_date ?? '-'}</td>
                                <td className="whitespace-nowrap px-4 py-3">{domain.hosting_expiry_date ?? '-'}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={domain.computed_status} />
                                </td>
                                <td className="px-4 py-3 text-right">
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
        </div>
    );
}
