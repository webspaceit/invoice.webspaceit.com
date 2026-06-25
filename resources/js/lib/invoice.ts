import type { InvoiceStatus } from '@/types/invoice';

export const statusLabels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    unpaid: 'Unpaid',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
};

export function money(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

export function statusClass(status: InvoiceStatus) {
    const classes: Record<InvoiceStatus, string> = {
        draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        unpaid: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
        partial: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
        paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    };

    return classes[status];
}
