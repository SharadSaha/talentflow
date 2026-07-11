import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * A flat, bordered surface for grouping related content. Uses a border rather
 * than a shadow to stay consistent with the enterprise design language.
 */
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-card text-card-foreground', className)}
      {...props}
    />
  );
});

/** Header region of a card; stacks a title, description, and optional action. */
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-1 p-5', className)} {...props} />;
  },
);

/** Prominent heading for a card. */
export const CardTitle = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardTitle({ className, ...props }, ref) {
    return <div ref={ref} className={cn('text-h3', className)} {...props} />;
  },
);

/** Supporting, muted subtitle for a card header. */
export const CardDescription = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('text-small text-foreground-muted', className)} {...props} />
    );
  },
);

/** Primary content region of a card. */
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />;
  },
);

/** Footer region of a card, typically holding actions. */
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />;
  },
);

/** Action slot for a card header, aligned to the trailing edge. */
export const CardAction = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardAction({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex items-center gap-2', className)} {...props} />;
  },
);
