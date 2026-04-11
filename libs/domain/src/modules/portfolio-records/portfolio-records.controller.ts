import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard, TenantContext } from '@platform/tenant';
import { eq, and, count } from 'drizzle-orm';
import { db, portfolioRecords } from '@platform/drizzle';

@Controller('portfolio-records')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PortfolioRecordsController {
  constructor(private readonly recordsService: PortfolioRecordsService) {}

  /**
   * Introspect actual portfolio records to discover ALL available field keys.
   * This is the single source of truth for the segment rule builder.
   * Returns core columns + every key found in dynamicFields JSONB across sampled records.
   */
  @Get('fields')
  @ApiResponseConfig({
    message: 'Available fields retrieved',
    apiCode: 'FIELDS_RETRIEVED',
  })
  async getAvailableFields() {
    const tenantId = TenantContext.tenantId;
    // Sample up to 100 records to discover all dynamic field keys
    const sample = await db
      .select({
        dynamicFields: portfolioRecords.dynamicFields,
        product: portfolioRecords.product,
        currentDpd: portfolioRecords.currentDpd,
        outstanding: portfolioRecords.outstanding,
      })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.tenantId, tenantId!))
      .limit(100)
      .execute();

    // Core fields always available (from portfolio_records columns)
    const coreFields = [
      { key: 'current_dpd', label: 'Current DPD', dataType: 'number', isCore: true },
      { key: 'outstanding', label: 'Outstanding Amount', dataType: 'number', isCore: true },
      { key: 'total_repaid', label: 'Total Repaid', dataType: 'number', isCore: true },
      { key: 'product', label: 'Product / Loan Type', dataType: 'string', isCore: true },
      { key: 'employer_id', label: 'Employer ID', dataType: 'string', isCore: true },
      { key: 'name', label: 'Borrower Name', dataType: 'string', isCore: true },
      { key: 'mobile', label: 'Mobile Number', dataType: 'string', isCore: true },
      { key: 'user_id', label: 'User ID', dataType: 'string', isCore: true },
    ];

    // Collect all unique dynamic field keys from sampled records
    const dynamicKeySet = new Set<string>();
    for (const rec of sample) {
      const df = rec.dynamicFields as Record<string, any> | null;
      if (df && typeof df === 'object') {
        for (const key of Object.keys(df)) {
          dynamicKeySet.add(key);
        }
      }
    }

    // Convert dynamic keys to field objects
    const coreKeySet = new Set(coreFields.map(f => f.key));
    const dynamicFields = Array.from(dynamicKeySet)
      .filter(k => !coreKeySet.has(k))
      .map(key => {
        // Try to infer data type from sample values
        let dataType = 'string';
        for (const rec of sample) {
          const df = rec.dynamicFields as Record<string, any> | null;
          const val = df?.[key];
          if (val !== undefined && val !== null && val !== '') {
            if (!isNaN(Number(val))) { dataType = 'number'; }
            break;
          }
        }
        return {
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          dataType,
          isCore: false,
        };
      });

    return { data: [...coreFields, ...dynamicFields] };
  }

  @Get('count')
  @ApiResponseConfig({
    message: 'Record count retrieved',
    apiCode: 'RECORD_COUNT',
  })
  async getCount() {
    const count = await this.recordsService.totalCount();
    return { data: { count } };
  }

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

