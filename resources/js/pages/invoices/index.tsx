import { Link, router, usePage } from '@inertiajs/react';
import { Download, Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { money, statusClass, statusLabels } from '@/lib/invoice';
import type { Invoice, Paginated } from '@/types/invoice';

type Props = {
    invoices: Paginated<Invoice>;
};

export default function InvoicesIndex({ invoices }: Props) {
    const { auth } = usePage().props;
    const isAdmin = auth.user && (auth.user.role === 'super_admin' || auth.user.role === 'admin');

    function deleteInvoice(invoice: Invoice) {
        if (confirm(`Delete invoice ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}`);
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
                    <table className="w-full min-w-[980px]">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">Invoice</th>
                                <th className="p-3 text-left">Client</th>
                                <th className="p-3 text-left">Due Date</th>
                                <th className="p-3 text-left">Status</th>
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
                                    <td className="p-3">{invoice.due_date}</td>
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
                                    <td className="p-3 text-right">
                                        {money(invoice.total_paid)}
                                    </td>
                                    <td className="p-3 text-right font-medium">
                                        {money(invoice.amount_due)}
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
        </div>
    );
}
