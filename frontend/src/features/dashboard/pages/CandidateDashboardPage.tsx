import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useGetCandidateDashboardQuery } from '@/features/dashboard/api/dashboardApi';
import { CandidateQuickActions } from '@/features/dashboard/components/CandidateQuickActions';
import { DashboardJobsSection } from '@/features/dashboard/components/DashboardJobsSection';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { ProfileCompletionCard } from '@/features/dashboard/components/ProfileCompletionCard';
import { QuickStats } from '@/features/dashboard/components/QuickStats';
import { RecentApplicationsCard } from '@/features/dashboard/components/RecentApplicationsCard';
import { StatusSummaryCard } from '@/features/dashboard/components/StatusSummaryCard';
import { useAuth } from '@/hooks/useAuth';

const PAGE_TITLE = 'Career Hub';

/** Builds a personalised greeting for the dashboard subtitle. */
function buildSubtitle(firstName: string | undefined): string {
  return firstName
    ? `Welcome back, ${firstName}. Here's where your job search stands today.`
    : "Here's where your job search stands today.";
}

/**
 * Candidate home: quick actions up top, headline metrics, then activity and
 * recommendations in a deliberate hierarchy. Handles its own loading, error,
 * and empty states.
 */
export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetCandidateDashboardQuery();
  const subtitle = buildSubtitle(user?.firstName);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={PAGE_TITLE} description={subtitle} />
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
    <div className="space-y-8">
      <PageHeader title={PAGE_TITLE} description={subtitle} />

      <CandidateQuickActions />

      <QuickStats applicationCounts={applicationCounts} savedCount={savedCount} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentApplicationsCard applications={recentApplications} />
        </div>
        <div className="flex flex-col gap-6">
          <ProfileCompletionCard value={profileCompletion} />
          <StatusSummaryCard byStatus={applicationCounts.byStatus} />
        </div>
      </div>

      <DashboardJobsSection
        title="Recommended for you"
        description="Roles matched to your profile and interests."
        jobs={recommendedJobs}
        emptyTitle="No recommendations yet"
        emptyDescription="Complete your profile to unlock tailored job recommendations."
      />

      <DashboardJobsSection
        title="Fresh openings"
        description="The latest roles posted across employers."
        jobs={recentJobs}
        emptyTitle="No jobs posted yet"
        emptyDescription="Check back soon for new openings."
      />
    </div>
  );
}
