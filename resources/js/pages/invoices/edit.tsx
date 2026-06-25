import { useForm } from '@inertiajs/react';
import { InvoiceForm, invoiceToForm } from '@/pages/invoices/form';
import type { Client, Invoice } from '@/types/invoice';

type Props = {
    invoice: Invoice;
    clients: Client[];
    defaults: {
        note: string;
    };
};

export default function EditInvoice({ invoice, clients, defaults }: Props) {
    const form = useForm({
        ...invoiceToForm(invoice, defaults),
        _method: 'PUT',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/invoices/${invoice.id}`, {
            forceFormData: true,
        });
    }

    return (
        <InvoiceForm
            form={form}
            clients={clients}
            title="Edit Invoice"
            submitLabel="Update Invoice"
            onSubmit={submit}
            existingSignature={invoice.signature}
        />
    );
}
