"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PortfoliosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfoliosService = void 0;
const common_1 = require("@nestjs/common");
const Papa = __importStar(require("papaparse"));
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
const tenant_field_registry_service_1 = require("../tenant-field-registry/tenant-field-registry.service");
const portfolio_records_service_1 = require("../portfolio-records/portfolio-records.service");
let PortfoliosService = PortfoliosService_1 = class PortfoliosService extends repository_1.BaseRepository {
    registryService;
    recordsService;
    logger = new common_1.Logger(PortfoliosService_1.name);
    constructor(registryService, recordsService) {
        super(drizzle_1.portfolios, drizzle_1.db);
        this.registryService = registryService;
        this.recordsService = recordsService;
    }
    buildAccessFilter(user) {
        if (user.role === 'tenant_admin' || user.isPlatformUser) {
            return undefined;
        }
        return (0, drizzle_orm_1.eq)(drizzle_1.portfolios.uploadedBy, user.userId);
    }
    async findAllForUser(user) {
        const accessFilter = this.buildAccessFilter(user);
        return this.findMany({ where: accessFilter });
    }
    async parseCsvHeadersAndPreview(fileBuffer) {
        const csvData = fileBuffer.toString('utf-8');
        return new Promise((resolve, reject) => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                preview: 5,
                complete: (results) => {
                    resolve({
                        headers: results.meta.fields || [],
                        rows: results.data
                    });
                },
                error: (error) => reject(error),
            });
        });
    }
    async parseAndIngestCSV(fileBuffer, tenantId, portfolioId, userMappings = {}, profileId, profileName) {
        const csvData = fileBuffer.toString('utf-8');
        if (profileId && Object.keys(userMappings).length === 0) {
            const [profile] = await drizzle_1.db
                .select()
                .from(drizzle_1.portfolioMappingProfiles)
                .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioMappingProfiles.id, profileId))
                .limit(1)
                .execute();
            if (profile?.mappings) {
                userMappings = profile.mappings;
            }
        }
        const CORE_FIELD_SET = new Set(['userId', 'mobile', 'name', 'product', 'employerId', 'currentDpd', 'outstanding']);
        const headerMapping = new Map();
        for (const [csvHeader, mappedValue] of Object.entries(userMappings)) {
            if (CORE_FIELD_SET.has(mappedValue)) {
                headerMapping.set(csvHeader, { coreField: mappedValue });
            }
            else {
                headerMapping.set(csvHeader, { dynamicKey: mappedValue });
            }
        }
        const existingRegistry = await this.registryService.getMappingForTenant();
        const registryByHeader = new Map(existingRegistry.map(r => [r.headerName.toLowerCase().trim(), r]));
        return new Promise((resolve, reject) => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const rows = results.data;
                        const allHeaders = results.meta.fields || [];
                        let nextFieldIndex = existingRegistry.length;
                        for (const header of allHeaders) {
                            if (headerMapping.has(header))
                                continue;
                            const existing = registryByHeader.get(header.toLowerCase().trim());
                            if (existing) {
                                const mappedCore = CORE_FIELD_SET.has(existing.displayLabel) ? existing.displayLabel : undefined;
                                headerMapping.set(header, mappedCore
                                    ? { coreField: mappedCore }
                                    : { dynamicKey: existing.fieldKey });
                            }
                            else {
                                const fieldKey = `field${nextFieldIndex + 1}`;
                                nextFieldIndex++;
                                headerMapping.set(header, { dynamicKey: fieldKey });
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
                                }
                                catch (regErr) {
                                    if (!regErr.message?.includes('duplicate')) {
                                        this.logger.warn(`Failed to auto-register field "${header}": ${regErr.message}`);
                                    }
                                }
                            }
                        }
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
                                }
                                catch (regErr) {
                                    if (!regErr.message?.includes('duplicate')) {
                                        this.logger.warn(`Failed to register core mapping "${csvHeader}": ${regErr.message}`);
                                    }
                                }
                            }
                        }
                        const recordsToInsert = [];
                        for (const row of rows) {
                            const dynamicFields = {};
                            const record = {
                                portfolioId,
                                tenantId,
                                dynamicFields,
                            };
                            for (const [header, value] of Object.entries(row)) {
                                const mapping = headerMapping.get(header);
                                if (!mapping)
                                    continue;
                                if (mapping.coreField) {
                                    record[mapping.coreField] = this.coerceValue(value, ['currentDpd'].includes(mapping.coreField) ? 'number' :
                                        ['outstanding'].includes(mapping.coreField) ? 'number' : 'string');
                                }
                                if (mapping.dynamicKey) {
                                    dynamicFields[mapping.dynamicKey] = value;
                                }
                            }
                            if (!record.userId || !record.mobile) {
                                this.logger.warn(`Skipping row — missing userId or mobile: ${JSON.stringify(row).substring(0, 100)}`);
                                continue;
                            }
                            recordsToInsert.push(record);
                        }
                        if (recordsToInsert.length > 0) {
                            await this.recordsService.insertBulkRecords(recordsToInsert);
                        }
                        await drizzle_1.db.insert(drizzle_1.taskQueue).values({
                            tenantId,
                            jobType: 'portfolio.ingest',
                            status: 'pending',
                            payload: { portfolioId, tenantId },
                            priority: 1,
                            runAfter: new Date(),
                        });
                        let linkedProfileId = profileId || null;
                        if (!linkedProfileId) {
                            const finalMappings = {};
                            for (const [header, mapping] of headerMapping.entries()) {
                                finalMappings[header] = mapping.coreField || mapping.dynamicKey || header;
                            }
                            const autoProfileName = profileName || `Upload ${new Date().toISOString().split('T')[0]}`;
                            try {
                                const [newProfile] = await drizzle_1.db
                                    .insert(drizzle_1.portfolioMappingProfiles)
                                    .values({
                                    tenantId,
                                    name: autoProfileName,
                                    mappings: finalMappings,
                                    headers: allHeaders,
                                    fieldCount: allHeaders.length,
                                })
                                    .returning();
                                linkedProfileId = newProfile.id;
                            }
                            catch (profileErr) {
                                if (profileErr.message?.includes('duplicate')) {
                                    try {
                                        const [newProfile] = await drizzle_1.db
                                            .insert(drizzle_1.portfolioMappingProfiles)
                                            .values({
                                            tenantId,
                                            name: `${autoProfileName} (${Date.now()})`,
                                            mappings: finalMappings,
                                            headers: allHeaders,
                                            fieldCount: allHeaders.length,
                                        })
                                            .returning();
                                        linkedProfileId = newProfile.id;
                                    }
                                    catch { }
                                }
                            }
                        }
                        const failedCount = rows.length - recordsToInsert.length;
                        await this.update((0, drizzle_orm_1.eq)(drizzle_1.portfolios.id, portfolioId), {
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
                    }
                    catch (err) {
                        this.logger.error(`Ingest failed: ${err.message}`, err.stack);
                        await this.update((0, drizzle_orm_1.eq)(drizzle_1.portfolios.id, portfolioId), { status: 'failed' });
                        reject(err);
                    }
                },
                error: (error) => reject(error),
            });
        });
    }
    coerceValue(value, type) {
        if (!value)
            return null;
        switch (type) {
            case 'number': return Number(value.replace(/[^0-9.-]+/g, ''));
            case 'date': return new Date(value);
            case 'boolean': return value.toLowerCase() === 'true' || value === '1';
            default: return value;
        }
    }
};
exports.PortfoliosService = PortfoliosService;
exports.PortfoliosService = PortfoliosService = PortfoliosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_field_registry_service_1.TenantFieldRegistryService,
        portfolio_records_service_1.PortfolioRecordsService])
], PortfoliosService);
//# sourceMappingURL=portfolios.service.js.map