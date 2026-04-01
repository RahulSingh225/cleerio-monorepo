import { AsyncLocalStorage } from 'async_hooks';
export interface TenantContextData {
    tenantId: string | null;
    tenantCode: string | null;
}
export declare const tenantStorage: AsyncLocalStorage<TenantContextData>;
export declare class TenantContext {
    static get tenantId(): string | null;
    static get current(): TenantContextData | null;
}
