import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { eq, and } from 'drizzle-orm';
import { db, repaymentSyncs, portfolioRecords, repaymentRecords } from '@platform/drizzle';
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
    
    this.logger.log(`[Sync ${syncRecord.id}] Started processing for tenant ${tenantId}.`);

    const csvData = fileBuffer.toString('utf-8');
    let recordsUpdated = 0;

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data as Record<string, string>[];
            this.logger.log(`[Sync ${syncRecord.id}] Successfully parsed ${rows.length} rows from CSV.`);

            for (const [index, row] of rows.entries()) {
              try {
                const userId = row['user_id'] || row['userid'] || row['userId'];
                const mobile = row['mobile'] || row['Mobile Number'];
                
                if (!userId && !mobile) {
                  this.logger.warn(`[Sync ${syncRecord.id}] Row ${index + 1}: Skipped - missing userId and mobile.`);
                  continue;
                }

              // Find matching portfolio record
              let filter;
              if (userId) {
                filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.userId, userId));
              } else {
                filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.mobile, mobile!));
              }

              const [existingRecord] = await db.select().from(portfolioRecords).where(filter!).limit(1);
              if (!existingRecord) {
                this.logger.warn(`[Sync ${syncRecord.id}] Row ${index + 1}: Skipped - No portfolio record found for user ${userId || mobile}.`);
                continue;
              }

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

              const amountPaid = row['amount'] || row['Amount'] || row['paid_amount'];
              if (amountPaid) {
                const paid = Number(amountPaid);
                if (!isNaN(paid) && paid > 0) {
                  const currentOutstanding = Number(existingRecord.outstanding || 0);
                  const currentRepaid = Number(existingRecord.totalRepaid || 0);
                  updateData.outstanding = String(Math.max(0, currentOutstanding - paid));
                  updateData.totalRepaid = String(currentRepaid + paid);
                  updateData.lastRepaymentAt = new Date();
                  
                  this.logger.log(`[Sync ${syncRecord.id}] Row ${index + 1}: Processed payment of ${paid} for ${existingRecord.userId}`);
                  
                  // Insert repayment record
                  await db.insert(repaymentRecords).values({
                    tenantId,
                    portfolioRecordId: existingRecord.id,
                    repaymentSyncId: syncRecord.id,
                    paymentDate: new Date().toISOString().split('T')[0], // Default to today
                    amount: String(paid),
                    paymentType: 'payment',
                  });
                } else {
                  this.logger.warn(`[Sync ${syncRecord.id}] Row ${index + 1}: Invalid amount format '${amountPaid}'.`);
                }
              }

              await db.update(portfolioRecords).set(updateData).where(eq(portfolioRecords.id, existingRecord.id));
              recordsUpdated++;
              } catch (rowError: any) {
                this.logger.error(`[Sync ${syncRecord.id}] Row ${index + 1}: Error processing row: ${rowError.message}`);
              }
            }

            // Update sync record
            await this._db.update(repaymentSyncs).set({
              status: 'completed',
              recordsUpdated,
            }).where(eq(repaymentSyncs.id, syncRecord.id));

            this.logger.log(`[Sync ${syncRecord.id}] Completed. Successfully updated ${recordsUpdated} records.`);
            resolve({ syncId: syncRecord.id, recordsUpdated, status: 'completed' });
          } catch (err: any) {
            this.logger.error(`[Sync ${syncRecord.id}] Fatal error during sync: ${err.message}`);
            await this._db.update(repaymentSyncs).set({ status: 'failed' }).where(eq(repaymentSyncs.id, syncRecord.id));
            reject(err);
          }
        },
        error: (error: any) => {
          this.logger.error(`PapaParse error: ${error.message}`);
          reject(error);
        },
      });
    });
  }
}
