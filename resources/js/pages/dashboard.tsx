import { Head, Link } from '@inertiajs/react';
import { FileText, Wallet, Banknote, Clock, AlertTriangle, Receipt } from 'lucide-react';
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
            <div className="space-y-4 p-6 sm:space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-700">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Invoice performance and recent billing activity.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 sm:gap-6">
                    <Metric
                        icon={<Receipt className="h-5 w-5" />}
                        label={`Invoices (${summary.total_invoices})`}
                        value={String(summary.total_invoices)}
                        variant="green"
                    />
                    <Metric
                        icon={<Wallet className="h-5 w-5" />}
                        label="Billed"
                        value={money(summary.invoice_total)}
                        variant="green"
                    />
                    <Metric
                        icon={<Banknote className="h-5 w-5" />}
                        label="Paid"
                        value={money(summary.paid_amount)}
                        variant="green"
                    />
                    <Metric
                        icon={<Clock className="h-5 w-5" />}
                        label="Due"
                        value={money(summary.due_amount)}
                        variant="amber"
                    />
                    <Metric
                        icon={<AlertTriangle className="h-5 w-5" />}
                        label="Overdue"
                        value={String(summary.overdue_invoices)}
                        variant="red"
                    />
                </div>

                <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_320px]">
                    {/* Recent Invoices */}
                    <div className="overflow-hidden rounded-2xl bg-card shadow-lg">
                        <div className="rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white px-5 py-4">
                            <h2 className="text-lg font-bold text-primary-700">Recent Invoices</h2>
                            <p className="text-xs text-muted-foreground">
                                {recentInvoices.length} invoice{recentInvoices.length === 1 ? '' : 's'} listed
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b bg-primary text-white">
                                        <th className="px-4 py-3 text-left">Invoice</th>
                                        <th className="px-4 py-3 text-left">Client</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-right">Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                <FileText className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                                No invoices found yet.
                                            </td>
                                        </tr>
                                    )}
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-b transition-colors hover:bg-gray-50">
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

                    {/* Payment Status */}
                    <div className="overflow-hidden rounded-2xl bg-card shadow-lg">
                        <div className="rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white px-5 py-4">
                            <h2 className="text-lg font-bold text-primary-700">Payment Status</h2>
                        </div>
                        <div className="space-y-3 p-4 sm:p-5">
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
                                    <span className="font-bold text-primary-700">{item.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Metric({
    icon,
    label,
    value,
    variant,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    variant: 'green' | 'amber' | 'red';
}) {
    const gradients: Record<typeof variant, string> = {
        green:
            'bg-gradient-to-br from-primary-500 to-primary-800 shadow-primary-500/20 hover:shadow-primary-500/30',
        amber:
            'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-400/20 hover:shadow-amber-400/30',
        red: 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/30',
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl p-4 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:p-6 ${gradients[variant]}`}
        >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/5"></div>
            <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    {icon}
                </div>
                <p className="text-xs font-medium text-white/80 sm:text-sm">{label}</p>
                <p className="mt-1 text-2xl font-bold sm:text-3xl">{value}</p>
            </div>
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
