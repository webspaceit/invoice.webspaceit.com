import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { money, statusClass, statusLabels } from '@/lib/invoice';
import { dashboard } from '@/routes';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

type Props = {
    summary: {
        total_invoices: number;
        invoice_total: number;
        paid_amount: number;
        due_amount: number;
        overdue_invoices: number;
    };
    statusBreakdown: {
        payment_status: InvoiceStatus;
        total: number;
    }[];
    recentInvoices: Invoice[];
    isSuperAdmin: boolean;
};

export default function Dashboard({
    summary,
    statusBreakdown,
    recentInvoices,
    isSuperAdmin,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Invoice performance and recent billing activity.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Metric label="Invoices" value={summary.total_invoices} />
                    <Metric label="Billed" value={money(summary.invoice_total)} />
                    <Metric label="Paid" value={money(summary.paid_amount)} />
                    <Metric label="Due" value={money(summary.due_amount)} />
                    <Metric label="Overdue" value={summary.overdue_invoices} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_200px]">
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-sm font-semibold">Recent Invoices</h2>
                            <p className="text-xs text-muted-foreground">
                                {recentInvoices.length} invoice{recentInvoices.length === 1 ? '' : 's'} listed
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground [&_th]:border-l [&_th]:border-border [&_th]:first:border-l-0">
                                        <th className="px-4 py-3 font-semibold">Invoice</th>
                                        <th className="px-4 py-3 font-semibold">Client</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                                        <th className="px-4 py-3 text-right font-semibold">Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border [&_td]:border-l [&_td]:border-border [&_td]:first:border-l-0">
                                    {recentInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">
                                                <FileText className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                                No invoices found yet.
                                            </td>
                                        </tr>
                                    )}
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3 font-medium">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="font-mono text-[13px] font-semibold text-foreground transition-colors hover:text-primary"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{invoice.client.name}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={invoice.payment_status} />
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {money(invoice.invoice_total)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                {money(invoice.amount_due)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <h2 className="font-semibold">Payment Status</h2>
                        <div className="mt-4 space-y-3">
                            {statusBreakdown.map((item) => (
                                <div
                                    key={item.payment_status}
                                    className="flex items-center justify-between"
                                >
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.payment_status)}`}
                                    >
                                        {statusLabels[item.payment_status]}
                                    </span>
                                    <span className="font-semibold">{item.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};