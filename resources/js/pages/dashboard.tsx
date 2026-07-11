import { Head, Link } from '@inertiajs/react';
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
};

export default function Dashboard({
    summary,
    statusBreakdown,
    recentInvoices,
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
                    <div className="overflow-hidden rounded-lg border bg-card">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Recent Invoices</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-3 text-left">Invoice</th>
                                        <th className="p-3 text-left">Client</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-right">Total</th>
                                        <th className="p-3 text-right">Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-t">
                                            <td className="p-3 font-medium">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="p-3">{invoice.client.name}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(invoice.payment_status)}`}
                                                >
                                                    {statusLabels[invoice.payment_status]}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                {money(invoice.invoice_total)}
                                            </td>
                                            <td className="p-3 text-right font-medium">
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};