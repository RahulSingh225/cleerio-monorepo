import { Controller, Get, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { DataPointsService } from '@platform/domain';
import { JwtAuthGuard, TenantRoleGuard, Roles } from '@platform/domain';

@Controller('tenant/:tenantId/data-points')
@UseGuards(JwtAuthGuard, TenantRoleGuard)
export class DataPointsController {
  constructor(private readonly dataPointsService: DataPointsService) {}

  @Get()
  @Roles('tenant_admin', 'tenant_user')
  async getAvailableDataPoints(@Param('tenantId') tenantId: string) {
    try {
      const groups = await this.dataPointsService.getAvailableDataPoints(tenantId);
      return { success: true, data: groups };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
