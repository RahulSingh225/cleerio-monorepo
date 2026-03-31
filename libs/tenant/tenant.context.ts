import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: string | null;
  tenantCode: string | null;
  // future fields like role, platformUserId, etc.
}

export const tenantStorage = new AsyncLocalStorage<TenantContextData>();

export class TenantContext {
  static get tenantId(): string | null {
    const store = tenantStorage.getStore();
    return store?.tenantId || null;
  }

  static get current(): TenantContextData | null {
    return tenantStorage.getStore() || null;
  }
}
