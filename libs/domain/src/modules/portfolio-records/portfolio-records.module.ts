import { Module } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';
import { PortfolioRecordsController } from './portfolio-records.controller';

@Module({
  controllers: [PortfolioRecordsController],
  providers: [PortfolioRecordsService],
  exports: [PortfolioRecordsService],
})
export class PortfolioRecordsModule {}
