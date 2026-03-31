import { Injectable } from '@nestjs/common';
import { db, tenantFieldRegistry } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class TenantFieldRegistryService extends BaseRepository<typeof tenantFieldRegistry> {
  constructor() {
    super(tenantFieldRegistry, db);
  }

  async getMappingForTenant() {
    // Returns array of field mappings configured for the active context's tenant.
    // BaseRepository's withTenant clause automatically filters `findMany` using async local storage!
    return this.findMany();
  }
}
