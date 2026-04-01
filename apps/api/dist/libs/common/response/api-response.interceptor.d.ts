import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export interface ApiResponseMetadata {
    message?: string;
    apiCode?: string;
}
export declare const ApiResponseConfig: (metadata: ApiResponseMetadata) => import("node_modules/@nestjs/common").CustomDecorator<string>;
export declare class ApiResponseInterceptor implements NestInterceptor {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private toApiResponse;
    private buildResponse;
}
