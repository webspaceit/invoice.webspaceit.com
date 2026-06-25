import { useForm } from '@inertiajs/react';
import { ClientForm, clientToForm } from '@/pages/clients/form';

export default function CreateClient() {
    const form = useForm(clientToForm());

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/clients');
    }

    return (
        <ClientForm
            form={form}
            title="Add Client"
            submitLabel="Save Client"
            onSubmit={submit}
        />
    );
}
