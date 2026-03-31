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
import { portfolios } from '@platform/drizzle';

@Controller('portfolios')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post('upload')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({
    message: 'Portfolio successfully uploaded and processing started',
    apiCode: 'PORTFOLIO_UPLOAD_STARTED',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(
    @UploadedFile() file: Express.Multer.File,
    @CurrentTenant() tenant: TenantContextData,
    @Request() req: any,
  ) {
    // 1. Create a "Pending" portfolio record first to get an ID
    const results = await this.portfoliosService.insert({
      tenantId: tenant.tenantId!,
      uploadedBy: req.user.userId,
      allocationMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
      sourceType: 'csv',
      status: 'processing',
    });
    const newPortfolio = results[0];

    // 2. Trigger asynchronous (Promise-based for now) ingestion
    // In production, this would be a Kafka event or BullMQ job
    this.portfoliosService.parseAndIngestCSV(file.buffer, tenant.tenantId!, newPortfolio.id);

    return newPortfolio;
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
