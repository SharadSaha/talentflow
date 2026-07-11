import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/** A single column definition for {@link DataTable}. */
export interface DataTableColumn<TRow> {
  /** Stable identifier used as the React key for the column. */
  key: string;
  /** Header cell content. */
  header: ReactNode;
  /** Renders the body cell for a given row. */
  cell: (row: TRow) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  /** Returns a stable, unique id for a row (used as the React key). */
  getRowId: (row: TRow) => string;
  isLoading?: boolean;
  /** Overrides the default empty state shown when there is no data. */
  emptyState?: ReactNode;
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void };
  onRowClick?: (row: TRow) => void;
}

const ALIGN_CLASS: Record<NonNullable<DataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

const SKELETON_ROW_COUNT = 5;

function alignClass<TRow>(column: DataTableColumn<TRow>): string {
  return column.align ? ALIGN_CLASS[column.align] : '';
}

/**
 * A generic, typed data table that composes the table primitives with loading,
 * empty, and pagination affordances. Rows become interactive only when
 * `onRowClick` is provided.
 */
export function DataTable<TRow>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyState,
  pagination,
  onRowClick,
}: DataTableProps<TRow>) {
  const isEmpty = !isLoading && data.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={cn(alignClass(column), column.className)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(alignClass(column), column.className)}
                    >
                      <Skeleton className="h-4 w-full max-w-[12rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((row) => {
                const clickable = Boolean(onRowClick);
                return (
                  <TableRow
                    key={getRowId(row)}
                    className={cn(clickable && 'cursor-pointer')}
                    {...(clickable
                      ? {
                          role: 'button',
                          tabIndex: 0,
                          onClick: () => onRowClick?.(row),
                          onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick?.(row);
                            }
                          },
                        }
                      : {})}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(alignClass(column), column.className)}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>

      {isEmpty ? (
        <div>
          {emptyState ?? (
            <EmptyState title="No results" description="There is nothing to show yet." />
          )}
        </div>
      ) : null}

      {pagination ? (
        <div className="flex justify-end">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
}
