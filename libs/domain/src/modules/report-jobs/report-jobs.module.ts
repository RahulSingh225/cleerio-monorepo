import { Module } from '@nestjs/common';
import { ReportJobsController } from './report-jobs.controller';
import { ReportJobsService } from './report-jobs.service';

@Module({
  controllers: [ReportJobsController],
  providers: [ReportJobsService],
  exports: [ReportJobsService],
})
export class ReportJobsModule {}
