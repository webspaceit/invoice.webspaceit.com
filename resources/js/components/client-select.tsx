import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/invoice';

type Props = {
    clients: Client[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export function ClientSelect({ clients, value, onChange, error }: Props) {
    const [query, setQuery] = useState('');

    const selected = clients.find((c) => String(c.id) === value);

    const filtered = query
        ? clients.filter((c) => {
            const q = query.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                (c.company && c.company.toLowerCase().includes(q)) ||
                (c.designation && c.designation.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.phone && c.phone.toLowerCase().includes(q))
            );
        })
        : clients;

    return (
        <div className="space-y-2">
            <Combobox
                value={value}
                onChange={(val) => {
                    onChange(val);
                    setQuery('');
                }}
            >
                <div className="relative">
                    <Combobox.Input
                        displayValue={() => (selected ? `${selected.name}${selected.company ? `, ${selected.company}` : ''}` : '')}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search client..."
                        className={cn(
                            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="size-4 text-muted-foreground" />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
                        {filtered.length === 0 && query !== '' ? (
                            <div className="px-3 py-2 text-muted-foreground">
                                No clients found.
                            </div>
                        ) : (
                            filtered.map((client) => (
                                <Combobox.Option
                                    key={client.id}
                                    value={String(client.id)}
                                    className={({ active }) =>
                                        cn(
                                            'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
                                            active && 'bg-accent text-accent-foreground',
                                        )
                                    }
                                >
                                    {({ selected: isSelected }) => (
                                        <div className="flex w-full items-center justify-between">
                                    <div className="flex flex-col">
                                        <span>
                                            {client.name}
                                            {client.company ? `, ${client.company}` : ''}
                                        </span>
                                        {client.designation && (
                                            <span className="text-xs text-muted-foreground">{client.designation}</span>
                                        )}
                                    </div>
                                            {isSelected && (
                                                <Check className="size-4 text-primary" />
                                            )}
                                        </div>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </div>
            </Combobox>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
