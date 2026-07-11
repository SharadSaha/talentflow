import { AlertTriangle, Filter, SlidersHorizontal, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  APPLICATION_STATUS_FILTER_OPTIONS,
  APPLICATION_STATUS_META,
} from '@/constants/application-status';
import { EDUCATION_LEVEL_LABELS } from '@/constants/education';
import { JOB_STATUS_META } from '@/constants/job-status';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { ApplicantDrawer } from '@/features/hr/components/ApplicantDrawer';
import { ApplicantsFilterPanel } from '@/features/hr/components/ApplicantsFilterPanel';
import {
  useGetHrApplicantsQuery,
  useGetJobApplicantsQuery,
} from '@/features/hr/api/hrApplicantsApi';
import { useGetHrJobsQuery } from '@/features/hr/api/hrJobsApi';
import {
  APPLICANT_SORT_OPTIONS,
  useApplicantFilters,
} from '@/features/hr/hooks/useApplicantFilters';
import type { Applicant } from '@/types/applicant';
import { formatDate } from '@/utils/date';
import { getInitials } from '@/utils/format';
import { formatExperienceMonths } from '@/utils/job-format';

/** Sentinel value for the "All statuses" option (Radix disallows empty item values). */
const ALL_STATUS_VALUE = 'ALL';

/** Sentinel value for the default "All Jobs" selection (applicants across every job). */
const ALL_JOBS_VALUE = 'ALL_JOBS';

/** Max HR jobs loaded for the job selector. */
const JOB_SELECTOR_LIMIT = 100;

const EMPTY_VALUE = '—';

/** Builds the typed column set for the applicant board, optionally including the job. */
function useApplicantColumns(includeJob: boolean): DataTableColumn<Applicant>[] {
  return useMemo(() => {
    const columns: DataTableColumn<Applicant>[] = [
      {
        key: 'candidate',
        header: 'Candidate',
        cell: (applicant) => {
          const { candidate } = applicant;
          const fullName = `${candidate.firstName} ${candidate.lastName}`;
          const subtitle = candidate.headline ?? candidate.currentTitle;
          return (
            <div className="flex items-center gap-3">
              <Avatar size="md">
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground">{fullName}</span>
                {subtitle ? (
                  <span className="truncate text-caption text-foreground-muted">{subtitle}</span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        key: 'company',
        header: 'Current company',
        cell: (applicant) => applicant.candidate.currentCompany ?? EMPTY_VALUE,
      },
      {
        key: 'education',
        header: 'Education',
        cell: (applicant) =>
          applicant.candidate.highestEducation
            ? EDUCATION_LEVEL_LABELS[applicant.candidate.highestEducation]
            : EMPTY_VALUE,
      },
      {
        key: 'experience',
        header: 'Experience',
        cell: (applicant) => formatExperienceMonths(applicant.candidate.totalExperienceMonths),
      },
      {
        key: 'location',
        header: 'Location',
        cell: (applicant) => applicant.candidate.currentLocation ?? EMPTY_VALUE,
      },
      {
        key: 'applied',
        header: 'Applied',
        cell: (applicant) => formatDate(applicant.appliedAt),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (applicant) => {
          const meta = APPLICATION_STATUS_META[applicant.status];
          return <StatusBadge intent={meta.intent} label={meta.label} />;
        },
      },
    ];

    if (!includeJob) return columns;

    // In the "All Jobs" view, show which job each applicant applied to.
    const jobColumn: DataTableColumn<Applicant> = {
      key: 'job',
      header: 'Job',
      cell: (applicant) => (
        <span className="font-medium text-foreground">{applicant.job.title}</span>
      ),
    };
    return [columns[0], jobColumn, ...columns.slice(1)];
  }, [includeJob]);
}

/**
 * The HR applicant board. Defaults to "All Jobs" — applicants across every job
 * the recruiter owns — and can be scoped to a single job. Search, filters, sort,
 * and pagination apply to the active scope; a details drawer (with the
 * status-update flow) opens per row. The page fills the viewport; only the
 * applicant table scrolls.
 */
export default function ApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = searchParams.get('job') ?? ALL_JOBS_VALUE;
  const isAllJobs = selection === ALL_JOBS_VALUE;
  const jobId = isAllJobs ? '' : selection;

  const { data: jobsData, isLoading: isJobsLoading } = useGetHrJobsQuery({
    limit: JOB_SELECTOR_LIMIT,
  });

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
  } = useApplicantFilters(selection);

  const jobQuery = useGetJobApplicantsQuery({ ...params, jobId }, { skip: isAllJobs || !jobId });
  const allJobsQuery = useGetHrApplicantsQuery(params, { skip: !isAllJobs });
  const { data, isLoading, isFetching, isError, refetch } = isAllJobs ? allJobsQuery : jobQuery;

  const columns = useApplicantColumns(isAllJobs);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const jobs = jobsData?.items ?? [];
  const applicants = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const hasQueryConstraints = activeFilterCount > 0 || Boolean(params.keyword);

  const handleSelectionChange = (nextSelection: string) => {
    // Changing scope clears the previous board's filters, search, and page.
    if (nextSelection === ALL_JOBS_VALUE) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ job: nextSelection }, { replace: true });
    }
  };

  const handleRowClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsDrawerOpen(true);
  };

  const tableEmptyState = hasQueryConstraints ? (
    <EmptyState
      icon={Filter}
      title="No matching applicants"
      description="No applicants match the current search and filters."
      action={
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Users}
      title="No applicants yet"
      description={
        isAllJobs
          ? 'Applications across your jobs will appear here as candidates apply.'
          : 'Applications for this job will appear here as candidates apply.'
      }
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PageHeader
        title="Applicants"
        description="Review and advance candidates across your jobs."
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <Label htmlFor="applicants-job-selector">Job</Label>
            <Select
              value={selection}
              onValueChange={handleSelectionChange}
              disabled={isJobsLoading}
            >
              <SelectTrigger
                id="applicants-job-selector"
                aria-label="Select a job"
                className="w-full lg:w-80"
              >
                <SelectValue placeholder={isJobsLoading ? 'Loading jobs…' : 'All Jobs'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_JOBS_VALUE}>All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} · {JOB_STATUS_META[job.status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SearchBar
            value={searchInput}
            onChange={setSearch}
            placeholder="Search name, email, college, company, skills…"
            aria-label="Search applicants"
            className="lg:max-w-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status || ALL_STATUS_VALUE}
            onValueChange={(value) => setFilter('status', value === ALL_STATUS_VALUE ? '' : value)}
          >
            <SelectTrigger aria-label="Filter by status" className="w-[11rem]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS_VALUE}>All statuses</SelectItem>
              {APPLICATION_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort applicants" className="w-[12rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICANT_SORT_OPTIONS.map((option) => (
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
                  <Badge variant="primary">{activeFilterCount}</Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter applicants</SheetTitle>
                <SheetDescription>
                  Narrow the board by profile attributes and experience.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <ApplicantsFilterPanel filters={filters} onFilterChange={setFilter} />
              </div>

              <SheetFooter>
                <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0}>
                  Clear all
                </Button>
                <Button variant="primary" onClick={() => setIsFilterSheetOpen(false)}>
                  Done
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col">
          <CardContent className="flex min-h-0 flex-1 flex-col py-4">
            {isError ? (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  icon={AlertTriangle}
                  title="Couldn't load applicants"
                  description="Something went wrong while fetching applicants."
                  action={
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Try again
                    </Button>
                  }
                />
              </div>
            ) : (
              <div
                className={
                  isFetching && !isLoading
                    ? 'flex min-h-0 flex-1 flex-col opacity-60 transition-opacity'
                    : 'flex min-h-0 flex-1 flex-col'
                }
                aria-busy={isFetching || undefined}
              >
                <DataTable<Applicant>
                  columns={columns}
                  data={applicants}
                  getRowId={(applicant) => applicant.id}
                  isLoading={isLoading}
                  emptyState={tableEmptyState}
                  onRowClick={handleRowClick}
                  fillHeight
                  pagination={{ page, totalPages, onPageChange: setPage }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApplicantDrawer
        applicant={selectedApplicant}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}
