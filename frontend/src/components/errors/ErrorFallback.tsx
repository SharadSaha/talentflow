import { RotateCcw, TriangleAlert } from 'lucide-react';

import { StatusScreen } from '@/components/feedback/StatusScreen';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  /** Resets the boundary and re-attempts rendering the subtree. */
  onReset: () => void;
}

/**
 * Default recoverable fallback shown by `ErrorBoundary`. Presents a friendly
 * message and a retry action rather than exposing the underlying error.
 */
export function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <StatusScreen
      icon={TriangleAlert}
      title="Something went wrong"
      description="An unexpected error occurred while rendering this page. You can try again."
      actions={
        <Button onClick={onReset}>
          <RotateCcw />
          Try again
        </Button>
      }
    />
  );
}
