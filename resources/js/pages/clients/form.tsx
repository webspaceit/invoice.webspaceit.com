import type { InertiaFormProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Client } from '@/types/invoice';

export type ClientFormData = {
    name: string;
    company: string;
    designation: string;
    email: string;
    phone: string;
    billing_address: string;
};

type Props = {
    form: InertiaFormProps<ClientFormData>;
    submitLabel: string;
    title: string;
    onSubmit: (event: React.FormEvent) => void;
};

export function clientToForm(client?: Client): ClientFormData {
    return {
        name: client?.name ?? '',
        company: client?.company ?? '',
        designation: client?.designation ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        billing_address: client?.billing_address ?? '',
    };
}

export function ClientForm({ form, submitLabel, title, onSubmit }: Props) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="max-w-3xl space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Save billing details for invoice creation.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field
                    id="name"
                    label="Client Name"
                    value={data.name}
                    error={errors.name}
                    onChange={(value) => setData('name', value)}
                />
                <Field
                    id="company"
                    label="Company"
                    value={data.company}
                    error={errors.company}
                    onChange={(value) => setData('company', value)}
                />
                <Field
                    id="designation"
                    label="Designation"
                    value={data.designation}
                    error={errors.designation}
                    onChange={(value) => setData('designation', value)}
                />
                <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    error={errors.email}
                    onChange={(value) => setData('email', value)}
                />
                <Field
                    id="phone"
                    label="Phone"
                    value={data.phone}
                    error={errors.phone}
                    onChange={(value) => setData('phone', value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea
                    id="billing_address"
                    value={data.billing_address}
                    onChange={(event) =>
                        setData('billing_address', event.target.value)
                    }
                    rows={4}
                />
                {errors.billing_address && (
                    <p className="text-sm text-destructive">
                        {errors.billing_address}
                    </p>
                )}
            </div>

            <Button disabled={processing}>{submitLabel}</Button>
        </form>
    );
}

function Field({
    id,
    label,
    value,
    onChange,
    error,
    type = 'text',
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
