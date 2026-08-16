import { Link, router, usePage } from '@inertiajs/react';
import { Download, Edit, Eye, FileText, MoreHorizontal, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, money, statusClass, statusLabels } from '@/lib/invoice';
import type { Invoice, InvoiceStatus, Paginated } from '@/types/invoice';

type Props = {
    invoices: Paginated<Invoice>;
};

export default function InvoicesIndex({ invoices }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin');
    const slipInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const [slipPreview, setSlipPreview] = useState<Invoice | null>(null);

    function deleteInvoice(invoice: Invoice) {
        if (confirm(`Delete invoice ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}`);
        }
    }

    function uploadSlip(invoice: Invoice, file: File) {
        const formData = new FormData();
        formData.append('payment_slip', file);
        router.post(`/invoices/${invoice.id}/payment-slip`, formData, {
            forceFormData: true,
            onFinish: () => {
                if (slipInputRefs.current[invoice.id]) {
                    slipInputRefs.current[invoice.id]!.value = '';
                }
            },
        });
    }

    function removeSlip(invoice: Invoice) {
        if (confirm(`Remove payment slip for ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}/payment-slip`);
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        Track billed services, payments, and due balances.
                    </p>
                </div>

                {isAdmin && (
                    <Button asChild>
                        <Link href="/invoices/create">
                            <Plus className="mr-2 size-4" />
                            New Invoice
                        </Link>
                    </Button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold">All Invoices</h2>
                        <p className="text-xs text-muted-foreground">
                            {invoices.data.length} invoice{invoices.data.length === 1 ? '' : 's'} listed
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1240px] text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground [&_th]:border-l [&_th]:border-border [&_th]:first:border-l-0">
                                <th className="px-4 py-3 font-semibold">Invoice</th>
                                <th className="px-4 py-3 font-semibold">Client</th>
                                <th className="px-4 py-3 font-semibold">Due Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Paid Date</th>
                                <th className="px-4 py-3 font-semibold">Payment Method</th>
                                <th className="px-4 py-3 text-right font-semibold">Actual Paid</th>
                                <th className="px-4 py-3 font-semibold">Payment Slip</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                                <th className="px-4 py-3 text-right font-semibold">Due</th>
                                <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border [&_td]:border-l [&_td]:border-border [&_td]:first:border-l-0">
                            {invoices.data.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="px-4 py-14 text-center text-muted-foreground">
                                        <FileText className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                        No invoices found yet.
                                    </td>
                                </tr>
                            )}
                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id} className="transition-colors hover:bg-muted/40">
                                    <td className="relative py-3 pl-5 pr-4">
                                        <span
                                            className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${statusBarClass(invoice.payment_status)}`}
                                        />
                                        <Link
                                            href={`/invoices/${invoice.id}`}
                                            className="font-mono text-[13px] font-semibold text-foreground transition-colors hover:text-primary"
                                        >
                                            {invoice.invoice_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{invoice.client.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {invoice.client.company ?? ''}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                        {invoice.payment_status === 'paid'
                                            ? '—'
                                            : formatDate(invoice.due_date)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={invoice.payment_status} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                        {formatDate(invoice.paid_date) || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {invoice.payment_method ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                {invoice.payment_method}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                                        {invoice.payment_status === 'paid' &&
                                            invoice.actual_paid_amount !== null
                                            ? money(invoice.actual_paid_amount)
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            ref={(el) => {
                                                slipInputRefs.current[invoice.id] = el;
                                            }}
                                            type="file"
                                            accept="application/pdf,image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) uploadSlip(invoice, file);
                                            }}
                                        />
                                        {invoice.payment_status === 'paid' && invoice.payment_slip ? (
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setSlipPreview(invoice)}
                                                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                                                >
                                                    <FileText className="size-4" />
                                                    Slip
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            onClick={() => slipInputRefs.current[invoice.id]?.click()}
                                                        >
                                                            <Upload className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-destructive hover:text-destructive"
                                                            onClick={() => removeSlip(invoice)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        ) : invoice.payment_status === 'paid' && isAdmin ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => slipInputRefs.current[invoice.id]?.click()}
                                            >
                                                <Upload className="mr-1.5 size-3.5" />
                                                Slip
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                                        {money(invoice.invoice_total)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                                        {money(invoice.total_paid)}
                                    </td>
                                    <td
                                        className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${amountDueClass(invoice.payment_status)}`}
                                    >
                                        {invoice.payment_status === 'paid'
                                            ? '—'
                                            : money(invoice.amount_due)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        <Eye className="size-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a href={`/invoices/${invoice.id}/pdf`}>
                                                        <Download className="size-4" />
                                                        Download PDF
                                                    </a>
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/invoices/${invoice.id}/edit`}>
                                                                <Edit className="size-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteInvoice(invoice)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!slipPreview} onOpenChange={(open) => { if (!open) setSlipPreview(null); }}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            Payment Received Slip — {slipPreview?.invoice_number}
                        </DialogTitle>
                    </DialogHeader>
                    {slipPreview?.payment_slip && (
                        <iframe
                            src={`/storage/${slipPreview.payment_slip}`}
                            title="Payment Received Slip"
                            className="h-[70vh] w-full rounded-md border"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(status)}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {statusLabels[status]}
        </span>
    );
}

function statusBarClass(status: InvoiceStatus) {
    switch (status) {
        case 'draft':
            return 'bg-slate-400';
        case 'unpaid':
            return 'bg-amber-500';
        case 'partial':
            return 'bg-sky-500';
        case 'paid':
            return 'bg-emerald-500';
        case 'overdue':
            return 'bg-red-500';
    }
}

function amountDueClass(status: InvoiceStatus) {
    switch (status) {
        case 'overdue':
            return 'text-red-600 dark:text-red-400';
        case 'unpaid':
            return 'text-amber-600 dark:text-amber-400';
        case 'partial':
            return 'text-sky-600 dark:text-sky-400';
        default:
            return 'text-foreground';
    }
}
