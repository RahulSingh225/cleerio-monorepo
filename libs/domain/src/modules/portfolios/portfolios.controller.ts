import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Get, Delete, Param, Query, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentTenant, TenantGuard } from '@platform/tenant';
import type { TenantContextData } from '@platform/tenant';
import { ApiResponseConfig, AuthenticatedUser } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PortfoliosService } from './portfolios.service';
import { eq } from 'drizzle-orm';
import { db, portfolios, portfolioMappingProfiles } from '@platform/drizzle';

@Controller('portfolios')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post('upload')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({
    message: 'Portfolio CSV uploaded and headers parsed for mapping',
    apiCode: 'PORTFOLIO_UPLOADED_FOR_MAPPING',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenant: TenantContextData,
    @Request() req: any,
  ) {
    // Return parsed headers and a 5-row preview for the UI wizard
    const preview = await this.portfoliosService.parseCsvHeadersAndPreview(file.buffer);
    
    // Create a "Pending" portfolio record to hold the file URL/state
    const results = await this.portfoliosService.insert({
      tenantId: tenant.tenantId!,
      uploadedBy: req.user.userId,
      allocationMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
      sourceType: 'csv',
      status: 'pending_mapping',
    });
    const newPortfolio = results[0];

    // Fetch saved mapping profiles so the wizard can offer "reuse existing"
    const savedProfiles = await db
      .select()
      .from(portfolioMappingProfiles)
      .where(eq(portfolioMappingProfiles.tenantId, tenant.tenantId!))
      .orderBy(portfolioMappingProfiles.createdAt)
      .execute();
    
    return {
      portfolioId: newPortfolio.id,
      headers: preview.headers,
      previewRows: preview.rows,
      savedProfiles,
    };
  }

  @Post(':id/ingest')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({
    message: 'Portfolio ingestion started',
    apiCode: 'PORTFOLIO_INGEST_STARTED',
  })
  @UseInterceptors(FileInterceptor('file')) // Requiring the file again for MVP simplicity
  async ingestPortfolio(
    @Param('id') portfolioId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenant: TenantContextData,
    @Request() req: any,
  ) {
    // Parse mappings, profileId, profileName from the form data
    let mappings: Record<string, string> = {};
    let profileId: string | undefined;
    let profileName: string | undefined;
    try {
      const rawMappings = req.body?.mappings;
      if (rawMappings) {
        mappings = typeof rawMappings === 'string' ? JSON.parse(rawMappings) : rawMappings;
      }
      profileId = req.body?.profileId || undefined;
      profileName = req.body?.profileName || undefined;
    } catch (e) {
      // If mappings parsing fails, continue with empty — service will fallback to registry
    }

    // Trigger ingestion with the user's field mappings + profile info
    this.portfoliosService.parseAndIngestCSV(file.buffer, tenant.tenantId!, portfolioId!, mappings, profileId, profileName);
    return { status: 'processing', portfolioId };
  }

  @Get()
  @ApiResponseConfig({
    message: 'Portfolios listed successfully',
    apiCode: 'PORTFOLIOS_LISTED',
  })
  async findAll(@Request() req: any) {
    return this.portfoliosService.findAllForUser(req.user as AuthenticatedUser);
  }

  @Get(':id')
  @ApiResponseConfig({
    message: 'Portfolio details retrieved successfully',
    apiCode: 'PORTFOLIO_RETRIEVED',
  })
  async findOne(@Param('id') id: string) {
    return this.portfoliosService.findFirst(eq(portfolios.id, id));
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'Portfolio and its records deleted successfully',
    apiCode: 'PORTFOLIO_DELETED',
  })
  async delete(@Param('id') id: string) {
    return this.portfoliosService.delete(eq(portfolios.id, id));
  }
}
