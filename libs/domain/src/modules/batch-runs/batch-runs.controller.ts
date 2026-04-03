import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BatchRunsService } from './batch-runs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { batchRuns } from '@platform/drizzle';

@Controller('batch-runs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BatchRunsController {
  constructor(private readonly service: BatchRunsService) {}

  @Get()
  @ApiResponseConfig({ message: 'Batch runs listed', apiCode: 'BATCH_RUNS_LISTED' })
  async findAll() {
    return this.service.findAllForTenant();
  }

  @Get(':id')
  @ApiResponseConfig({ message: 'Batch run retrieved', apiCode: 'BATCH_RUN_RETRIEVED' })
  async findOne(@Param('id') id: string) {
    return this.service.findFirst(eq(batchRuns.id, id));
  }

  @Get(':id/errors')
  @ApiResponseConfig({ message: 'Batch errors retrieved', apiCode: 'BATCH_ERRORS_RETRIEVED' })
  async getErrors(@Param('id') id: string) {
    return this.service.getErrorsForBatch(id);
  }
}
