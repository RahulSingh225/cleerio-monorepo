import { Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RepaymentSyncsService } from './repayment-syncs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard, CurrentTenant } from '@platform/tenant';
import type { TenantContextData } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('repayment-syncs')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class RepaymentSyncsController {
  constructor(private readonly service: RepaymentSyncsService) {}

  @Post('upload')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({ message: 'Repayment sync started', apiCode: 'REPAYMENT_SYNC_STARTED' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenant: TenantContextData,
    @Request() req: any,
  ) {
    // Fire and forget — async processing
    this.service.uploadAndSync(file.buffer, tenant.tenantId!, req.user.userId);
    return { message: 'Repayment sync processing started' };
  }

  @Get()
  @ApiResponseConfig({ message: 'Repayment syncs listed', apiCode: 'REPAYMENT_SYNCS_LISTED' })
  async findAll() {
    return this.service.findMany();
  }
}
