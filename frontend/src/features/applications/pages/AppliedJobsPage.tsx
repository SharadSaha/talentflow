import { AlertTriangle, Clock, FileText, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { StatusBadge } from '@/components/ui/status-badge';
import {
  APPLICATION_STATUS_FILTER_OPTIONS,
  APPLICATION_STATUS_META,
  isWithdrawable,
  type ApplicationStatus,
} from '@/constants/application-status';
import { candidateJobDetailsPath, ROUTES } from '@/constants/routes';
import { useGetMyApplicationsQuery } from '@/features/applications/api/applicationsApi';
import { ApplicationStatusTimeline } from '@/features/applications/components/ApplicationStatusTimeline';
import { WithdrawApplicationDialog } from '@/features/applications/components/WithdrawApplicationDialog';
import type { Application, MyApplicationsParams } from '@/types/application';
import type { SortOrder } from '@/types/pagination';
import { formatDate, formatRelativeTime } from '@/utils/date';
import type { SelectOption } from '@/utils/options';

const PAGE_SIZE = 10;

/** Sentinel select value representing "no status filter". */
const ALL_STATUSES = 'ALL';
type StatusFilter = ApplicationStatus | typeof ALL_STATUSES;

/** Sort options mapped to the backend's `sortBy:sortOrder` whitelist. */
const APPLICATION_SORT_OPTIONS: SelectOption<string>[] = [
  { value: 'createdAt:desc', label: 'Recently applied' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'status:asc', label: 'Status' },
];
const DEFAULT_APPLICATION_SORT = APPLICATION_SORT_OPTIONS[0].value;

function parseSort(value: string): { sortBy: string; sortOrder: SortOrder } {
  const [sortBy, sortOrder] = value.split(':');
  return { sortBy, sortOrder: sortOrder === 'asc' ? 'asc' : 'desc' };
}

export default function AppliedJobsPage() {
  const [status, setStatus] = useState<StatusFilter>(ALL_STATUSES);
  const [sort, setSort] = useState<string>(DEFAULT_APPLICATION_SORT);
  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);
  const [timelineTarget, setTimelineTarget] = useState<Application | null>(null);

  const { sortBy, sortOrder } = parseSort(sort);
  const params: MyApplicationsParams = {
    page,
    limit: PAGE_SIZE,
    sortBy,
    sortOrder,
    ...(status === ALL_STATUSES ? {} : { status }),
  };

  const { data, isLoading, isError, refetch } = useGetMyApplicationsQuery(params);

  const handleStatusChange = (value: string): void => {
    setStatus(value as StatusFilter);
    setPage(1);
  };

  const handleSortChange = (value: string): void => {
    setSort(value);
    setPage(1);
  };

  const items = data?.items ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = normalizedQuery
    ? items.filter(
        (application) =>
          application.job.title.toLowerCase().includes(normalizedQuery) ||
          application.job.company.name.toLowerCase().includes(normalizedQuery),
      )
    : items;

  const isFiltered = status !== ALL_STATUSES || normalizedQuery !== '';

  const clearFilters = (): void => {
    setStatus(ALL_STATUSES);
    setQuery('');
    setPage(1);
  };

  const columns: DataTableColumn<Application>[] = [
    {
      key: 'job',
      header: 'Job',
      cell: (application) => (
        <div className="flex flex-col gap-0.5">
          <Link
            to={candidateJobDetailsPath(application.job.id)}
            className="text-small font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {application.job.title}
          </Link>
          <span className="text-caption text-foreground-muted">{application.job.company.name}</span>
        </div>
      ),
    },
    {
      key: 'appliedAt',
      header: 'Applied',
      cell: (application) => (
        <span className="whitespace-nowrap text-small text-foreground-secondary">
          {formatDate(application.appliedAt)}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last update',
      cell: (application) => (
        <span className="whitespace-nowrap text-small text-foreground-muted">
          {formatRelativeTime(application.updatedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (application) => {
        const meta = APPLICATION_STATUS_META[application.status];
        return <StatusBadge intent={meta.intent} label={meta.label} />;
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (application) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View status timeline for ${application.job.title}`}
            onClick={() => setTimelineTarget(application)}
          >
            <Clock className="size-4" aria-hidden="true" />
          </Button>
          {isWithdrawable(application.status) ? (
            <Button variant="outline" size="sm" onClick={() => setWithdrawTarget(application)}>
              Withdraw
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const emptyState = isFiltered ? (
    <EmptyState
      icon={FileText}
      title="No matching applications"
      description="No applications match your current filters. Try adjusting or clearing them."
      action={
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={FileText}
      title="No applications yet"
      description="You haven't applied to any jobs. Browse open roles and submit your first application."
      action={
        <Button asChild>
          <Link to={ROUTES.CANDIDATE.JOBS}>Browse jobs</Link>
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applied Jobs"
        description="Track the status of every role you've applied to and withdraw applications you no longer want to pursue."
      />

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-danger/10 p-3">
              <AlertTriangle className="size-6 text-danger" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-body font-medium text-foreground">
                We couldn't load your applications
              </p>
              <p className="max-w-sm text-small text-foreground-muted">
                Something went wrong while fetching your applications. Please try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Filter by job or company"
              aria-label="Filter applications on this page by job or company"
              className="sm:max-w-xs"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="sm:w-48" aria-label="Filter applications by status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                  {APPLICATION_STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="sm:w-48" aria-label="Sort applications">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable<Application>
            columns={columns}
            data={visibleItems}
            getRowId={(application) => application.id}
            isLoading={isLoading}
            emptyState={emptyState}
            pagination={
              data && data.meta.totalPages > 1
                ? { page, totalPages: data.meta.totalPages, onPageChange: setPage }
                : undefined
            }
          />
        </div>
      )}

      <WithdrawApplicationDialog
        application={withdrawTarget}
        open={withdrawTarget !== null}
        onOpenChange={(open) => {
          if (!open) setWithdrawTarget(null);
        }}
      />

      <Dialog
        open={timelineTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTimelineTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          {timelineTarget ? (
            <>
              <DialogHeader>
                <DialogTitle>{timelineTarget.job.title}</DialogTitle>
                <DialogDescription>{timelineTarget.job.company.name}</DialogDescription>
              </DialogHeader>
              <ApplicationStatusTimeline application={timelineTarget} className="pt-2" />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
