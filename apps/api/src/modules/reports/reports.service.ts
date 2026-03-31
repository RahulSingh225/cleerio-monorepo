import { Injectable } from '@nestjs/common';
import { db, portfolioRecords } from '@platform/drizzle';
import { eq, sql, and, sum, count } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor() {}

  /**
   * Aggregate Portfolio Statistics using the Drizzle dynamic query builder.
   */
  async getPortfolioSummary(tenantId: string, portfolioId?: string) {
    const filters = [eq(portfolioRecords.tenantId, tenantId)];
    if (portfolioId) {
      filters.push(eq(portfolioRecords.portfolioId, portfolioId));
    }

    const [result] = await db
      .select({
        totalRecords: count(),
        totalOutstanding: sum(portfolioRecords.outstanding),
        totalOverdue: sum(portfolioRecords.overdue),
        activeBorrowers: count(portfolioRecords.id),
      })
      .from(portfolioRecords)
      .where(and(...filters));

    return {
      totalRecords: Number(result?.totalRecords) || 0,
      totalOutstanding: result?.totalOutstanding || '0',
      totalOverdue: result?.totalOverdue || '0',
      activeBorrowers: Number(result?.activeBorrowers) || 0,
      portfolioId: portfolioId || 'ALL',
    };
  }

  /**
   * DPD Distribution Report: Breakdown of records by bucket
   */
  async getDpdDistribution(tenantId: string) {
    return db
      .select({
        bucket: portfolioRecords.dpdBucket,
        count: count(),
        totalOverdue: sum(portfolioRecords.overdue),
      })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.tenantId, tenantId))
      .groupBy(portfolioRecords.dpdBucket);
  }
}
