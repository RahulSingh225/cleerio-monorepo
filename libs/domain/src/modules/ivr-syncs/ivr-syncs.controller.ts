import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IvrSyncsService } from './ivr-syncs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard, CurrentTenant } from '@platform/tenant';
import type { TenantContextData } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ivr-syncs')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class IvrSyncsController {
  constructor(private readonly service: IvrSyncsService) {}

  /**
   * Upload IVR call feedback CSV for processing.
   * Accepts CSV files from providers like DinoDial.
   */
  @Post('upload')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({ message: 'IVR sync started', apiCode: 'IVR_SYNC_STARTED' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenant: TenantContextData,
    @Request() req: any,
  ) {
    // Fire and forget — async processing
    this.service.uploadAndSync(file.buffer, tenant.tenantId!, req.user.userId);
    return { message: 'IVR call feedback sync processing started' };
  }
}
