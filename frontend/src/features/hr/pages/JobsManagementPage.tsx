import { AlertTriangle, Briefcase, Columns3, Plus, SearchX, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { EMPLOYMENT_TYPE_LABELS, JOB_SORT_OPTIONS, WORK_MODE_LABELS } from '@/constants/job';
import { JOB_STATUS, JOB_STATUS_META, type JobStatus } from '@/constants/job-status';
import { hrApplicantsPath, ROUTES } from '@/constants/routes';
import { useGetHrJobsQuery } from '@/features/hr/api/hrJobsApi';
import { cn } from '@/lib/utils';
import type { Job } from '@/types/job';
import { formatDate } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { formatSalaryRange } from '@/utils/job-format';

import { JobRowActions } from '../components/JobRowActions';
import { JobsFilterPanel } from '../components/JobsFilterPanel';
import { useHrJobsFilters } from '../hooks/useHrJobsFilters';

/** Sentinel for the "All statuses" option, since Radix Select forbids empty item values. */
const ALL_STATUSES = '__all__';

const STATUS_FILTER_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: JOB_STATUS.DRAFT, label: JOB_STATUS_META[JOB_STATUS.DRAFT].label },
  { value: JOB_STATUS.PUBLISHED, label: JOB_STATUS_META[JOB_STATUS.PUBLISHED].label },
  { value: JOB_STATUS.CLOSED, label: JOB_STATUS_META[JOB_STATUS.CLOSED].label },
];

/** Optional (toggleable) column keys. Title, Status, and Actions are always shown. */
const OPTIONAL_COLUMNS = [
  'location',
  'employmentType',
  'workMode',
  'salary',
  'applicants',
  'createdAt',
  'updatedAt',
] as const;

type OptionalColumnKey = (typeof OPTIONAL_COLUMNS)[number];

type ColumnVisibility = Record<OptionalColumnKey, boolean>;

const COLUMN_LABELS: Record<OptionalColumnKey, string> = {
  location: 'Location',
  employmentType: 'Employment type',
  workMode: 'Work mode',
  salary: 'Salary',
  applicants: 'Applicants',
  createdAt: 'Created',
  updatedAt: 'Updated',
};

const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  location: true,
  employmentType: true,
  workMode: false,
  salary: true,
  applicants: true,
  createdAt: true,
  updatedAt: false,
};

/** Placeholder shown when an optional cell has no value. */
const EMPTY_CELL = '—';

/**
 * HR jobs management: a URL-driven ATS table of the recruiter's own jobs (any
 * status) with search, status/attribute filters, sort, column visibility,
 * pagination, and per-row actions. All list state lives in the URL via
 * {@link useHrJobsFilters} so it survives refresh and is shareable.
 */
export default function JobsManagementPage() {
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
  } = useHrJobsFilters();

  const { data, isLoading, isFetching, isError, refetch } = useGetHrJobsQuery(params);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);

  const hasActiveQuery =
    activeFilterCount > 0 || searchInput.trim() !== '' || filters.status !== '';

  const total = data?.meta.total ?? 0;

  const toggleColumn = (key: OptionalColumnKey) =>
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetAll = () => {
    clearFilters();
    setFilter('status', '');
    setSearch('');
  };

  const columns = useMemo<DataTableColumn<Job>[]>(() => {
    const isVisible = (key: OptionalColumnKey) => columnVisibility[key];

    const optional = (key: OptionalColumnKey, column: DataTableColumn<Job>) =>
      isVisible(key) ? [column] : [];

    return [
      {
        key: 'title',
        header: 'Title',
        cell: (job) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{job.title}</span>
            <span className="text-caption text-foreground-muted">{job.company.name}</span>
          </div>
        ),
      },
      ...optional('location', {
        key: 'location',
        header: 'Location',
        cell: (job) => job.location ?? EMPTY_CELL,
      }),
      ...optional('employmentType', {
        key: 'employmentType',
        header: 'Employment type',
        cell: (job) => EMPLOYMENT_TYPE_LABELS[job.employmentType],
      }),
      ...optional('workMode', {
        key: 'workMode',
        header: 'Work mode',
        cell: (job) => WORK_MODE_LABELS[job.workMode],
      }),
      ...optional('salary', {
        key: 'salary',
        header: 'Salary',
        cell: (job) =>
          formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod) ??
          EMPTY_CELL,
      }),
      ...optional('applicants', {
        key: 'applicants',
        header: 'Applicants',
        align: 'right',
        cell: (job) => (
          <Link
            to={hrApplicantsPath(job.id)}
            className="font-medium text-primary underline-offset-4 hover:underline"
            aria-label={`View ${formatNumber(job.applicationCount)} applicants for ${job.title}`}
          >
            {formatNumber(job.applicationCount)}
          </Link>
        ),
      }),
      {
        key: 'status',
        header: 'Status',
        cell: (job) => (
          <StatusBadge
            intent={JOB_STATUS_META[job.status].intent}
            label={JOB_STATUS_META[job.status].label}
          />
        ),
      },
      ...optional('createdAt', {
        key: 'createdAt',
        header: 'Created',
        cell: (job) => formatDate(job.createdAt),
      }),
      ...optional('updatedAt', {
        key: 'updatedAt',
        header: 'Updated',
        cell: (job) => formatDate(job.updatedAt),
      }),
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        cell: (job) => <JobRowActions job={job} />,
      },
    ];
  }, [columnVisibility]);

  const emptyState = isError ? (
    <EmptyState
      icon={AlertTriangle}
      title="Couldn't load jobs"
      description="Something went wrong while fetching your jobs. Please try again."
      action={
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      }
    />
  ) : hasActiveQuery ? (
    <EmptyState
      icon={SearchX}
      title="No matching jobs"
      description="No jobs match your current search and filters. Try adjusting or clearing them."
      action={
        <Button variant="outline" onClick={resetAll}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Briefcase}
      title="No jobs yet"
      description="Create your first job posting to start receiving applications."
      action={
        <Button asChild>
          <Link to={ROUTES.HR.JOB_NEW}>
            <Plus aria-hidden="true" />
            Create job
          </Link>
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage your job postings — track status, applicants, and details."
        actions={
          <Button asChild>
            <Link to={ROUTES.HR.JOB_NEW}>
              <Plus aria-hidden="true" />
              Create job
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar
            value={searchInput}
            onChange={setSearch}
            placeholder="Search by title, location, or skill…"
            aria-label="Search jobs"
            className="lg:max-w-sm"
          />

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={filters.status || ALL_STATUSES}
              onValueChange={(value) => setFilter('status', value === ALL_STATUSES ? '' : value)}
            >
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal aria-hidden="true" />
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
                  <SheetDescription>
                    Narrow jobs by location, type, and salary range.
                  </SheetDescription>
                </SheetHeader>
                <JobsFilterPanel
                  filters={filters}
                  activeFilterCount={activeFilterCount}
                  onFilterChange={setFilter}
                  onClear={clearFilters}
                />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Toggle columns">
                  <Columns3 aria-hidden="true" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {OPTIONAL_COLUMNS.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={columnVisibility[key]}
                    onCheckedChange={() => toggleColumn(key)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {COLUMN_LABELS[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-small text-foreground-muted" aria-live="polite">
          {isLoading ? 'Loading jobs…' : `${formatNumber(total)} ${total === 1 ? 'job' : 'jobs'}`}
        </p>

        <Card className="p-4">
          <div className={cn(isFetching && !isLoading && 'opacity-60 transition-opacity')}>
            <DataTable<Job>
              columns={columns}
              data={data?.items ?? []}
              getRowId={(job) => job.id}
              isLoading={isLoading}
              emptyState={emptyState}
              pagination={
                data && data.meta.totalPages > 1
                  ? { page, totalPages: data.meta.totalPages, onPageChange: setPage }
                  : undefined
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
