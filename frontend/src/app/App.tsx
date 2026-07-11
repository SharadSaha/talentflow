import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { AppProviders } from '@/providers/AppProviders';
import { AppRouter } from '@/routes/AppRouter';

/**
 * Application root. A top-level error boundary wraps the global providers and
 * router so any unhandled render error degrades to a recoverable fallback
 * instead of a blank screen.
 */
export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
