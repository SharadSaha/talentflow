import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders the invalid state (danger border) and sets `aria-invalid`. */
  error?: boolean;
  /** Icon rendered inside the leading edge of the field. */
  startIcon?: ReactNode;
  /** Icon rendered inside the trailing edge of the field. */
  endIcon?: ReactNode;
}

const baseClasses = cn(
  'h-9 w-full rounded-md border border-input bg-surface px-3 py-1 text-sm text-foreground',
  'placeholder:text-foreground-muted transition-colors duration-fast ease-emphasized',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

/**
 * A text field supporting native `type` (text/password/search/number/email),
 * an error state, and optional leading/trailing icons. When icons are present
 * the field is wrapped in a relative container and padded to clear them.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error = false, startIcon, endIcon, type = 'text', ...props },
  ref,
) {
  const errorClasses = error ? 'border-danger focus-visible:border-danger' : undefined;

  const field = (
    <input
      ref={ref}
      type={type}
      aria-invalid={error || undefined}
      className={cn(baseClasses, errorClasses, startIcon && 'pl-9', endIcon && 'pr-9', className)}
      {...props}
    />
  );

  if (!startIcon && !endIcon) {
    return field;
  }

  return (
    <div className="relative w-full">
      {startIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-foreground-muted [&_svg]:size-4"
        >
          {startIcon}
        </span>
      )}
      {field}
      {endIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-foreground-muted [&_svg]:size-4"
        >
          {endIcon}
        </span>
      )}
    </div>
  );
});
