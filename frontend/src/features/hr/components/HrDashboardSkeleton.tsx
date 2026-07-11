import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder tile mirroring a {@link StatCard}. */
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-7 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  );
}

/** Placeholder card with a header and a set of body rows. */
function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Full-page loading state for the HR dashboard. Reserves the same layout as the
 * loaded page so content swaps in without shifting.
 */
export function HrDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <CardSkeleton rows={6} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>

      <CardSkeleton rows={1} />
    </div>
  );
}
