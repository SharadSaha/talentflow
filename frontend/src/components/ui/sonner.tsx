import { Toaster as SonnerToaster } from 'sonner';

import { useTheme } from '@/hooks/useTheme';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * Application toast renderer. Themes sonner to match the active colour scheme
 * and maps its toast surfaces onto the design system's semantic tokens.
 */
export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-lg border border-border bg-surface-elevated text-foreground shadow-lg',
          description: 'text-foreground-muted',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-foreground-muted',
          closeButton: 'bg-surface-elevated border-border text-foreground-muted',
          success: 'text-success',
          error: 'text-danger',
          warning: 'text-warning',
          info: 'text-info',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
