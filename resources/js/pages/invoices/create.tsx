import { useForm } from '@inertiajs/react';
import { InvoiceForm, invoiceToForm } from '@/pages/invoices/form';
import type { Client } from '@/types/invoice';

type Props = {
    clients: Client[];
    nextInvoiceNumber: string;
    defaults: {
        note: string;
    };
};

export default function CreateInvoice({
    clients,
    nextInvoiceNumber,
    defaults,
}: Props) {
    const form = useForm(invoiceToForm(undefined, defaults, nextInvoiceNumber));

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/invoices', { forceFormData: true });
    }

    return (
        <InvoiceForm
            form={form}
            clients={clients}
            title="Create Invoice"
            submitLabel="Save Invoice"
            onSubmit={submit}
        />
    );
}
