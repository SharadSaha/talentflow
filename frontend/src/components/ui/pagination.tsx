import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PAGINATION_ELLIPSIS, getPageRange } from '@/utils/pagination';

export interface PaginationProps {
  /** The current (1-based) page. */
  page: number;
  /** Total number of pages available. */
  totalPages: number;
  /** Invoked with the requested page when the user navigates. */
  onPageChange: (page: number) => void;
  className?: string;
  /** Pages to show on each side of the current page (default 1). */
  siblingCount?: number;
}

/**
 * A ready-to-use pagination control with previous/next arrows, numbered pages,
 * and collapsed ellipses. Renders nothing when there is a single page or fewer.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageRange(page, totalPages, siblingCount);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Go to previous page"
        disabled={!canPrevious}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>

      {items.map((item, index) => {
        if (item === PAGINATION_ELLIPSIS) {
          return (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="flex size-9 items-center justify-center text-foreground-muted"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">More pages</span>
            </span>
          );
        }

        const isActive = item === page;
        return (
          <Button
            key={item}
            variant={isActive ? 'outline' : 'ghost'}
            size="icon"
            aria-label={`Go to page ${item}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(isActive && 'bg-primary/10 text-primary')}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        aria-label="Go to next page"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
