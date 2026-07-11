import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

import { StatusScreen } from '@/components/feedback/StatusScreen';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** 404 page for unmatched routes. */
export function NotFoundPage() {
  return (
    <StatusScreen
      eyebrow="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      actions={
        <Button asChild>
          <Link to={ROUTES.HOME}>
            <Home />
            Back to home
          </Link>
        </Button>
      }
    />
  );
}
