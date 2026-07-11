import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/constants/routes';

interface ProfileCompletionCardProps {
  /** Completion percentage, 0–100. */
  value: number;
}

/**
 * Shows how complete the candidate's profile is and nudges them to finish it.
 * The call to action is only emphasised while the profile is incomplete.
 */
export function ProfileCompletionCard({ value }: ProfileCompletionCardProps) {
  const isComplete = value >= 100;

  return (
    <Card className="shadow-elevation-low">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Profile completion</CardTitle>
        <span className="text-h3 font-semibold tabular-nums text-foreground">{value}%</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={value} aria-label={`Profile ${value}% complete`} />
        <p className="text-small text-foreground-muted">
          {isComplete
            ? 'Your profile is complete — you are ready to stand out to employers.'
            : 'A complete profile helps you get noticed by more employers.'}
        </p>
        {!isComplete ? (
          <Button asChild variant="primary" size="sm">
            <Link to={ROUTES.CANDIDATE.PROFILE}>Complete your profile</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.CANDIDATE.PROFILE}>View profile</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
