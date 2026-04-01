"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseInterceptor = exports.ApiResponseConfig = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const API_RESPONSE_METADATA_KEY = 'api:response';
const ApiResponseConfig = (metadata) => (0, common_1.SetMetadata)(API_RESPONSE_METADATA_KEY, metadata);
exports.ApiResponseConfig = ApiResponseConfig;
let ApiResponseInterceptor = class ApiResponseInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const metadata = this.reflector.getAllAndOverride(API_RESPONSE_METADATA_KEY, [context.getHandler(), context.getClass()]);
        return next
            .handle()
            .pipe((0, operators_1.map)((value) => this.toApiResponse(value, metadata)));
    }
    toApiResponse(value, metadata) {
        if (value &&
            typeof value === 'object' &&
            'message' in value &&
            'apiCode' in value &&
            'data' in value) {
            return value;
        }
        const message = metadata?.message ?? 'Success';
        const apiCode = metadata?.apiCode ?? 'SUCCESS';
        if (value && typeof value === 'object') {
            const { meta, ...rest } = value;
            if (typeof rest === 'object' &&
                rest !== null &&
                Object.keys(rest).length === 1 &&
                'data' in rest) {
                return this.buildResponse(message, apiCode, rest.data, meta);
            }
            return this.buildResponse(message, apiCode, value, meta);
        }
        return this.buildResponse(message, apiCode, value);
    }
    buildResponse(message, apiCode, data, meta) {
        return {
            message,
            apiCode,
            data,
            ...(meta ? { meta } : {}),
        };
    }
};
exports.ApiResponseInterceptor = ApiResponseInterceptor;
exports.ApiResponseInterceptor = ApiResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ApiResponseInterceptor);
//# sourceMappingURL=api-response.interceptor.js.map