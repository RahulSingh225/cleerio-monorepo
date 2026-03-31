import { Module } from '@nestjs/common';
import { TenantFieldRegistryService } from './tenant-field-registry.service';
import { TenantFieldRegistryController } from './tenant-field-registry.controller';

@Module({
  controllers: [TenantFieldRegistryController],
  providers: [TenantFieldRegistryService],
  exports: [TenantFieldRegistryService],
})
export class TenantFieldRegistryModule {}
