import type { InertiaFormProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClientSelect } from '@/components/client-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Client } from '@/types/client';
import type { Domain } from '@/types/domain';

export type DomainFormData = {
    client_id: string;
    domain_name: string;
    domain_registered_email: string;
    domain_registrar_link: string;
    hosting_provider: string;
    hosting_registration_date: string;
    hosting_expiry_date: string;
    registration_date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
};

type Props = {
    form: InertiaFormProps<DomainFormData>;
    clients: Client[];
    submitLabel: string;
    title: string;
    onSubmit: (event: React.FormEvent) => void;
};

export function domainToForm(domain?: Domain): DomainFormData {
    return {
        client_id: domain?.client_id?.toString() ?? '',
        domain_name: domain?.domain_name ?? '',
        domain_registered_email: domain?.domain_registered_email ?? '',
        domain_registrar_link: domain?.domain_registrar_link ?? '',
        hosting_provider: domain?.hosting_provider ?? '',
        hosting_registration_date: domain?.hosting_registration_date ?? '',
        hosting_expiry_date: domain?.hosting_expiry_date ?? '',
        registration_date: domain?.registration_date ?? new Date().toISOString().slice(0, 10),
        expiry_date: domain?.expiry_date ?? '',
        status: domain?.status ?? 'active',
    };
}

export function DomainForm({ form, clients, submitLabel, title, onSubmit }: Props) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="max-w-3xl space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage domain and hosting records.
                </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
                <h2 className="mb-4 font-semibold">Domain Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="domain_name">Domain Name</Label>
                        <Input
                            id="domain_name"
                            value={data.domain_name}
                            onChange={(e) => setData('domain_name', e.target.value)}
                            placeholder="example.com"
                        />
                        {errors.domain_name && (
                            <p className="text-sm text-destructive">{errors.domain_name}</p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="domain_registered_email">Registrar Email for Domain</Label>
                        <Input
                            id="domain_registered_email"
                            type="email"
                            value={data.domain_registered_email}
                            onChange={(e) => setData('domain_registered_email', e.target.value)}
                            placeholder="admin@example.com"
                        />
                        {errors.domain_registered_email && (
                            <p className="text-sm text-destructive">{errors.domain_registered_email}</p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="domain_registrar_link">Domain Registrar Website Link</Label>
                        <Input
                            id="domain_registrar_link"
                            type="url"
                            value={data.domain_registrar_link}
                            onChange={(e) => setData('domain_registrar_link', e.target.value)}
                            placeholder="https://namecheap.com/..."
                        />
                        {errors.domain_registrar_link && (
                            <p className="text-sm text-destructive">{errors.domain_registrar_link}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="registration_date">Registration Date</Label>
                        <Input
                            id="registration_date"
                            type="date"
                            value={data.registration_date}
                            onChange={(e) => setData('registration_date', e.target.value)}
                        />
                        {errors.registration_date && (
                            <p className="text-sm text-destructive">{errors.registration_date}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input
                            id="expiry_date"
                            type="date"
                            value={data.expiry_date}
                            onChange={(e) => setData('expiry_date', e.target.value)}
                        />
                        {errors.expiry_date && (
                            <p className="text-sm text-destructive">{errors.expiry_date}</p>
                        )}
                    </div>

                </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
                <h2 className="mb-4 font-semibold">Hosting Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hosting_provider">Hosting Provider</Label>
                        <Input
                            id="hosting_provider"
                            value={data.hosting_provider}
                            onChange={(e) => setData('hosting_provider', e.target.value)}
                            placeholder="Hostinger, Namecheap, etc."
                        />
                        {errors.hosting_provider && (
                            <p className="text-sm text-destructive">{errors.hosting_provider}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hosting_registration_date">Registration Date</Label>
                        <Input
                            id="hosting_registration_date"
                            type="date"
                            value={data.hosting_registration_date}
                            onChange={(e) => setData('hosting_registration_date', e.target.value)}
                        />
                        {errors.hosting_registration_date && (
                            <p className="text-sm text-destructive">{errors.hosting_registration_date}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hosting_expiry_date">Expiry Date</Label>
                        <Input
                            id="hosting_expiry_date"
                            type="date"
                            value={data.hosting_expiry_date}
                            onChange={(e) => setData('hosting_expiry_date', e.target.value)}
                        />
                        {errors.hosting_expiry_date && (
                            <p className="text-sm text-destructive">{errors.hosting_expiry_date}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Client</Label>
                        <ClientSelect
                            clients={clients}
                            value={data.client_id}
                            onChange={(v) => setData('client_id', v)}
                            error={errors.client_id}
                        />
                        {data.client_id && (() => {
                            const c = clients.find((cl) => String(cl.id) === data.client_id);
                            return c ? (
                                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm space-y-0.5">
                                    <p className="font-semibold">{c.name}</p>
                                    {c.company && <p className="text-muted-foreground">{c.company}</p>}
                                    {c.email && <p className="text-muted-foreground">{c.email}</p>}
                                    {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(v) => setData('status', v as DomainFormData['status'])}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-destructive">{errors.status}</p>
                        )}
                    </div>
                </div>
            </div>

            <Button disabled={processing}>{submitLabel}</Button>
        </form>
    );
}
