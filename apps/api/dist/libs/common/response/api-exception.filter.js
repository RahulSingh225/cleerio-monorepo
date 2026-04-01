"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const constant_1 = require("../constant");
let ApiExceptionFilter = class ApiExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const { status, message, apiCode, details } = this.extractExceptionDetails(exception);
        const correlationIdHeader = request.headers[constant_1.REQUEST_ID_TOKEN_HEADER];
        const correlationId = Array.isArray(correlationIdHeader)
            ? correlationIdHeader[0]
            : correlationIdHeader;
        const payload = {
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
    extractExceptionDetails(exception) {
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'object' && response !== null) {
                const resObj = response;
                const message = resObj.message ?? exception.message;
                const apiCode = resObj.apiCode ??
                    this.buildApiCodeFromStatus(status, resObj.error);
                const details = resObj.errors ?? resObj.details ?? resObj;
                return { status, message, apiCode, details };
            }
            const message = typeof response === 'string' ? response : exception.message;
            return {
                status,
                message,
                apiCode: this.buildApiCodeFromStatus(status),
            };
        }
        const genericMessage = exception instanceof Error ? exception.message : 'Internal server error';
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: genericMessage,
            apiCode: 'ERROR_INTERNAL_SERVER_ERROR',
            details: exception,
        };
    }
    buildApiCodeFromStatus(status, errorText) {
        const normalized = errorText
            ?.trim()
            .replace(/[\s-]+/g, '_')
            .toUpperCase() ??
            common_1.HttpStatus[status] ??
            'ERROR';
        return `ERROR_${normalized}`;
    }
};
exports.ApiExceptionFilter = ApiExceptionFilter;
exports.ApiExceptionFilter = ApiExceptionFilter = __decorate([
    (0, common_1.Catch)()
], ApiExceptionFilter);
//# sourceMappingURL=api-exception.filter.js.map