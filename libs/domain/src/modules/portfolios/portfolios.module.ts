import { Module } from '@nestjs/common';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { TenantFieldRegistryModule } from '../tenant-field-registry/tenant-field-registry.module';
import { DpdBucketConfigsModule } from '../dpd-bucket-configs/dpd-bucket-configs.module';
import { PortfolioRecordsModule } from '../portfolio-records/portfolio-records.module';

@Module({
  imports: [
    TenantFieldRegistryModule,
    DpdBucketConfigsModule,
    PortfolioRecordsModule,
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
