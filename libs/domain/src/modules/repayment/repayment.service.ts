import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db, repaymentRecords, repaymentSyncs, portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class RepaymentService extends BaseRepository<typeof repaymentSyncs> {
  constructor() {
    super(repaymentSyncs, db);
  }

  async createSync(data: typeof repaymentSyncs.$inferInsert) {
    return this._db.insert(repaymentSyncs).values(data).returning();
  }

  async processSync(syncId: string, records: Array<{
    userId: string;
    paymentDate: string;
    amount: number;
    paymentType?: string;
    reference?: string;
  }>) {
    const [sync] = await db
      .select()
      .from(repaymentSyncs)
      .where(eq(repaymentSyncs.id, syncId))
      .execute();

    if (!sync) throw new Error(`Repayment sync ${syncId} not found`);

    let updated = 0;

    for (const record of records) {
      // Match portfolio record by user_id
      const [portfolioRecord] = await db
        .select()
        .from(portfolioRecords)
        .where(
          and(
            eq(portfolioRecords.tenantId, sync.tenantId),
            eq(portfolioRecords.userId, record.userId),
          ),
        )
        .limit(1)
        .execute();

      if (!portfolioRecord) continue;

      // Insert repayment record
      await db.insert(repaymentRecords).values({
        tenantId: sync.tenantId,
        portfolioRecordId: portfolioRecord.id,
        repaymentSyncId: syncId,
        paymentDate: record.paymentDate,
        amount: String(record.amount),
        paymentType: record.paymentType || 'payment',
        reference: record.reference,
      });

      // Update portfolio record outstanding
      const currentOutstanding = Number(portfolioRecord.outstanding || 0);
      const currentRepaid = Number(portfolioRecord.totalRepaid || 0);
      const newOutstanding = Math.max(0, currentOutstanding - record.amount);

      await db
        .update(portfolioRecords)
        .set({
          outstanding: String(newOutstanding),
          totalRepaid: String(currentRepaid + record.amount),
          lastRepaymentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(portfolioRecords.id, portfolioRecord.id));

      updated++;
    }

    // Update sync record
    await db
      .update(repaymentSyncs)
      .set({ status: 'completed', recordsUpdated: updated })
      .where(eq(repaymentSyncs.id, syncId));

    return { syncId, updated };
  }

  async findSyncsByTenant(tenantId: string) {
    return db
      .select()
      .from(repaymentSyncs)
      .where(eq(repaymentSyncs.tenantId, tenantId))
      .orderBy(repaymentSyncs.createdAt)
      .execute();
  }

  async findRecordsByPortfolioRecord(portfolioRecordId: string) {
    return db
      .select()
      .from(repaymentRecords)
      .where(eq(repaymentRecords.portfolioRecordId, portfolioRecordId))
      .orderBy(repaymentRecords.paymentDate)
      .execute();
  }
}
