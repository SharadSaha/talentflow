import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { HiringFunnelCard } from '@/features/hr/components/HiringFunnelCard';
import { HrDashboardSkeleton } from '@/features/hr/components/HrDashboardSkeleton';
import { HrQuickActions } from '@/features/hr/components/HrQuickActions';
import { HrStatGrid } from '@/features/hr/components/HrStatGrid';
import { JobsStatusCard } from '@/features/hr/components/JobsStatusCard';
import { RecentApplicationsCard } from '@/features/hr/components/RecentApplicationsCard';
import { RecentJobsCard } from '@/features/hr/components/RecentJobsCard';
import { StatusDistributionCard } from '@/features/hr/components/StatusDistributionCard';
import { TopPerformingJobCard } from '@/features/hr/components/TopPerformingJobCard';
import { useGetHrDashboardQuery } from '@/features/hr/api/hrDashboardApi';
import { useAuth } from '@/hooks/useAuth';

/** Builds a personalised greeting for the dashboard subtitle. */
function buildSubtitle(firstName: string | undefined): string {
  return firstName
    ? `Welcome back, ${firstName}. Here's your hiring overview.`
    : "Here's your hiring overview.";
}

/**
 * HR home: an at-a-glance view of the recruiter's jobs, applicant pipeline, and
 * recent activity. Handles its own loading, error, and empty states.
 */
export default function HrDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetHrDashboardQuery();
  const subtitle = buildSubtitle(user?.firstName);

  if (isLoading) {
    return <HrDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description={subtitle} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="rounded-full bg-danger/10 p-3 text-danger">
              <AlertTriangle className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-body font-medium text-foreground">
                We couldn't load your dashboard
              </p>
              <p className="max-w-sm text-small text-foreground-muted">
                Something went wrong while fetching your overview. Please try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={subtitle} />

      <HrStatGrid dashboard={data} />

      <HiringFunnelCard breakdown={data.applicantStatusBreakdown} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusDistributionCard
          breakdown={data.applicantStatusBreakdown}
          total={data.totalApplicants}
        />
        <JobsStatusCard dashboard={data} />
      </div>

      {data.topPerformingJob ? <TopPerformingJobCard job={data.topPerformingJob} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentApplicationsCard applications={data.recentApplications} />
        <RecentJobsCard jobs={data.recentJobs} />
      </div>

      <HrQuickActions />
    </div>
  );
}
