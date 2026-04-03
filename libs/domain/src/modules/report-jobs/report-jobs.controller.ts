import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReportJobsService } from './report-jobs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { reportJobs } from '@platform/drizzle';

@Controller('report-jobs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportJobsController {
  constructor(private readonly service: ReportJobsService) {}

  @Post()
  @ApiResponseConfig({ message: 'Report requested', apiCode: 'REPORT_REQUESTED' })
  async request(@Body() body: { reportType: string; filters?: any }, @Request() req: any) {
    return this.service.requestReport({
      tenantId: req.user.tenantId,
      requestedBy: req.user.userId,
      reportType: body.reportType,
      filters: body.filters,
    });
  }

  @Get()
  @ApiResponseConfig({ message: 'Report jobs listed', apiCode: 'REPORT_JOBS_LISTED' })
  async findAll() {
    return this.service.findAllForTenant();
  }

  @Get(':id')
  @ApiResponseConfig({ message: 'Report job retrieved', apiCode: 'REPORT_JOB_RETRIEVED' })
  async findOne(@Param('id') id: string) {
    return this.service.findFirst(eq(reportJobs.id, id));
  }
}
