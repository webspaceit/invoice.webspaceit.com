import { useForm } from '@inertiajs/react';
import { DomainForm, domainToForm } from '@/pages/domains/form';
import type { Client } from '@/types/client';

type Props = {
    clients: Client[];
};

export default function CreateDomain({ clients }: Props) {
    const form = useForm(domainToForm());

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/domains');
    }

    return (
        <DomainForm
            form={form}
            clients={clients}
            title="Add Domain"
            submitLabel="Save Domain"
            onSubmit={submit}
        />
    );
}
