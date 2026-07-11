import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Renders the invalid state (danger border) and sets `aria-invalid`. */
  error?: boolean;
}

/**
 * A multi-line text field sharing the visual language of {@link Input}.
 * Grows from a minimum height and supports an error state.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground',
        'placeholder:text-foreground-muted transition-colors duration-fast ease-emphasized',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus-visible:border-danger',
        className,
      )}
      {...props}
    />
  );
});
