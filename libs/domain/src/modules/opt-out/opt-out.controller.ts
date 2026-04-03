import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OptOutService } from './opt-out.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('opt-out')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class OptOutController {
  constructor(private readonly service: OptOutService) {}

  @Post()
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({ message: 'Added to opt-out list', apiCode: 'OPT_OUT_ADDED' })
  async addToOptOut(@Body() body: { mobile: string; channel?: string; reason?: string; source?: string }, @Request() req: any) {
    return this.service.addToOptOut({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  @ApiResponseConfig({ message: 'Opt-out list retrieved', apiCode: 'OPT_OUT_LISTED' })
  async findAll() {
    return this.service.findMany();
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiResponseConfig({ message: 'Removed from opt-out list', apiCode: 'OPT_OUT_REMOVED' })
  async remove(@Param('id') id: string) {
    return this.service.removeFromOptOut(id);
  }
}
