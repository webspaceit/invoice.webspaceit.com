import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Client, Paginated } from '@/types/invoice';

type Props = {
    clients: Paginated<Client>;
    admins: { id: number; name: string }[];
};

export default function ClientsIndex({ clients, admins }: Props) {
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

            <div className="rounded-lg border bg-card">
                <table className="w-full min-w-[760px]">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Company</th>
                            <th className="p-3 text-left">Designation</th>
                            <th className="p-3 text-left">Contact</th>
                            <th className="p-3 text-left">Invoices</th>
                            {isSuperAdmin && <th className="p-3 text-left">Assigned Admins</th>}
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.data.map((client) => {
                            const assignedIds = (client.users ?? []).map((u) => u.id);
                            return (
                                <tr key={client.id} className="border-t">
                                    <td className="p-3 font-medium">{client.name}</td>
                                    <td className="p-3">{client.company ?? '-'}</td>
                                    <td className="p-3">{client.designation ?? '-'}</td>
                                    <td className="p-3 text-sm text-muted-foreground">
                                        <div>{client.email ?? '-'}</div>
                                        <div>{client.phone ?? ''}</div>
                                    </td>
                                    <td className="p-3">{client.invoices_count ?? 0}</td>
                                    {isSuperAdmin && (
                                        <td className="p-3">
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
                                    <td className="p-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/clients/${client.id}/edit`}>
                                                <Edit className="mr-2 size-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteClient(client)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
