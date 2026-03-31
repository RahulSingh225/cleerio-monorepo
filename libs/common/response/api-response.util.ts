import { ApiSuccessResponse, PaginationMeta } from './api-response.interface';

export const buildSuccessResponse = <T>(
  message: string,
  apiCode: string,
  data: T,
  meta?: PaginationMeta,
): ApiSuccessResponse<T> => ({
  message,
  apiCode,
  data,
  ...(meta ? { meta } : {}),
});
