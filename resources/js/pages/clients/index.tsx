import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Edit, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TableSearch from '@/components/table-search';
import Pagination from '@/components/pagination';
import type { Client, Paginated } from '@/types/invoice';

type Props = {
    clients: Paginated<Client>;
    admins: { id: number; name: string }[];
    filters?: { q?: string };
};

export default function ClientsIndex({ clients, admins, filters }: Props) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user?.role === 'super_admin';
    const [openClientId, setOpenClientId] = useState<number | null>(null);

    function deleteClient(client: Client) {
        if (confirm(`Delete ${client.name}? Related invoices will also be deleted.`)) {
            router.delete(`/clients/${client.id}`);
        }
    }

    function toggleAdmin(client: Client, adminId: number, assign: boolean) {
        router.put(`/clients/${client.id}/toggle-admin`, { admin_id: adminId, assign });
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Clients</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage billing profiles for invoices.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/clients/create">
                        <Plus className="mr-2 size-4" />
                        Add Client
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold">All Clients</h2>
                        <p className="text-xs text-muted-foreground">
                            {clients.total} client{clients.total === 1 ? '' : 's'} total
                        </p>
                    </div>
                    <TableSearch
                        url="/clients"
                        initial={filters?.q ?? ''}
                        placeholder="Search clients..."
                    />
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground [&_th]:border-l [&_th]:border-border [&_th]:first:border-l-0">
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Company</th>
                            <th className="px-4 py-3 font-semibold">Designation</th>
                            <th className="px-4 py-3 font-semibold">Contact</th>
                            <th className="px-4 py-3 font-semibold">Invoices</th>
                            {isSuperAdmin && <th className="px-4 py-3 font-semibold">Assigned Admins</th>}
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border [&_td]:border-l [&_td]:border-border [&_td]:first:border-l-0">
                        {clients.data.length === 0 && (
                            <tr>
                                <td colSpan={isSuperAdmin ? 7 : 6} className="px-4 py-14 text-center text-muted-foreground">
                                    <Users className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                    No clients found yet.
                                </td>
                            </tr>
                        )}
                        {clients.data.map((client) => {
                            const assignedIds = (client.users ?? []).map((u) => u.id);
                            return (
                                <tr key={client.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-4 py-3 font-medium">{client.name}</td>
                                    <td className="px-4 py-3">{client.company ?? '-'}</td>
                                    <td className="px-4 py-3">{client.designation ?? '-'}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        <div>{client.email ?? '-'}</div>
                                        <div>{client.phone ?? ''}</div>
                                    </td>
                                    <td className="px-4 py-3">{client.invoices_count ?? 0}</td>
                                    {isSuperAdmin && (
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => setOpenClientId(openClientId === client.id ? null : client.id)}
                                                >
                                                    {(client.users?.length ?? 0) > 0
                                                        ? `${client.users!.length} admin(s)`
                                                        : 'Assign admins'}
                                                    <ChevronDown className="ml-1 size-3" />
                                                </Button>
                                                {openClientId === client.id && (
                                                    <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-2 shadow-md">
                                                        <div className="space-y-1">
                                                            {admins.map((admin) => {
                                                                const assigned = assignedIds.includes(admin.id);
                                                                return (
                                                                    <label
                                                                        key={admin.id}
                                                                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                                                                    >
                                                                        <Checkbox
                                                                            checked={assigned}
                                                                            onCheckedChange={() => toggleAdmin(client, admin.id, !assigned)}
                                                                        />
                                                                        <span>{admin.name}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                            {admins.length === 0 && (
                                                                <p className="px-2 py-1 text-xs text-muted-foreground">
                                                                    No admins available.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/clients/${client.id}/edit`}>
                                                        <Edit className="size-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteClient(client)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
                <Pagination paginated={clients} />
            </div>
        </div>
    );
}
