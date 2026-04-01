import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { ApiResponseConfig } from '@platform/common';

@Controller('jobs')
@UseGuards(JwtAuthGuard, TenantRoleGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @Roles('platform_admin', 'platform_ops')
  @ApiResponseConfig({
    message: 'System jobs retrieved successfully',
    apiCode: 'JOBS_RETRIEVED',
  })
  async findAll(@Query('limit') limit?: number) {
    return this.jobsService.findAllJobs(limit);
  }

  @Get('tenant/:tenantId')
  @Roles('platform_admin', 'platform_ops')
  @ApiResponseConfig({
    message: 'Tenant jobs retrieved successfully',
    apiCode: 'TENANT_JOBS_RETRIEVED',
  })
  async findByTenant(@Query('tenantId') tenantId: string, @Query('limit') limit?: number) {
    return this.jobsService.findJobsByTenant(tenantId, limit);
  }
}
