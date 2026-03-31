import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiErrorResponse } from './api-response.interface';
import { REQUEST_ID_TOKEN_HEADER } from '../constant';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, apiCode, details } =
      this.extractExceptionDetails(exception);

    const correlationIdHeader = request.headers[REQUEST_ID_TOKEN_HEADER];
    const correlationId = Array.isArray(correlationIdHeader)
      ? correlationIdHeader[0]
      : (correlationIdHeader as string | undefined);

    const payload: ApiErrorResponse = {
      message,
      apiCode,
      data: null,
      error: {
        statusCode: status,
        ...(details ? { details } : {}),
        ...(correlationId ? { correlationId } : {}),
      },
    };

    response.status(status).json(payload);
  }

  private extractExceptionDetails(exception: unknown): {
    status: number;
    message: string;
    apiCode: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, unknown>;
        const message = (resObj.message as string) ?? exception.message;
        const apiCode =
          (resObj.apiCode as string) ??
          this.buildApiCodeFromStatus(
            status,
            resObj.error as string | undefined,
          );
        const details = resObj.errors ?? resObj.details ?? resObj;
        return { status, message, apiCode, details };
      }

      const message =
        typeof response === 'string' ? response : exception.message;
      return {
        status,
        message,
        apiCode: this.buildApiCodeFromStatus(status),
      };
    }

    const genericMessage =
      exception instanceof Error ? exception.message : 'Internal server error';
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: genericMessage,
      apiCode: 'ERROR_INTERNAL_SERVER_ERROR',
      details: exception,
    };
  }

  private buildApiCodeFromStatus(status: number, errorText?: string): string {
    const normalized =
      errorText
        ?.trim()
        .replace(/[\s-]+/g, '_')
        .toUpperCase() ??
      HttpStatus[status] ??
      'ERROR';
    return `ERROR_${normalized}`;
  }
}
