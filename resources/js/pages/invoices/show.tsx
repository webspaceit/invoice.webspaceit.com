import { Link, usePage } from '@inertiajs/react';
import { FileText, Download, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, money, statusClass, statusLabels } from '@/lib/invoice';
import type { Invoice } from '@/types/invoice';

type Props = {
    invoice: Invoice;
};

export default function ShowInvoice({ invoice }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin');

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {invoice.invoice_number}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {invoice.client.name}
                        {invoice.client.company ? `, ${invoice.client.company}` : ''}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <a href={`/invoices/${invoice.id}/pdf?preview=1`} target="_blank" rel="noreferrer noopener">
                            <Eye className="mr-2 size-4" />
                            Preview PDF
                        </a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href={`/invoices/${invoice.id}/pdf`}>
                            <Download className="mr-2 size-4" />
                            Download PDF
                        </a>
                    </Button>
                    {isAdmin && (
                        <Button asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Metric label="Invoice Total" value={money(invoice.invoice_total)} />
                <Metric label="Total Paid" value={money(invoice.total_paid)} />
                {invoice.payment_status !== 'paid' && (
                    <Metric label="Amount Due" value={money(invoice.amount_due)} />
                )}
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(invoice.payment_status)}`}
                    >
                        {statusLabels[invoice.payment_status]}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="overflow-hidden rounded-lg border bg-card">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">No.</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-right">Qty.</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={item.id ?? index} className="border-t">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{item.description}</td>
                                    <td className="p-3 text-right">
                                        {money(item.unit_amount)}
                                    </td>
                                    <td className="p-3 text-right">{item.quantity}</td>
                                    <td className="p-3 text-right font-medium">
                                        {money(item.line_total!)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-3 rounded-lg border bg-card p-4">
                    <SummaryRow label="Sub Total" value={money(invoice.subtotal)} />
                    <SummaryRow
                        label="Discount"
                        value={money(invoice.discount_amount)}
                    />
                    <SummaryRow
                        label={`Tax (${invoice.tax_rate}%)`}
                        value={money(invoice.tax_amount)}
                    />
                    <SummaryRow
                        label="Invoice Total"
                        value={money(invoice.invoice_total)}
                        strong
                    />
                    <SummaryRow
                        label="Total Paid"
                        value={money(invoice.total_paid)}
                    />
                    {invoice.paid_date && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Paid Date</span>
                            <span>{formatDate(invoice.paid_date)}</span>
                        </div>
                    )}
                    {invoice.payment_method && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span>{invoice.payment_method}</span>
                        </div>
                    )}
                    {invoice.actual_paid_amount !== null && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Actual Payment Received</span>
                            <span>{money(invoice.actual_paid_amount)}</span>
                        </div>
                    )}
                    {invoice.payment_status !== 'paid' && (
                        <SummaryRow
                            label="Amount Due"
                            value={money(invoice.amount_due)}
                            strong
                        />
                    )}
                    {invoice.payment_slip && (
                        <div className="flex items-center justify-between border-t pt-3 text-sm">
                            <span className="text-muted-foreground">Payment Slip</span>
                            <a
                                href={`/storage/${invoice.payment_slip}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex max-w-[180px] items-center gap-1.5 truncate font-medium text-primary underline-offset-4 hover:underline"
                            >
                                <FileText className="size-4 shrink-0" />
                                {invoice.payment_slip.split('/').pop()}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {invoice.payment_slip && (
                <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
                        <h2 className="font-semibold">Payment Received Slip</h2>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`/storage/${invoice.payment_slip}`}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                <Download className="mr-2 size-4" />
                                Open in New Tab
                            </a>
                        </Button>
                    </div>
                    <iframe
                        src={`/storage/${invoice.payment_slip}`}
                        title="Payment Received Slip"
                        className="h-[600px] w-full"
                    />
                </div>
            )}
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
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
