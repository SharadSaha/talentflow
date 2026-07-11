import { Briefcase, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

/** Shortcuts to the recruiter's most common next actions. */
export function HrQuickActions() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3">Quick actions</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild variant="primary" size="sm">
          <Link to={ROUTES.HR.JOB_NEW}>
            <Plus aria-hidden="true" />
            Create job
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.HR.APPLICANTS}>
            <Users aria-hidden="true" />
            View applicants
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.HR.JOBS}>
            <Briefcase aria-hidden="true" />
            Manage jobs
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
