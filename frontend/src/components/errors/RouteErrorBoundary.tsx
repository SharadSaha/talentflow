import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Home, TriangleAlert } from 'lucide-react';

import { StatusScreen } from '@/components/feedback/StatusScreen';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { logger } from '@/lib/logger';

interface RouteErrorContent {
  eyebrow?: string;
  title: string;
  description: string;
}

function resolveErrorContent(error: unknown): RouteErrorContent {
  if (isRouteErrorResponse(error)) {
    return {
      eyebrow: String(error.status),
      title: error.status === 404 ? 'Page not found' : 'Request failed',
      description:
        error.statusText || 'The page could not be loaded. Please try again in a moment.',
    };
  }

  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred while loading this page.',
  };
}

/**
 * Route-level error element for React Router. Renders a friendly, recoverable
 * screen for both thrown errors and HTTP error responses, without exposing
 * internal error details to the user.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const content = resolveErrorContent(error);

  logger.error('Route error boundary caught an error', error);

  return (
    <StatusScreen
      icon={TriangleAlert}
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
      actions={
        <Button onClick={() => navigate(ROUTES.HOME)}>
          <Home />
          Back to home
        </Button>
      }
    />
  );
}
