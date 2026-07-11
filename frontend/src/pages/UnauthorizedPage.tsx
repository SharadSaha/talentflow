import { Link } from 'react-router-dom';
import { Home, ShieldAlert } from 'lucide-react';

import { StatusScreen } from '@/components/feedback/StatusScreen';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Shown when an authenticated user lacks the role required for a route. */
export function UnauthorizedPage() {
  return (
    <StatusScreen
      icon={ShieldAlert}
      eyebrow="403"
      title="Access denied"
      description="You don't have permission to view this page. If you believe this is a mistake, contact your administrator."
      actions={
        <Button asChild variant="outline">
          <Link to={ROUTES.DASHBOARD}>
            <Home />
            Go to dashboard
          </Link>
        </Button>
      }
    />
  );
}
