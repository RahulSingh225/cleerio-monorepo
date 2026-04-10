import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { eq, SQL } from 'drizzle-orm';
import { db, portfolios, portfolioRecords, taskQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
import { TenantFieldRegistryService } from '../tenant-field-registry/tenant-field-registry.service';
import { DpdBucketConfigsService } from '../dpd-bucket-configs/dpd-bucket-configs.service';
import { PortfolioRecordsService } from '../portfolio-records/portfolio-records.service';

@Injectable()
export class PortfoliosService extends BaseRepository<typeof portfolios> {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(
    private readonly registryService: TenantFieldRegistryService,
    private readonly bucketService: DpdBucketConfigsService,
    private readonly recordsService: PortfolioRecordsService,
  ) {
    super(portfolios, db);
  }

  /**
   * Cera-style Query Engine: Building dynamic access filters based on user roles.
   */
  buildAccessFilter(user: AuthenticatedUser): SQL | undefined {
    if (user.role === 'tenant_admin' || user.isPlatformUser) {
      return undefined;
    }
    return eq(portfolios.uploadedBy, user.userId);
  }

  async findAllForUser(user: AuthenticatedUser) {
    const accessFilter = this.buildAccessFilter(user);
    return this.findMany({ where: accessFilter });
  }

  /**
   * Full Portfolio Lifecycle: CSV -> Field Mapping -> Bucket Resolution -> Bulk Ingest
   */
  async parseAndIngestCSV(fileBuffer: Buffer, tenantId: string, portfolioId: string) {
    const csvData = fileBuffer.toString('utf-8');
    
    // 1. Fetch Field Mappings for this tenant
    const mappings = await this.registryService.getMappingForTenant();
    if (mappings.length === 0) {
      throw new Error('Tenant field registry is empty. Please configure mappings first.');
    }

    // Create a lookup map for faster processing: HeaderName -> FieldKey (field1, field2, etc.)
    const mappingMap = new Map(mappings.map(m => [m.headerName.toLowerCase().trim(), m.fieldKey]));
    const coreIdentityFields = ['userId', 'mobile', 'name', 'product', 'employerId', 'currentDpd', 'overdue', 'outstanding'];

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data as Record<string, string>[];
            const recordsToInsert: any[] = [];

            for (const row of rows) {
              const dynamicFields: Record<string, any> = {};
              const record: any = {
                portfolioId,
                tenantId,
                dynamicFields,
              };

              // Map each column to the correct fieldKey or core column
              for (const [header, value] of Object.entries(row)) {
                const normalizedHeader = header.toLowerCase().trim();
                const fieldKey = mappingMap.get(normalizedHeader);

                if (fieldKey) {
                  // If it's a fieldKey (field1, field2), it goes into dynamic_fields
                  dynamicFields[fieldKey] = value;

                  // Also check if this fieldKey is mapped to a core property (optional extension)
                  // For now, we manually look for core property aliases in mapping labels
                  const mapping = mappings.find(m => m.headerName.toLowerCase().trim() === normalizedHeader);
                  if (mapping?.displayLabel) {
                    const label = mapping.displayLabel.toLowerCase().replace(/\s/g, '');
                    if (coreIdentityFields.includes(mapping.displayLabel)) {
                        record[mapping.displayLabel] = this.coerceValue(value, mapping.dataType);
                    }
                  }
                }
              }

              // Resolve DPD Bucket if currentDpd is present
              if (record.currentDpd !== undefined) {
                record.dpdBucket = await this.bucketService.resolveBucketForDpd(Number(record.currentDpd));
              }

              recordsToInsert.push(record);
            }

            // 2. Optimized Bulk Insert
            if (recordsToInsert.length > 0) {
              await this.recordsService.insertBulkRecords(recordsToInsert);
            }

            // 3. Create a Job for the worker to process strategies
            await db.insert(taskQueue).values({
              tenantId,
              jobType: 'portfolio.ingest',
              status: 'pending',
              payload: { portfolioId, tenantId },
              priority: 1,
              runAfter: new Date(),
            });

            // 4. Update Portfolio Status
            await this.update(eq(portfolios.id, portfolioId), {
              status: 'completed',
              totalRecords: recordsToInsert.length,
              processedRecords: recordsToInsert.length,
            });

            resolve({
              totalProcessed: recordsToInsert.length,
              status: 'SUCCESS'
            });
          } catch (err) {
            this.logger.error(`Ingest failed: ${err.message}`, err.stack);
            await this.update(eq(portfolios.id, portfolioId), { status: 'failed' });
            reject(err);
          }
        },
        error: (error: any) => reject(error),
      });
    });
  }

  private coerceValue(value: string, type: string) {
    if (!value) return null;
    switch (type) {
      case 'number': return Number(value.replace(/[^0-9.-]+/g, ''));
      case 'date': return new Date(value);
      case 'boolean': return value.toLowerCase() === 'true' || value === '1';
      default: return value;
    }
  }
}
