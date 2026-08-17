import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/invoice';

type Props<T> = {
    paginated: Paginated<T>;
};

export default function Pagination<T>({ paginated }: Props<T>) {
    const { current_page, last_page, links } = paginated;

    if (last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                Page {current_page} of {last_page}
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={i}
                                className="inline-flex size-9 items-center justify-center rounded-md text-sm text-muted-foreground/50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    return (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'ghost'}
                            size="icon"
                            asChild
                        >
                            <Link href={link.url} preserveState>
                                {isPrev ? (
                                    <ChevronLeft className="size-4" />
                                ) : isNext ? (
                                    <ChevronRight className="size-4" />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
