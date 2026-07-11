import { AlertTriangle, LayoutGrid, List, SearchX, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
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
import { useJobFilters } from '../hooks/useJobFilters';
import { useGetJobsQuery } from '../api/jobsApi';

/** Number of skeleton placeholders shown while the first page loads. */
const SKELETON_COUNT = 6;

type ViewMode = 'grid' | 'list';

/**
 * Candidate-facing job browsing: URL-driven keyword search, filters, sort,
 * grid/list view, and pagination. All list state lives in the URL via
 * {@link useJobFilters} so it survives refresh and is shareable.
 */
export default function BrowseJobsPage() {
  const {
    params,
    filters,
    sort,
    page,
    searchInput,
    activeFilterCount,
    setFilter,
    setSort,
    setPage,
    setSearch,
    clearFilters,
  } = useJobFilters();

  const { data, isLoading, isFetching, isError, refetch } = useGetJobsQuery(params);

  const [view, setView] = useState<ViewMode>('grid');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const hasActiveQuery = activeFilterCount > 0 || searchInput.trim() !== '';

  const resetAll = () => {
    clearFilters();
    setSearch('');
  };

  const gridClassName = cn(
    'grid gap-4',
    view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
  );

  const total = data?.meta.total ?? 0;

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className={gridClassName}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
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
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      );
    }

    if (!data || data.items.length === 0) {
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
      <div className={cn(gridClassName, isFetching && 'opacity-60 transition-opacity')}>
        {data.items.map((job) => (
          <JobCard key={job.id} job={job} layout={view} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sticky command bar — the page title and controls stay pinned while the
          job list below scrolls, so search context is never lost. */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/80 px-4 pb-4 pt-5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-h2">Browse Jobs</h1>
            <p className="text-small text-foreground-muted">
              Discover roles that match your skills.
            </p>
          </div>
          <p
            className="text-small font-medium tabular-nums text-foreground-muted"
            aria-live="polite"
          >
            {isLoading
              ? 'Loading jobs…'
              : `${formatNumber(total)} ${total === 1 ? 'job' : 'jobs'} found`}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </div>

      {/* Body: sticky filter rail on desktop, scrollable results. */}
      <div className="gap-6 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[8.75rem] rounded-lg border border-border bg-card p-4 shadow-elevation-low">
            <JobFilterPanel
              filters={filters}
              activeFilterCount={activeFilterCount}
              onFilterChange={setFilter}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {renderResults()}

          {data && data.meta.totalPages > 1 ? (
            <div className="flex justify-center pt-2">
              <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
