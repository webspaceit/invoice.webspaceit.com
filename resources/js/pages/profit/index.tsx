import { FormEvent, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDate, money } from '@/lib/invoice';
import Pagination from '@/components/pagination';
import type { Invoice, Paginated } from '@/types/invoice';

type Props = {
    invoices: Paginated<Invoice>;
    summary: {
        revenue: number;
        cost: number;
        profit: number;
        invoice_count: number;
    };
    clients: { id: number; name: string; company: string | null }[];
    filters: {
        client_id?: string;
        from?: string;
        to?: string;
    };
};

export default function ProfitIndex({ invoices, summary, clients, filters }: Props) {
    const [clientId, setClientId] = useState(filters.client_id ?? 'all');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/profit',
            {
                client_id: clientId === 'all' ? undefined : clientId,
                from: from || undefined,
                to: to || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters() {
        setClientId('all');
        setFrom('');
        setTo('');
        router.get('/profit', {}, { preserveState: true, preserveScroll: true });
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">Profit</h1>
                <p className="text-sm text-muted-foreground">
                    Profit from paid invoices only. Profit is calculated automatically as the
                    selling price minus the cost price entered on each line item.
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                <SummaryCard
                    icon={<Wallet className="h-5 w-5" />}
                    label="Revenue (paid)"
                    value={money(summary.revenue)}
                    variant="green"
                />
                <SummaryCard
                    icon={<Coins className="h-5 w-5" />}
                    label="Cost (line items)"
                    value={money(summary.cost)}
                    variant="slate"
                />
                <SummaryCard
                    icon={
                        summary.profit >= 0 ? (
                            <TrendingUp className="h-5 w-5" />
                        ) : (
                            <TrendingDown className="h-5 w-5" />
                        )
                    }
                    label="Net Profit"
                    value={money(summary.profit)}
                    variant={summary.profit >= 0 ? 'green' : 'red'}
                />
                <SummaryCard
                    icon={<span className="text-sm font-bold">{summary.invoice_count}</span>}
                    label="Paid Invoices"
                    value={String(summary.invoice_count)}
                    variant="slate"
                />
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                    <h2 className="text-sm font-semibold">Paid Invoices</h2>
                    <p className="text-xs text-muted-foreground">
                        {summary.invoice_count} paid invoice{summary.invoice_count === 1 ? '' : 's'}
                    </p>
                </div>

                {/* Filters */}
                <form
                    onSubmit={applyFilters}
                    className="flex flex-wrap items-end gap-3 border-b bg-muted/30 px-4 py-3"
                >
                    <div className="min-w-[200px] space-y-1">
                        <Label className="text-xs">Client</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All clients" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All clients</SelectItem>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={String(client.id)}>
                                        {client.company ? `${client.name} — ${client.company}` : client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Paid from</Label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Paid to</Label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit">Apply</Button>
                        <Button type="button" variant="outline" onClick={resetFilters}>
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px] text-sm">
                        <thead>
                            <tr className="border-b bg-primary text-white">
                                <th className="px-4 py-3 text-left">Sl.</th>
                                <th className="px-4 py-3 text-left">Invoice</th>
                                <th className="px-4 py-3 text-left">Client</th>
                                <th className="px-4 py-3 text-left">Paid Date</th>
                                <th className="px-4 py-3 text-right">Revenue</th>
                                <th className="px-4 py-3 text-right">Cost</th>
                                <th className="px-4 py-3 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        <Coins className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                                        No paid invoices found for these filters.
                                    </td>
                                </tr>
                            )}
                            {invoices.data.map((invoice, index) => {
                                const revenue = Number(invoice.subtotal || 0);
                                const cost = Number(invoice.cost_total || 0);
                                const profit = Number(invoice.profit || 0);

                                return (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-gray-50">
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {invoices.from !== null ? invoices.from + index : index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={`/invoices/${invoice.id}`}
                                                className="font-mono text-[13px] font-semibold text-foreground transition-colors hover:text-primary"
                                            >
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{invoice.client.name}</div>
                                            {invoice.client.company && (
                                                <div className="text-xs text-muted-foreground">
                                                    {invoice.client.company}
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                            {formatDate(invoice.paid_date) || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {money(revenue)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {money(cost)}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-semibold tabular-nums ${
                                                profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                                            }`}
                                        >
                                            {money(profit)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination paginated={invoices} />
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    variant,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    variant: 'green' | 'red' | 'slate';
}) {
    const gradients: Record<typeof variant, string> = {
        green:
            'bg-gradient-to-br from-primary-500 to-primary-800 shadow-primary-500/20 hover:shadow-primary-500/30',
        red: 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/30',
        slate: 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/20 hover:shadow-slate-500/30',
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
