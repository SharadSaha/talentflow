import type { Response } from 'express';

import { HTTP_STATUS } from '@/constants/http-status';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api-response';
import type { PaginationMeta } from '@/types/pagination';

interface SuccessOptions<TData> {
  message: string;
  data: TData;
  statusCode?: number;
}

interface PaginatedOptions<TItem> {
  message: string;
  data: TItem[];
  meta: PaginationMeta;
  statusCode?: number;
}

/**
 * Sends a consistent success response. Controllers use this helper so every
 * successful response shares the same `{ success, message, data }` shape.
 */
export function sendSuccess<TData>(res: Response, options: SuccessOptions<TData>): void {
  const body: ApiSuccessResponse<TData> = {
    success: true,
    message: options.message,
    data: options.data,
  };

  res.status(options.statusCode ?? HTTP_STATUS.OK).json(body);
}

/**
 * Sends a consistent paginated response: the item array plus pagination
 * metadata under `meta`, alongside the usual `success` / `message` fields.
 */
export function sendPaginated<TItem>(res: Response, options: PaginatedOptions<TItem>): void {
  const body: ApiPaginatedResponse<TItem> = {
    success: true,
    message: options.message,
    data: options.data,
    meta: options.meta,
  };

  res.status(options.statusCode ?? HTTP_STATUS.OK).json(body);
}
