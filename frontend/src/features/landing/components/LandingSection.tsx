import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface LandingSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Extra classes for the inner max-width container. */
  containerClassName?: string;
  'aria-labelledby'?: string;
}

/**
 * Consistent section wrapper for the landing page: shared vertical rhythm,
 * centered max-width container, and scroll-margin so anchored navigation clears
 * the sticky header.
 */
export function LandingSection({
  id,
  children,
  className,
  containerClassName,
  ...props
}: LandingSectionProps) {
  return (
    <section id={id} className={cn('relative scroll-mt-24 py-20 sm:py-28', className)} {...props}>
      <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', containerClassName)}>
        {children}
      </div>
    </section>
  );
}
