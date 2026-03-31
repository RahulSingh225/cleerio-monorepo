import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq, and } from 'drizzle-orm';
import { portfolioRecords } from '@platform/drizzle';

@Controller('portfolio-records')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PortfolioRecordsController {
  constructor(private readonly recordsService: PortfolioRecordsService) {}

  @Get('portfolio/:portfolioId')
  @ApiResponseConfig({
    message: 'Portfolio records retrieved successfully',
    apiCode: 'PORTFOLIO_RECORDS_RETRIEVED',
  })
  async findByPortfolio(
    @Param('portfolioId') portfolioId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Basic pagination + scoping
    return this.recordsService.findMany({
      where: eq(portfolioRecords.portfolioId, portfolioId),
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Get(':id')
  @ApiResponseConfig({
    message: 'Record retrieved successfully',
    apiCode: 'RECORD_RETRIEVED',
  })
  async findOne(@Param('id') id: string) {
    return this.recordsService.findFirst(eq(portfolioRecords.id, id));
  }
}
