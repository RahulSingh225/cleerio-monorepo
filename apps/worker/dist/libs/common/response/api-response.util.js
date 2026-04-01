"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSuccessResponse = void 0;
const buildSuccessResponse = (message, apiCode, data, meta) => ({
    message,
    apiCode,
    data,
    ...(meta ? { meta } : {}),
});
exports.buildSuccessResponse = buildSuccessResponse;
//# sourceMappingURL=api-response.util.js.map