import { Injectable } from '@nestjs/common';
import { db, portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class PortfolioRecordsService extends BaseRepository<typeof portfolioRecords> {
  constructor() {
    super(portfolioRecords, db);
  }

  async insertBulkRecords(records: any[]) {
    // Basic bulk insert mapping directly leveraging Drizzle schema
    // Note: Drizzle's pgTable handles mapping JS arrays -> Postgres values
    return this._db.insert(portfolioRecords).values(records).returning();
  }

  // Example dynamic find query taking advantage of base repository scoping
  async findByDynamicField(fieldKey: string, value: string) {
    // To query JSONB we use sql`` tagged templates combined with scoped BaseRepo where clauses
    // E.g. SELECT * FROM portfolio_records WHERE dynamic_fields->>'field3' = 'value'
    // Utilizing basic raw SQL syntax cleanly integrated into Drizzle
     // `await this.findMany({ where: sql\`\${portfolioRecords.dynamicFields}->>'\${sql.raw(fieldKey)}' = '\${value}'\` })`
  }
}
