import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** A vertical list with subtle dividers between items. */
export const List = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  function List({ className, ...props }, ref) {
    return <ul ref={ref} className={cn('divide-y divide-border-subtle', className)} {...props} />;
  },
);

/** A single row within a `List`, laying out its content in a flex row. */
export const ListItem = forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  function ListItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn('flex items-center gap-3 py-3', className)} {...props} />;
  },
);
