import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { InteractionEventsService } from './interaction-events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { TenantContext } from '@platform/tenant';

@Controller('interactions')
@UseGuards(JwtAuthGuard, TenantRoleGuard)
export class InteractionEventsController {
  constructor(private readonly interactionsService: InteractionEventsService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    const tenantId = TenantContext.tenantId!;
    const data = await this.interactionsService.findByTenant(tenantId, limit ? parseInt(limit) : 50);
    return { data };
  }

  @Get('record/:recordId')
  async findByRecord(@Param('recordId') recordId: string) {
    const tenantId = TenantContext.tenantId!;
    const data = await this.interactionsService.findByRecord(recordId);
    return { data };
  }
}
