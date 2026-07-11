import { FileText, Search, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

/** Shortcuts to the candidate's most common next actions. */
export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild variant="primary" size="sm">
          <Link to={ROUTES.CANDIDATE.JOBS}>
            <Search aria-hidden="true" />
            Browse jobs
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.CANDIDATE.PROFILE}>
            <UserRound aria-hidden="true" />
            Update profile
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.CANDIDATE.APPLICATIONS}>
            <FileText aria-hidden="true" />
            View applications
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
