import { useForm } from '@inertiajs/react';
import { DomainForm, domainToForm } from '@/pages/domains/form';
import type { Client } from '@/types/client';
import type { Domain } from '@/types/domain';

type Props = {
    domain: Domain;
    clients: Client[];
};

export default function EditDomain({ domain, clients }: Props) {
    const form = useForm(domainToForm(domain));

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.put(`/domains/${domain.id}`);
    }

    return (
        <DomainForm
            form={form}
            clients={clients}
            title="Edit Domain"
            submitLabel="Update Domain"
            onSubmit={submit}
        />
    );
}
