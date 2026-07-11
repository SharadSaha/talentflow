import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useGetCandidateDashboardQuery } from '@/features/dashboard/api/dashboardApi';
import { DashboardJobsSection } from '@/features/dashboard/components/DashboardJobsSection';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { ProfileCompletionCard } from '@/features/dashboard/components/ProfileCompletionCard';
import { QuickActionsCard } from '@/features/dashboard/components/QuickActionsCard';
import { QuickStats } from '@/features/dashboard/components/QuickStats';
import { RecentApplicationsCard } from '@/features/dashboard/components/RecentApplicationsCard';
import { StatusSummaryCard } from '@/features/dashboard/components/StatusSummaryCard';

const PAGE_SUBTITLE = "Here's what's happening with your job search.";

/**
 * Candidate home: an at-a-glance overview of applications, profile completion,
 * and jobs worth exploring. Handles its own loading, error, and empty states.
 */
export default function CandidateDashboardPage() {
  const { data, isLoading, isError, refetch } = useGetCandidateDashboardQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description={PAGE_SUBTITLE} />
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

  const {
    profileCompletion,
    applicationCounts,
    recentApplications,
    recommendedJobs,
    recentJobs,
    savedCount,
  } = data;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={PAGE_SUBTITLE} />

      <QuickStats applicationCounts={applicationCounts} savedCount={savedCount} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileCompletionCard value={profileCompletion} />
        <StatusSummaryCard byStatus={applicationCounts.byStatus} />
      </div>

      <DashboardJobsSection
        title="Recommended for you"
        description="Jobs matched to your profile and interests."
        jobs={recommendedJobs}
        emptyTitle="No recommendations yet"
        emptyDescription="Complete your profile to get tailored job recommendations."
      />

      <DashboardJobsSection
        title="Recently posted"
        description="The latest openings across employers."
        jobs={recentJobs}
        emptyTitle="No jobs posted yet"
        emptyDescription="Check back soon for new openings."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentApplicationsCard applications={recentApplications} />
        <QuickActionsCard />
      </div>
    </div>
  );
}
