import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * A responsive definition list for rendering key/value metadata. Compose with
 * `DescriptionListItem`, or pass structured data to `KeyValueList`.
 */
export const DescriptionList = forwardRef<HTMLDListElement, React.HTMLAttributes<HTMLDListElement>>(
  function DescriptionList({ className, ...props }, ref) {
    return (
      <dl
        ref={ref}
        className={cn('grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2', className)}
        {...props}
      />
    );
  },
);

export interface DescriptionListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The label describing the value. */
  term: React.ReactNode;
}

/** A single term/description pair within a `DescriptionList`. */
export const DescriptionListItem = forwardRef<HTMLDivElement, DescriptionListItemProps>(
  function DescriptionListItem({ className, term, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props}>
        <dt className="text-small text-foreground-muted">{term}</dt>
        <dd className="text-sm text-foreground">{children}</dd>
      </div>
    );
  },
);

export interface KeyValueListItem {
  /** The label describing the value. */
  label: React.ReactNode;
  /** The value to display. */
  value: React.ReactNode;
}

export interface KeyValueListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Structured key/value pairs rendered as description list items. */
  items: KeyValueListItem[];
}

/**
 * Data-driven convenience wrapper around `DescriptionList` that maps an array
 * of `{ label, value }` pairs into rendered items.
 */
export const KeyValueList = forwardRef<HTMLDListElement, KeyValueListProps>(function KeyValueList(
  { items, ...props },
  ref,
) {
  return (
    <DescriptionList ref={ref} {...props}>
      {items.map((item, index) => (
        <DescriptionListItem key={index} term={item.label}>
          {item.value}
        </DescriptionListItem>
      ))}
    </DescriptionList>
  );
});
