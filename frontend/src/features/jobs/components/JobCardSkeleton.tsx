import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface JobCardSkeletonProps {
  /** Matches the {@link JobCard} layout so loading state reserves the same space. */
  layout?: 'grid' | 'list';
  className?: string;
}

/**
 * A placeholder mirroring {@link JobCard} so the browse grid can show a loading
 * state without shifting layout once real jobs arrive.
 */
export function JobCardSkeleton({ layout = 'grid', className }: JobCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5',
        layout === 'list' && 'sm:flex sm:items-start sm:gap-5',
        className,
      )}
      aria-hidden="true"
    >
      <div className={cn('flex items-start gap-3', layout === 'list' && 'sm:flex-1')}>
        <Skeleton className="size-10 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'mt-4 flex items-center justify-between gap-2',
          layout === 'list' && 'sm:mt-0 sm:flex-col sm:items-end',
        )}
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}
