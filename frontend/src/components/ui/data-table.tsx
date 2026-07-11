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
  /**
   * Stretches the table to fill its parent's height: the header sticks, the body
   * scrolls, and any space beneath the rows stays empty. The parent must be a
   * height-constrained flex column.
   */
  fillHeight?: boolean;
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

interface RenderRowsArgs<TRow> {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  getRowId: (row: TRow) => string;
  isLoading: boolean;
  onRowClick?: (row: TRow) => void;
}

/** Renders skeleton rows while loading, otherwise the data rows. Shared by both layouts. */
function renderRows<TRow>({
  columns,
  data,
  getRowId,
  isLoading,
  onRowClick,
}: RenderRowsArgs<TRow>): ReactNode {
  if (isLoading) {
    return Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
      <TableRow key={`skeleton-${rowIndex}`}>
        {columns.map((column) => (
          <TableCell key={column.key} className={cn(alignClass(column), column.className)}>
            <Skeleton className="h-4 w-full max-w-[12rem]" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return data.map((row) => {
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
          <TableCell key={column.key} className={cn(alignClass(column), column.className)}>
            {column.cell(row)}
          </TableCell>
        ))}
      </TableRow>
    );
  });
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
  fillHeight = false,
}: DataTableProps<TRow>) {
  const isEmpty = !isLoading && data.length === 0;

  const defaultEmpty = (
    <EmptyState title="No results" description="There is nothing to show yet." />
  );

  // Fill mode: header sticks, body scrolls, and space below the rows is empty.
  if (fillHeight) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center rounded-md border border-border-subtle">
            {emptyState ?? defaultEmpty}
          </div>
        ) : (
          <Table containerClassName="min-h-0 flex-1 overflow-auto rounded-md border border-border-subtle">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={cn(alignClass(column), column.className)}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{renderRows({ columns, data, getRowId, isLoading, onRowClick })}</TableBody>
          </Table>
        )}

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
        <TableBody>{renderRows({ columns, data, getRowId, isLoading, onRowClick })}</TableBody>
      </Table>

      {isEmpty ? <div>{emptyState ?? defaultEmpty}</div> : null}

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
