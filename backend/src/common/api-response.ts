import type { Response } from 'express';

import { HTTP_STATUS } from '@/constants/http-status';
import type { ApiSuccessResponse } from '@/types/api-response';

interface SuccessOptions<TData> {
  message: string;
  data: TData;
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
