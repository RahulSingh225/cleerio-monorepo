import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { eq } from 'drizzle-orm';
import { scheduledJobs } from '@platform/drizzle';

@Controller('scheduled-jobs')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class ScheduledJobsController {
  constructor(private readonly service: ScheduledJobsService) {}

  @Post()
  @Roles('tenant_admin', 'platform_admin')
  @ApiResponseConfig({ message: 'Scheduled job created', apiCode: 'SCHEDULED_JOB_CREATED' })
  async create(@Body() data: any) {
    return this.service.createScheduledJob(data);
  }

  @Get()
  @ApiResponseConfig({ message: 'Scheduled jobs listed', apiCode: 'SCHEDULED_JOBS_LISTED' })
  async findAll() {
    return this.service.findMany();
  }

  @Put(':id/toggle')
  @Roles('tenant_admin', 'platform_admin')
  @ApiResponseConfig({ message: 'Scheduled job toggled', apiCode: 'SCHEDULED_JOB_TOGGLED' })
  async toggle(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.service.toggleActive(id, body.isActive);
  }

  @Put(':id')
  @Roles('tenant_admin', 'platform_admin')
  @ApiResponseConfig({ message: 'Scheduled job updated', apiCode: 'SCHEDULED_JOB_UPDATED' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(eq(scheduledJobs.id, id), data);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'platform_admin')
  @ApiResponseConfig({ message: 'Scheduled job deleted', apiCode: 'SCHEDULED_JOB_DELETED' })
  async delete(@Param('id') id: string) {
    return this.service.delete(eq(scheduledJobs.id, id));
  }
}
