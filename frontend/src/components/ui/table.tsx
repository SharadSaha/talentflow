import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * A horizontally scrollable table surface. These are layout primitives only —
 * sorting, selection, and pagination belong to a higher-level data table.
 */
export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  function Table({ className, ...props }, ref) {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom border-collapse text-sm', className)}
          {...props}
        />
      </div>
    );
  },
);

/** Grouping element for the table's header rows. */
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />
  );
});

/** Grouping element for the table's body rows. */
export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});

/** Grouping element for the table's footer rows. */
export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn('border-t border-border bg-muted/50 font-medium', className)}
      {...props}
    />
  );
});

/** A single table row. Supports the `data-state="selected"` styling hook. */
export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-border-subtle transition-colors hover:bg-surface-hover data-[state=selected]:bg-accent',
          className,
        )}
        {...props}
      />
    );
  },
);

/** A column header cell. */
export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-10 px-3 text-left align-middle text-[0.6875rem] font-semibold uppercase tracking-wider text-foreground-muted',
        className,
      )}
      {...props}
    />
  );
});

/** A standard table data cell. */
export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...props }, ref) {
  return <td ref={ref} className={cn('px-3 py-2.5 align-middle', className)} {...props} />;
});

/** An accessible caption rendered beneath the table. */
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-4 text-small text-foreground-muted', className)}
      {...props}
    />
  );
});
