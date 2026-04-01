export interface PaginationMeta {
    limit?: number;
    offset?: number;
    total?: number;
    nextCursor?: string | null;
    prevCursor?: string | null;
}
export interface ApiSuccessResponse<T> {
    message: string;
    apiCode: string;
    data: T;
    meta?: PaginationMeta;
}
export interface ApiErrorPayload {
    message: string;
    apiCode: string;
    statusCode: number;
    errors?: unknown;
    correlationId?: string;
}
export interface ApiErrorResponse {
    message: string;
    apiCode: string;
    data: null;
    error: {
        statusCode: number;
        details?: unknown;
        correlationId?: string;
    };
}
