import { Module } from '@nestjs/common';
import { BatchRunsController } from './batch-runs.controller';
import { BatchRunsService } from './batch-runs.service';

@Module({
  controllers: [BatchRunsController],
  providers: [BatchRunsService],
  exports: [BatchRunsService],
})
export class BatchRunsModule {}
