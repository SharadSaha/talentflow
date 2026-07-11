import type { PaginationMeta, PaginationParams } from '@/types/pagination';

/** Converts 1-based pagination params into a Prisma `skip` offset. */
export function getPaginationSkip({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

/** Builds pagination metadata from the page params and the total item count. */
export function buildPaginationMeta(params: PaginationParams & { total: number }): PaginationMeta {
  const totalPages = params.total === 0 ? 0 : Math.ceil(params.total / params.limit);

  return {
    page: params.page,
    limit: params.limit,
    total: params.total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrevious: params.page > 1 && params.total > 0,
  };
}
