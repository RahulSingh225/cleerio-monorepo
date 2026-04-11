import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '@platform/domain';
import { TenantGuard } from '@platform/tenant';

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('portfolio-summary')
  @ApiResponseConfig({
    message: 'Portfolio summary report generated successfully',
    apiCode: 'REPORT_SUMMARY_SUCCESS',
  })
  async getSummary(
    @Request() req: any,
    @Query('portfolioId') portfolioId?: string,
  ) {
    return this.reportsService.getPortfolioSummary(req.user.tenantId, portfolioId);
  }

  @Get('segment-distribution')
  @ApiResponseConfig({
    message: 'Segment distribution report generated successfully',
    apiCode: 'REPORT_SEGMENT_DIST_SUCCESS',
  })
  async getSegmentDist(@Request() req: any) {
    return this.reportsService.getSegmentDistribution(req.user.tenantId);
  }
}
