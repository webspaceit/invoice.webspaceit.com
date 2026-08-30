import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/invoice';

type Props<T> = {
    paginated: Paginated<T>;
};

export default function Pagination<T>({ paginated }: Props<T>) {
    const { last_page, links } = paginated;

    if (last_page <= 1) return null;

    return (
        <div className="mb-4 mt-4 flex flex-wrap items-center justify-center gap-1">
            {links.map((link, i) => {
                const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                let content: React.ReactNode = (
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                );

                if (isPrev) {
                    content = <ChevronLeft className="size-4" />;
                } else if (isNext) {
                    content = <ChevronRight className="size-4" />;
                }

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveState
                        className={cn(
                            'inline-flex min-w-9 items-center justify-center rounded px-3 py-1.5 text-sm transition-colors',
                            link.active
                                ? 'bg-primary text-white'
                                : link.url
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'cursor-not-allowed bg-gray-50 text-gray-300',
                        )}
                        tabIndex={link.url ? 0 : -1}
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
