import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { eq, and } from 'drizzle-orm';
import { db, repaymentSyncs, portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { DpdBucketConfigsService } from '../dpd-bucket-configs/dpd-bucket-configs.service';

@Injectable()
export class RepaymentSyncsService extends BaseRepository<typeof repaymentSyncs> {
  private readonly logger = new Logger(RepaymentSyncsService.name);

  constructor(private readonly bucketService: DpdBucketConfigsService) {
    super(repaymentSyncs, db);
  }

  async uploadAndSync(fileBuffer: Buffer, tenantId: string, uploadedBy: string) {
    // 1. Create a repayment sync record
    const [syncRecord] = await this._db.insert(repaymentSyncs).values({
      tenantId,
      sourceType: 'csv',
      status: 'processing',
      uploadedBy,
      syncDate: new Date().toISOString().split('T')[0],
    }).returning();

    const csvData = fileBuffer.toString('utf-8');
    let recordsUpdated = 0;

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data as Record<string, string>[];

            for (const row of rows) {
              const userId = row['user_id'] || row['userid'] || row['userId'];
              const mobile = row['mobile'] || row['Mobile Number'];
              if (!userId && !mobile) continue;

              // Find matching portfolio record
              let filter;
              if (userId) {
                filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.userId, userId));
              } else {
                filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.mobile, mobile!));
              }

              const [existingRecord] = await db.select().from(portfolioRecords).where(filter!).limit(1);
              if (!existingRecord) continue;

              // Build update payload
              const updateData: any = { updatedAt: new Date(), lastSyncedAt: new Date() };
              if (row['overdue'] || row['over_due']) updateData.overdue = row['overdue'] || row['over_due'];
              if (row['outstanding'] || row['outstandings']) updateData.outstanding = row['outstanding'] || row['outstandings'];
              if (row['current_dpd'] || row['currentDpd']) {
                const newDpd = Number(row['current_dpd'] || row['currentDpd']);
                updateData.currentDpd = newDpd;
                // Re-resolve DPD bucket
                updateData.dpdBucket = await this.bucketService.resolveBucketForDpd(newDpd);
              }

              await db.update(portfolioRecords).set(updateData).where(eq(portfolioRecords.id, existingRecord.id));
              recordsUpdated++;
            }

            // Update sync record
            await this._db.update(repaymentSyncs).set({
              status: 'completed',
              recordsUpdated,
            }).where(eq(repaymentSyncs.id, syncRecord.id));

            resolve({ syncId: syncRecord.id, recordsUpdated, status: 'completed' });
          } catch (err: any) {
            this.logger.error(`Repayment sync failed: ${err.message}`);
            await this._db.update(repaymentSyncs).set({ status: 'failed' }).where(eq(repaymentSyncs.id, syncRecord.id));
            reject(err);
          }
        },
        error: (error: any) => reject(error),
      });
    });
  }
}
