import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props = {
    url: string;
    initial?: string;
    placeholder?: string;
};

export default function TableSearch({ url, initial = '', placeholder = 'Search...' }: Props) {
    const [value, setValue] = useState(initial);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(url, { q: value || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="pl-8 pr-8"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => setValue('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
