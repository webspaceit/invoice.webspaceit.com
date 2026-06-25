import { useState } from 'react';
import { router, usePage, useForm } from '@inertiajs/react';
import { ChevronDown, Shield, Trash2, UserCog, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { User } from '@/types/auth';
import type { Client } from '@/types/client';
import type { Paginated } from '@/types/invoice';

type Props = {
    users: Paginated<User & { clients: Client[] }>;
    clients: Client[];
};

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    client: 'Client',
};

export default function UsersIndex({ users, clients }: Props) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user?.role === 'super_admin';
    const [openUserId, setOpenUserId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const createForm = useForm({ name: '', email: '', password: '' });

    function updateRole(user: User, role: string) {
        const data: Record<string, unknown> = { role };
        if (role !== 'client') {
            data.client_ids = [];
        }
        router.put(`/users/${user.id}`, data);
    }

    function toggleClient(user: User, clientId: number) {
        const currentIds = (user as User & { clients: Client[] }).clients?.map((c) => c.id) ?? [];
        const newIds = currentIds.includes(clientId)
            ? currentIds.filter((id) => id !== clientId)
            : [...currentIds, clientId];
        router.put(`/users/${user.id}`, { role: 'client', client_ids: newIds });
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage user roles and permissions.
                    </p>
                </div>
                {isSuperAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 size-4" />
                                Create Admin
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Admin</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createForm.post('/users', {
                                        onSuccess: () => {
                                            createForm.reset();
                                            setDialogOpen(false);
                                        },
                                    });
                                }}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-sm text-destructive">{createForm.errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.password && (
                                        <p className="text-sm text-destructive">{createForm.errors.password}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Admin'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="rounded-lg border bg-card">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            {isSuperAdmin && <th className="p-3 text-left">Assigned Clients</th>}
                            {isSuperAdmin && <th className="p-3 text-right">Change Role</th>}
                            {isSuperAdmin && <th className="p-3 text-right"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3 font-medium">
                                    <div className="flex items-center gap-2">
                                        <UserCog className="size-4 text-muted-foreground" />
                                        {user.name}
                                    </div>
                                </td>
                                <td className="p-3 text-muted-foreground">{user.email}</td>
                                <td className="p-3">{roleLabels[user.role] ?? user.role}</td>
                                {isSuperAdmin && (
                                    <td className="p-3">
                                        {user.role === 'client' ? (
                                            <div className="relative">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => setOpenUserId(openUserId === user.id ? null : user.id)}
                                                >
                                                    {((user as User & { clients: Client[] }).clients?.length ?? 0) > 0
                                                        ? `${(user as User & { clients: Client[] }).clients.length} client(s)`
                                                        : 'Assign clients'}
                                                    <ChevronDown className="ml-1 size-3" />
                                                </Button>
                                                {openUserId === user.id && (
                                                    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border bg-popover p-2 shadow-md">
                                                        <div className="space-y-1">
                                                            {clients.map((client) => {
                                                                const assigned = (user as User & { clients: Client[] }).clients?.some(
                                                                    (c) => c.id === client.id,
                                                                );
                                                                return (
                                                                    <label
                                                                        key={client.id}
                                                                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                                                                    >
                                                                        <Checkbox
                                                                            checked={assigned ?? false}
                                                                            onCheckedChange={() => toggleClient(user, client.id)}
                                                                        />
                                                                        <span>{client.name}</span>
                                                                        {client.company && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                ({client.company})
                                                                            </span>
                                                                        )}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </td>
                                )}
                                {isSuperAdmin && (
                                    <td className="p-3 text-right">
                                        {user.role !== 'super_admin' ? (
                                            <Select
                                                value={user.role}
                                                onValueChange={(v) => updateRole(user, v)}
                                            >
                                                <SelectTrigger className="w-36">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="client">Client</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Shield className="size-3.5" />
                                                {roleLabels[user.role] ?? user.role}
                                            </span>
                                        )}
                                    </td>
                                )}
                                {isSuperAdmin && user.role !== 'super_admin' && (
                                    <td className="p-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                if (confirm(`Delete user "${user.name}"?`)) {
                                                    router.delete(`/users/${user.id}`);
                                                }
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
