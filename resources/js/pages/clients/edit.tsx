import { useForm } from '@inertiajs/react';
import { ClientForm, clientToForm } from '@/pages/clients/form';
import type { Client } from '@/types/invoice';

type Props = {
    client: Client;
};

export default function EditClient({ client }: Props) {
    const form = useForm(clientToForm(client));

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.put(`/clients/${client.id}`);
    }

    return (
        <ClientForm
            form={form}
            title="Edit Client"
            submitLabel="Update Client"
            onSubmit={submit}
        />
    );
}
