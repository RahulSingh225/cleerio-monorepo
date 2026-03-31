import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentTenant, TenantGuard } from '@platform/tenant';
import type { TenantContextData } from '@platform/tenant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PortfoliosService } from './portfolios.service';

@Controller('portfolios')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post('upload')
  @Roles('tenant_admin', 'ops') // Only specific tenant users can trigger ingests
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(
    @UploadedFile() file: any,
    @CurrentTenant() tenant: TenantContextData,
  ) {
    // 1. Check file ext (CSV or XLSX)
    // 2. Pass stream to parser
    // 3. Kick off Kafka job for background processing
    
    // For now, doing synchronous preview parse for demonstration
    const parsed = await this.portfoliosService.parseAndIngestCSV(file.buffer, tenant.tenantId!);
    
    // Publish mock Kafka ingest event (to be replaced by Producer later)
    console.log(`[Kafka Event emitted]: portfolio.ingest.${tenant.tenantId}`);

    return {
      message: 'Portfolio successfully queued for processing',
      details: parsed,
    };
  }
}
