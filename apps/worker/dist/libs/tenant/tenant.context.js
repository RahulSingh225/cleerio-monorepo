"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContext = exports.tenantStorage = void 0;
const async_hooks_1 = require("async_hooks");
exports.tenantStorage = new async_hooks_1.AsyncLocalStorage();
class TenantContext {
    static get tenantId() {
        const store = exports.tenantStorage.getStore();
        return store?.tenantId || null;
    }
    static get current() {
        return exports.tenantStorage.getStore() || null;
    }
}
exports.TenantContext = TenantContext;
//# sourceMappingURL=tenant.context.js.map