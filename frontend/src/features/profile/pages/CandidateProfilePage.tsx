import { AlertCircle, Pencil } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyProfileQuery } from '@/features/profile/api/profileApi';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { ProfileView } from '@/features/profile/components/ProfileView';
import { useProfileCompletion } from '@/features/profile/hooks/useProfileCompletion';
import type { CandidateProfile } from '@/types/profile';

/** Candidate profile page: read-only overview with an inline edit mode. */
export default function CandidateProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useGetMyProfileQuery();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Keep your profile up to date so employers see your best work."
        actions={
          !isEditing && profile ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil aria-hidden="true" />
              Edit profile
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <ProfileSkeleton />
      ) : isError || !profile ? (
        <ProfileError onRetry={refetch} />
      ) : (
        <ProfileContent
          profile={profile}
          isEditing={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

interface ProfileContentProps {
  profile: CandidateProfile;
  isEditing: boolean;
  onClose: () => void;
}

function ProfileContent({ profile, isEditing, onClose }: ProfileContentProps) {
  const completion = useProfileCompletion(profile);

  return (
    <div className="space-y-6">
      <CompletionCard value={completion} />
      {isEditing ? (
        <ProfileForm profile={profile} onClose={onClose} />
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
}

/** Profile-completion meter card. */
function CompletionCard({ value }: { value: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-h3">Profile completion</CardTitle>
        <span className="text-h3 tabular-nums text-primary">{value}%</span>
      </CardHeader>
      <CardContent>
        <Progress value={value} aria-label={`Profile ${value}% complete`} />
      </CardContent>
    </Card>
  );
}

/** Error card with a retry affordance. */
function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <AlertCircle className="size-8 text-danger" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-h3 text-foreground">We couldn&rsquo;t load your profile</p>
          <p className="text-small text-foreground-muted">
            Something went wrong while fetching your profile. Please try again.
          </p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

/** Skeleton preserving the profile layout while data loads. */
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
