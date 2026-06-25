import { Link } from '@inertiajs/react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClientSelect } from '@/components/client-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { money } from '@/lib/invoice';
import type { Client, Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

export type InvoiceFormData = {
    client_id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    discount_amount: string;
    tax_rate: string;
    total_paid: string;
    payment_status: InvoiceStatus;
    note: string;
    signature: File | null;
    signatory_designation: string;
    remove_signature: string;
    _method: string;
    items: InvoiceItem[];
};

type Props = {
    form: InertiaFormProps<InvoiceFormData>;
    clients: Client[];
    title: string;
    submitLabel: string;
    onSubmit: (event: React.FormEvent) => void;
    existingSignature?: string | null;
};

export function invoiceToForm(
    invoice?: Invoice,
    defaults?: { note: string },
    nextInvoiceNumber?: string,
): InvoiceFormData {
    return {
        client_id: invoice ? String(invoice.client_id) : '',
        invoice_number: invoice?.invoice_number ?? nextInvoiceNumber ?? '',
        invoice_date: invoice?.invoice_date ?? new Date().toISOString().slice(0, 10),
        due_date:
            invoice?.due_date ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10),
        discount_amount: invoice?.discount_amount ?? '0',
        tax_rate: invoice?.tax_rate ?? '0',
        total_paid: invoice?.total_paid ?? '0',
        payment_status: invoice?.payment_status ?? 'unpaid',
        note: invoice?.note ?? defaults?.note ?? '',
        signature: null,
        signatory_designation: invoice?.signatory_designation ?? '',
        remove_signature: '0',
        _method: '',
        items: invoice?.items?.length
            ? invoice.items.map((item) => ({
                description: item.description,
                unit_amount: item.unit_amount,
                quantity: item.quantity,
            }))
            : [{ description: '', unit_amount: '0', quantity: '1' }],
    };
}

export function InvoiceForm({
    form,
    clients,
    title,
    submitLabel,
    onSubmit,
    existingSignature,
}: Props) {
    const { data, setData, processing, errors } = form;
    const fieldErrors = errors as Record<string, string | undefined>;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const subtotal = data.items.reduce(
        (sum, item) => sum + Number(item.unit_amount || 0) * Number(item.quantity || 0),
        0,
    );
    const discount = Math.min(Number(data.discount_amount || 0), subtotal);
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = taxableAmount * (Number(data.tax_rate || 0) / 100);
    const total = taxableAmount + tax;
    const due = Math.max(total - Number(data.total_paid || 0), 0);

    function updateItem(index: number, field: keyof InvoiceItem, value: string) {
        setData(
            'items',
            data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        );
    }

    function addItem() {
        setData('items', [
            ...data.items,
            { description: '', unit_amount: '0', quantity: '1' },
        ]);
    }

    function removeItem(index: number) {
        if (data.items.length === 1) {
            return;
        }

        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        Create service invoices in the Web Space IT format.
                    </p>
                </div>

                <Button variant="outline" asChild>
                    <Link href="/invoices">Back to Invoices</Link>
                </Button>
            </div>

            <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                    <Label>Client</Label>
                    <ClientSelect
                        clients={clients}
                        value={data.client_id}
                        onChange={(value) => setData('client_id', value)}
                        error={errors.client_id}
                    />
                    <ClientInfoCard clients={clients} clientId={data.client_id} />
                </div>

                <Field
                    id="invoice_number"
                    label="Invoice No."
                    value={data.invoice_number}
                    error={errors.invoice_number}
                    onChange={(value) => setData('invoice_number', value)}
                />
                <StatusField
                    value={data.payment_status}
                    error={errors.payment_status}
                    onChange={(value) => setData('payment_status', value)}
                />
                <Field
                    id="invoice_date"
                    label="Invoice Date"
                    type="date"
                    value={data.invoice_date}
                    error={errors.invoice_date}
                    onChange={(value) => setData('invoice_date', value)}
                />
                <Field
                    id="due_date"
                    label="Due Date"
                    type="date"
                    value={data.due_date}
                    error={errors.due_date}
                    onChange={(value) => setData('due_date', value)}
                />
                <Field
                    id="discount_amount"
                    label="Discount"
                    type="number"
                    value={data.discount_amount}
                    error={errors.discount_amount}
                    onChange={(value) => setData('discount_amount', value)}
                />
                <Field
                    id="tax_rate"
                    label="Tax %"
                    type="number"
                    value={data.tax_rate}
                    error={errors.tax_rate}
                    onChange={(value) => setData('tax_rate', value)}
                />
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="font-semibold">Service Details</h2>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 size-4" />
                        Add Row
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead className="bg-muted">
                            <tr>
                                <th className="w-12 p-3 text-left">No.</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="w-40 p-3 text-left">Amount</th>
                                <th className="w-32 p-3 text-left">Qty.</th>
                                <th className="w-40 p-3 text-right">Total</th>
                                <th className="w-20 p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <Textarea
                                            value={item.description}
                                            rows={2}
                                            onChange={(event) =>
                                                updateItem(
                                                    index,
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        {fieldErrors[`items.${index}.description`] && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {fieldErrors[`items.${index}.description`]}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_amount}
                                            onChange={(event) =>
                                                updateItem(
                                                    index,
                                                    'unit_amount',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={item.quantity}
                                            onChange={(event) =>
                                                updateItem(
                                                    index,
                                                    'quantity',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-3 text-right font-medium">
                                        {money(
                                            Number(item.unit_amount || 0) *
                                            Number(item.quantity || 0),
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length === 1}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-4 md:grid-cols-2">
                    <TextareaField
                        id="note"
                        label="Note"
                        value={data.note}
                        error={errors.note}
                        onChange={(value) => setData('note', value)}
                    />
                </div>

                <div className="space-y-3 rounded-lg border bg-card p-4">
                    <SummaryRow label="Sub Total" value={money(subtotal)} />
                    <SummaryRow label="Discount" value={money(discount)} />
                    <SummaryRow label="Tax" value={money(tax)} />
                    <SummaryRow label="Invoice Total" value={money(total)} strong />
                    <Field
                        id="total_paid"
                        label="Total Paid"
                        type="number"
                        value={data.total_paid}
                        error={errors.total_paid}
                        onChange={(value) => setData('total_paid', value)}
                    />
                    <SummaryRow label="Amount Due" value={money(due)} strong />
                </div>
            </div>

            {/* Signature & Designation */}
            <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Signature Image</Label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setData('signature', file);
                            setData('remove_signature', '0');
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setPreviewUrl(url);
                            } else {
                                setPreviewUrl(null);
                            }
                        }}
                    />
                    {/* Preview: newly selected file takes priority, then existing */}
                    {(previewUrl || (existingSignature && data.remove_signature !== '1')) ? (
                        <div className="relative inline-block">
                            <img
                                src={previewUrl ?? `/storage/${existingSignature}`}
                                alt="Signature preview"
                                className="h-20 rounded border object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setData('signature', null);
                                    setData('remove_signature', existingSignature ? '1' : '0');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2 size-4" />
                            Upload Signature
                        </Button>
                    )}
                    {!(previewUrl || (existingSignature && data.remove_signature !== '1')) && (
                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF · max 2 MB</p>
                    )}
                    {errors.signature && (
                        <p className="text-sm text-destructive">{errors.signature}</p>
                    )}
                </div>

                <Field
                    id="signatory_designation"
                    label="Signatory Designation"
                    value={data.signatory_designation}
                    error={errors.signatory_designation}
                    onChange={(value) => setData('signatory_designation', value)}
                />
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
                step={type === 'number' ? '0.01' : undefined}
                min={type === 'number' ? '0' : undefined}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

function StatusField({
    value,
    onChange,
    error,
}: {
    value: InvoiceStatus;
    onChange: (value: InvoiceStatus) => void;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select value={value} onValueChange={(next) => onChange(next as InvoiceStatus)}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

function TextareaField({
    id,
    label,
    value,
    onChange,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Textarea
                id={id}
                value={value}
                rows={5}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between ${strong ? 'text-base font-semibold' : 'text-sm'
                }`}
        >
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
        </div>
    );
}

function ClientInfoCard({
    clients,
    clientId,
}: {
    clients: Client[];
    clientId: string;
}) {
    const client = clients.find((c) => String(c.id) === clientId);
    if (!client) return null;

    return (
        <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm space-y-0.5">
            <p className="font-semibold">{client.name}</p>
            {client.company && <p className="text-muted-foreground">{client.company}</p>}
            {client.designation && <p className="text-muted-foreground">{client.designation}</p>}
            {client.email && <p className="text-muted-foreground">{client.email}</p>}
            {client.phone && <p className="text-muted-foreground">{client.phone}</p>}
            {client.billing_address && (
                <p className="text-muted-foreground whitespace-pre-line">{client.billing_address}</p>
            )}
        </div>
    );
}
