import { Module } from '@nestjs/common';
import { TenantFieldRegistryService } from './tenant-field-registry.service';

@Module({
  providers: [TenantFieldRegistryService],
  exports: [TenantFieldRegistryService],
})
export class TenantFieldRegistryModule {}
