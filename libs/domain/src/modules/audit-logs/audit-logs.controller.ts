import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @Roles('tenant_admin', 'platform_admin')
  @ApiResponseConfig({ message: 'Audit logs listed', apiCode: 'AUDIT_LOGS_LISTED' })
  async findAll(@Query('action') action?: string, @Query('entityType') entityType?: string) {
    return this.service.findAllFiltered({ action, entityType });
  }
}
