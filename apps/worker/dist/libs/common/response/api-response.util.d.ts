import { ApiSuccessResponse, PaginationMeta } from './api-response.interface';
export declare const buildSuccessResponse: <T>(message: string, apiCode: string, data: T, meta?: PaginationMeta) => ApiSuccessResponse<T>;
