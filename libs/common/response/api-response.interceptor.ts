import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse, PaginationMeta } from './api-response.interface';

const API_RESPONSE_METADATA_KEY = 'api:response';

export interface ApiResponseMetadata {
  message?: string;
  apiCode?: string;
}

export const ApiResponseConfig = (metadata: ApiResponseMetadata) =>
  SetMetadata(API_RESPONSE_METADATA_KEY, metadata);

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.getAllAndOverride<ApiResponseMetadata>(
      API_RESPONSE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next
      .handle()
      .pipe(map((value) => this.toApiResponse(value, metadata)));
  }

  private toApiResponse<T>(
    value: unknown,
    metadata?: ApiResponseMetadata,
  ): ApiSuccessResponse<T> | unknown {
    if (
      value &&
      typeof value === 'object' &&
      'message' in value &&
      'apiCode' in value &&
      'data' in value
    ) {
      return value;
    }

    const message = metadata?.message ?? 'Success';
    const apiCode = metadata?.apiCode ?? 'SUCCESS';

    if (value && typeof value === 'object') {
      const { meta, ...rest } = value as Record<string, unknown>;
      if (
        typeof rest === 'object' &&
        rest !== null &&
        Object.keys(rest).length === 1 &&
        'data' in rest
      ) {
        return this.buildResponse(
          message,
          apiCode,
          rest.data,
          meta as PaginationMeta | undefined,
        );
      }
      return this.buildResponse(
        message,
        apiCode,
        value,
        meta as PaginationMeta | undefined,
      );
    }

    return this.buildResponse(message, apiCode, value);
  }

  private buildResponse<T>(
    message: string,
    apiCode: string,
    data: T,
    meta?: PaginationMeta,
  ): ApiSuccessResponse<T> {
    return {
      message,
      apiCode,
      data,
      ...(meta ? { meta } : {}),
    };
  }
}
