import { AlertTriangle, LayoutGrid, List, Loader2, SearchX, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { SearchBar } from '@/components/ui/search-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { JOB_SORT_OPTIONS } from '@/constants/job';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/JobCardSkeleton';
import { JobFilterPanel } from '../components/JobFilterPanel';
import { useInfiniteJobs } from '../hooks/useInfiniteJobs';

/** Skeleton placeholders shown while the first page loads. */
const INITIAL_SKELETON_COUNT = 6;
/** Skeletons appended while the next page streams in. */
const NEXT_PAGE_SKELETON_COUNT = 2;

type ViewMode = 'grid' | 'list';

/**
 * Candidate-facing job browsing: URL-driven keyword search, filters, sort, and
 * grid/list view, with infinite scrolling (Intersection Observer + accumulating
 * RTK Query cache). Filter/search/sort state lives in the URL so it survives
 * refresh and is shareable.
 */
export default function BrowseJobsPage() {
  const {
    filters,
    sort,
    searchInput,
    activeFilterCount,
    setFilter,
    setSort,
    setSearch,
    clearFilters,
    items,
    total,
    hasMore,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch,
    sentinelRef,
  } = useInfiniteJobs();

  const [view, setView] = useState<ViewMode>('grid');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const hasActiveQuery = activeFilterCount > 0 || searchInput.trim() !== '';

  const resetAll = () => {
    clearFilters();
    setSearch('');
  };

  const gridClassName = cn(
    'grid gap-4',
    view === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1',
  );

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className={gridClassName}>
          {Array.from({ length: INITIAL_SKELETON_COUNT }, (_, index) => (
            <JobCardSkeleton key={index} layout={view} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load jobs"
          description="Something went wrong while fetching jobs. Please try again."
          action={
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          }
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No jobs found"
          description={
            hasActiveQuery
              ? 'No jobs match your current search and filters. Try adjusting or clearing them.'
              : 'There are no published jobs right now. Please check back later.'
          }
          action={
            hasActiveQuery ? (
              <Button variant="outline" onClick={resetAll}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className={gridClassName}>
          {items.map((job) => (
            <JobCard key={job.id} job={job} layout={view} />
          ))}
          {isFetchingNextPage
            ? Array.from({ length: NEXT_PAGE_SKELETON_COUNT }, (_, index) => (
                <JobCardSkeleton key={`next-${index}`} layout={view} />
              ))
            : null}
        </div>

        {/* Sentinel: intersecting triggers the next page load. */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

        <p className="py-2 text-center text-caption text-foreground-muted" aria-live="polite">
          {isFetchingNextPage ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Loading more roles…
            </span>
          ) : hasMore ? (
            'Scroll to load more'
          ) : (
            "You've reached the end of the results."
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Jobs"
        description="Discover roles that match your skills and find your next opportunity."
      />

      <div className="gap-6 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-lg border border-border bg-card p-4 shadow-elevation-low">
            <JobFilterPanel
              filters={filters}
              activeFilterCount={activeFilterCount}
              onFilterChange={setFilter}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={searchInput}
              onChange={setSearch}
              placeholder="Search jobs by title, skill, or company…"
              aria-label="Search jobs"
              className="sm:max-w-sm"
            />

            <div className="flex items-center gap-2 sm:ml-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]" aria-label="Sort jobs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                className="flex items-center rounded-md border border-input"
                role="group"
                aria-label="View mode"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                  className={cn(view === 'grid' && 'bg-accent text-accent-foreground')}
                >
                  <LayoutGrid />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  onClick={() => setView('list')}
                  className={cn(view === 'list' && 'bg-accent text-accent-foreground')}
                >
                  <List />
                </Button>
              </div>

              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal />
                    Filters
                    {activeFilterCount > 0 ? (
                      <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-caption font-medium text-primary">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Narrow jobs by role, location, and pay.</SheetDescription>
                  </SheetHeader>
                  <JobFilterPanel
                    filters={filters}
                    activeFilterCount={activeFilterCount}
                    onFilterChange={setFilter}
                    onClear={clearFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <p className="text-small text-foreground-muted" aria-live="polite">
            {isLoading
              ? 'Loading jobs…'
              : `${formatNumber(total)} ${total === 1 ? 'job' : 'jobs'} found`}
          </p>

          {renderResults()}
        </div>
      </div>
    </div>
  );
}
