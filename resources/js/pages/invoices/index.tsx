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
import type { Invoice, Paginated } from '@/types/invoice';

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

            <div className="overflow-hidden rounded-lg border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px]">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">Invoice</th>
                                <th className="p-3 text-left">Client</th>
                                <th className="p-3 text-left">Due Date</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Paid Date</th>
                                <th className="p-3 text-left">Slip</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-right">Paid</th>
                                <th className="p-3 text-right">Due</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id} className="border-t">
                                    <td className="p-3 font-medium">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="p-3">
                                        <div>{invoice.client.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {invoice.client.company ?? ''}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {invoice.payment_status === 'paid'
                                            ? '—'
                                            : formatDate(invoice.due_date)}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(invoice.payment_status)}`}
                                        >
                                            {statusLabels[invoice.payment_status]}
                                        </span>
                                    </td>
                                    <td className="p-3">{formatDate(invoice.paid_date) || '—'}</td>
                                    <td className="p-3">
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
                                    <td className="p-3 text-right">
                                        {money(invoice.invoice_total)}
                                    </td>
                                    <td className="p-3 text-right">
                                        {money(invoice.total_paid)}
                                    </td>
                                    <td className="p-3 text-right font-medium">
                                        {invoice.payment_status === 'paid'
                                            ? '—'
                                            : money(invoice.amount_due)}
                                    </td>
                                    <td className="p-3 text-right">
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
