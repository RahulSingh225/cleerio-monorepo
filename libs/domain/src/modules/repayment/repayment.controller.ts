import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RepaymentService } from './repayment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant, TenantGuard } from '@platform/tenant';
import type { TenantContextData } from '@platform/tenant';

@Controller('repayment-syncs')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class RepaymentController {
  constructor(private readonly repaymentService: RepaymentService) {}

  @Post()
  @Roles('tenant_admin', 'ops')
  async createSync(@Body() body: any, @CurrentTenant() tenant: TenantContextData) {
    const tenantId = tenant.tenantId!;
    const [sync] = await this.repaymentService.createSync({
      ...body,
      tenantId,
      status: 'pending',
      syncDate: body.syncDate || new Date().toISOString().split('T')[0],
    });
    return { data: sync };
  }

  @Get()
  async findAll(@CurrentTenant() tenant: TenantContextData) {
    const tenantId = tenant.tenantId!;
    const data = await this.repaymentService.findSyncsByTenant(tenantId);
    return { data };
  }

  @Get('records/:portfolioRecordId')
  async findRecords(@Param('portfolioRecordId') portfolioRecordId: string) {
    const data = await this.repaymentService.findRecordsByPortfolioRecord(portfolioRecordId);
    return { data };
  }
}
