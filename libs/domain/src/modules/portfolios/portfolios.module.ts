import { Module } from '@nestjs/common';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { TenantFieldRegistryModule } from '../tenant-field-registry/tenant-field-registry.module';
import { PortfolioRecordsModule } from '../portfolio-records/portfolio-records.module';

@Module({
  imports: [
    TenantFieldRegistryModule,
    PortfolioRecordsModule,
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}

