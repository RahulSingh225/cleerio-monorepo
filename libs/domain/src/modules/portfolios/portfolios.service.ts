import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { eq, SQL } from 'drizzle-orm';
import { db, portfolios, portfolioRecords, taskQueue, portfolioMappingProfiles } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
import { TenantFieldRegistryService } from '../tenant-field-registry/tenant-field-registry.service';
import { PortfolioRecordsService } from '../portfolio-records/portfolio-records.service';

@Injectable()
export class PortfoliosService extends BaseRepository<typeof portfolios> {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(
    private readonly registryService: TenantFieldRegistryService,
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

  async parseCsvHeadersAndPreview(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[] }> {
    const csvData = fileBuffer.toString('utf-8');
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        preview: 5, // only parse first 5 rows for UI preview
        complete: (results) => {
          resolve({
            headers: results.meta.fields || [],
            rows: results.data
          });
        },
        error: (error: any) => reject(error),
      });
    });
  }

  /**
   * Full Portfolio Lifecycle: CSV -> Field Mapping -> Bulk Ingest
   * 
   * @param userMappings - Mappings from the upload wizard UI: { "CSV Header": "userId" | "mobile" | "custom_key", ... }
   *   Core values: userId, mobile, name, product, currentDpd, outstanding
   *   Anything else is treated as a dynamic field.
   * @param profileId - Optional: Reuse an existing mapping profile
   * @param profileName - Optional: Name for auto-creating a new mapping profile
   */
  async parseAndIngestCSV(
    fileBuffer: Buffer,
    tenantId: string,
    portfolioId: string,
    userMappings: Record<string, string> = {},
    profileId?: string,
    profileName?: string,
  ) {
    const csvData = fileBuffer.toString('utf-8');

    // If a saved profile was selected, load its mappings as the base
    if (profileId && Object.keys(userMappings).length === 0) {
      const [profile] = await db
        .select()
        .from(portfolioMappingProfiles)
        .where(eq(portfolioMappingProfiles.id, profileId))
        .limit(1)
        .execute();
      if (profile?.mappings) {
        userMappings = profile.mappings as Record<string, string>;
      }
    }

    // Core fields that map to top-level columns on portfolio_records
    const CORE_FIELD_SET = new Set([
      'userId', 'mobile', 'name', 'product', 'employerName', 'currentDpd', 'outstanding',
      // Promoted core fields (from stakeholder data requirements)
      'loanNumber', 'email', 'dueDate', 'emiAmount', 'language', 'state', 'city',
      'cibilScore', 'salaryDate', 'enachEnabled', 'loanAmount',
    ]);

    // Build the inverse mapping: CSV header → { coreField?: string, dynamicKey?: string }
    // Step 1: Start from user-provided mappings
    const headerMapping = new Map<string, { coreField?: string; dynamicKey?: string }>();

    for (const [csvHeader, mappedValue] of Object.entries(userMappings)) {
      if (CORE_FIELD_SET.has(mappedValue)) {
        headerMapping.set(csvHeader, { coreField: mappedValue });
      } else {
        // Treat as dynamic field — the mappedValue becomes the fieldKey label
        headerMapping.set(csvHeader, { dynamicKey: mappedValue });
      }
    }

    // Step 2: For headers NOT in userMappings, check tenant_field_registry
    const existingRegistry = await this.registryService.getMappingForTenant();
    const registryByHeader = new Map(existingRegistry.map(r => [r.headerName.toLowerCase().trim(), r]));

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data as Record<string, string>[];
            const allHeaders = results.meta.fields || [];

            // Step 3: Auto-create registry entries for unmapped headers
            let nextFieldIndex = existingRegistry.length;
            for (const header of allHeaders) {
              if (headerMapping.has(header)) continue; // Already mapped by user

              const existing = registryByHeader.get(header.toLowerCase().trim());
              if (existing) {
                // Use existing registry entry
                const mappedCore = CORE_FIELD_SET.has(existing.displayLabel) ? existing.displayLabel : undefined;
                headerMapping.set(header, mappedCore
                  ? { coreField: mappedCore }
                  : { dynamicKey: existing.fieldKey });
              } else {
                // Create new dynamic field entry
                const fieldKey = `field${nextFieldIndex + 1}`;
                nextFieldIndex++;
                headerMapping.set(header, { dynamicKey: fieldKey });

                // Persist to tenant_field_registry for future uploads
                try {
                  await this.registryService.insert({
                    tenantId,
                    fieldKey,
                    fieldIndex: nextFieldIndex,
                    headerName: header,
                    displayLabel: header,
                    dataType: 'string',
                    isCore: false,
                    isPii: false,
                  });
                } catch (regErr: any) {
                  // Ignore duplicates (unique constraint), log otherwise
                  if (!regErr.message?.includes('duplicate')) {
                    this.logger.warn(`Failed to auto-register field "${header}": ${regErr.message}`);
                  }
                }
              }
            }

            // Also persist core mappings that came from user to registry (if not already there)
            for (const [csvHeader, mapping] of headerMapping.entries()) {
              if (mapping.coreField && !registryByHeader.has(csvHeader.toLowerCase().trim())) {
                try {
                  const fieldKey = `field${nextFieldIndex + 1}`;
                  nextFieldIndex++;
                  await this.registryService.insert({
                    tenantId,
                    fieldKey,
                    fieldIndex: nextFieldIndex,
                    headerName: csvHeader,
                    displayLabel: mapping.coreField,
                    dataType: ['currentDpd'].includes(mapping.coreField) ? 'number'
                      : ['outstanding'].includes(mapping.coreField) ? 'number'
                      : 'string',
                    isCore: true,
                    isPii: ['mobile', 'name'].includes(mapping.coreField),
                  });
                } catch (regErr: any) {
                  if (!regErr.message?.includes('duplicate')) {
                    this.logger.warn(`Failed to register core mapping "${csvHeader}": ${regErr.message}`);
                  }
                }
              }
            }

            // Step 4: Build records
            const recordsToInsert: any[] = [];

            for (const row of rows) {
              const dynamicFields: Record<string, any> = {};
              const record: any = {
                portfolioId,
                tenantId,
                dynamicFields,
              };

              for (const [header, value] of Object.entries(row)) {
                const mapping = headerMapping.get(header);
                if (!mapping) continue;

                if (mapping.coreField) {
                  // Set on the top-level record object
                  const numericCoreFields = ['currentDpd', 'outstanding', 'emiAmount', 'cibilScore', 'salaryDate', 'loanAmount'];
                  const dateCoreFields = ['dueDate'];
                  const booleanCoreFields = ['enachEnabled'];

                  let fieldType = 'string';
                  if (numericCoreFields.includes(mapping.coreField)) fieldType = 'number';
                  else if (dateCoreFields.includes(mapping.coreField)) fieldType = 'date';
                  else if (booleanCoreFields.includes(mapping.coreField)) fieldType = 'boolean';

                  record[mapping.coreField] = this.coerceValue(value, fieldType);
                }

                if (mapping.dynamicKey) {
                  // Store in dynamic_fields JSONB
                  dynamicFields[mapping.dynamicKey] = value;
                }
              }

              // Validate required fields — skip records missing userId or mobile
              if (!record.userId || !record.mobile) {
                this.logger.warn(`Skipping row — missing userId or mobile: ${JSON.stringify(row).substring(0, 100)}`);
                continue;
              }

              recordsToInsert.push(record);
            }

            // Step 5: Bulk Insert
            if (recordsToInsert.length > 0) {
              await this.recordsService.insertBulkRecords(recordsToInsert);
            }

            // Step 6: Create a Job for the worker (segmentation trigger)
            await db.insert(taskQueue).values({
              tenantId,
              jobType: 'portfolio.ingest',
              status: 'pending',
              payload: { portfolioId, tenantId },
              priority: 1,
              runAfter: new Date(),
            });

            // Step 6.5: Auto-create or link mapping profile
            let linkedProfileId = profileId || null;
            if (!linkedProfileId) {
              // Build the final mappings object from headerMapping
              const finalMappings: Record<string, string> = {};
              for (const [header, mapping] of headerMapping.entries()) {
                finalMappings[header] = mapping.coreField || mapping.dynamicKey || header;
              }
              const autoProfileName = profileName || `Upload ${new Date().toISOString().split('T')[0]}`;
              try {
                const [newProfile] = await db
                  .insert(portfolioMappingProfiles)
                  .values({
                    tenantId,
                    name: autoProfileName,
                    mappings: finalMappings,
                    headers: allHeaders,
                    fieldCount: allHeaders.length,
                  })
                  .returning();
                linkedProfileId = newProfile.id;
              } catch (profileErr: any) {
                // If name conflict, try with a timestamp suffix
                if (profileErr.message?.includes('duplicate')) {
                  try {
                    const [newProfile] = await db
                      .insert(portfolioMappingProfiles)
                      .values({
                        tenantId,
                        name: `${autoProfileName} (${Date.now()})`,
                        mappings: finalMappings,
                        headers: allHeaders,
                        fieldCount: allHeaders.length,
                      })
                      .returning();
                    linkedProfileId = newProfile.id;
                  } catch { /* silent */ }
                }
              }
            }

            // Step 7: Update Portfolio Status
            const failedCount = rows.length - recordsToInsert.length;
            await this.update(eq(portfolios.id, portfolioId), {
              status: 'completed',
              totalRecords: rows.length,
              processedRecords: recordsToInsert.length,
              failedRecords: failedCount,
              ...(linkedProfileId ? { mappingProfileId: linkedProfileId } : {}),
            });

            resolve({
              totalProcessed: recordsToInsert.length,
              totalFailed: failedCount,
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

