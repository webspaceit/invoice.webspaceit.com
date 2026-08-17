import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/invoice';

type Props<T> = {
    paginated: Paginated<T>;
};

export default function Pagination<T>({ paginated }: Props<T>) {
    const { current_page, last_page, total, per_page, links } = paginated;

    if (last_page <= 1) return null;

    const from = (current_page - 1) * per_page + 1;
    const to = Math.min(current_page * per_page, total);

    const pageLinks = links.filter(
        (link) =>
            !link.label.includes('Previous') &&
            !link.label.includes('Next') &&
            !link.label.includes('&laquo;') &&
            !link.label.includes('&raquo;'),
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{from}</span> to{' '}
                <span className="font-medium text-foreground">{to}</span> of{' '}
                <span className="font-medium text-foreground">{total}</span> results
            </p>

            <nav className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isPrev =
                        link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext =
                        link.label.includes('Next') || link.label.includes('&raquo;');

                    if (isPrev || isNext) {
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={cn(
                                    'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all',
                                    link.url
                                        ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        : 'pointer-events-none text-muted-foreground/30',
                                )}
                                tabIndex={link.url ? 0 : -1}
                            >
                                {isPrev ? (
                                    <ChevronLeft className="size-4" />
                                ) : (
                                    <ChevronRight className="size-4" />
                                )}
                            </Link>
                        );
                    }

                    if (link.label === '...') {
                        return (
                            <span
                                key={i}
                                className="inline-flex size-9 items-center justify-center text-muted-foreground/50"
                            >
                                <MoreHorizontal className="size-4" />
                            </span>
                        );
                    }

                    if (link.url === null) {
                        return (
                            <span
                                key={i}
                                className="inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground/30"
                            >
                                {link.label}
                            </span>
                        );
                    }

                    const isActive = link.active;

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            className={cn(
                                'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
