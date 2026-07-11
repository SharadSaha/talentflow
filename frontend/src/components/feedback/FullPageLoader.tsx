import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface FullPageLoaderProps {
  /** Optional message shown beneath the spinner. */
  message?: string;
  className?: string;
}

/**
 * Centered, full-height loading state used while the app bootstraps or a route
 * chunk loads. Preserves layout and avoids a blank screen.
 */
export function FullPageLoader({ message, className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] w-full flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <Spinner size="lg" className="text-foreground-muted" label={message ?? 'Loading'} />
      {message ? <p className="text-small text-foreground-muted">{message}</p> : null}
    </div>
  );
}
