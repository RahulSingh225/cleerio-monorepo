import { Injectable } from '@nestjs/common';
import { eq, SQL } from 'drizzle-orm';
import { db, portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';

@Injectable()
export class PortfolioRecordsService extends BaseRepository<typeof portfolioRecords> {
  constructor() {
    super(portfolioRecords, db);
  }

  /**
   * Cera-style Query Engine: Building dynamic access filters based on user roles for records.
   */
  buildAccessFilter(user: AuthenticatedUser): SQL | undefined {
    // If we have row-level permissions (e.g. employeeId assigned to a user), we handle it here.
    // For now, based on roles:
    if (user.role === 'tenant_admin' || user.isPlatformUser) {
      return undefined;
    }
    
    // Example: Analysts only see records in portfolios they own
    // This would require a join with the portfolios table in a more complex builder,
    // but for simple cases we stick to direct table columns.
    return undefined; 
  }

  async insertBulkRecords(records: any[]) {
    return this._db.insert(portfolioRecords).values(records).returning();
  }
}
