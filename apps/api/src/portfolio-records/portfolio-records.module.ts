import { Module } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';

@Module({
  providers: [PortfolioRecordsService],
  exports: [PortfolioRecordsService],
})
export class PortfolioRecordsModule {}
