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
const dpd_bucket_configs_service_1 = require("../dpd-bucket-configs/dpd-bucket-configs.service");
const portfolio_records_service_1 = require("../portfolio-records/portfolio-records.service");
let PortfoliosService = PortfoliosService_1 = class PortfoliosService extends repository_1.BaseRepository {
    registryService;
    bucketService;
    recordsService;
    logger = new common_1.Logger(PortfoliosService_1.name);
    constructor(registryService, bucketService, recordsService) {
        super(drizzle_1.portfolios, drizzle_1.db);
        this.registryService = registryService;
        this.bucketService = bucketService;
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
    async parseAndIngestCSV(fileBuffer, tenantId, portfolioId) {
        const csvData = fileBuffer.toString('utf-8');
        const mappings = await this.registryService.getMappingForTenant();
        if (mappings.length === 0) {
            throw new Error('Tenant field registry is empty. Please configure mappings first.');
        }
        const mappingMap = new Map(mappings.map(m => [m.headerName.toLowerCase().trim(), m.fieldKey]));
        const coreIdentityFields = ['userId', 'mobile', 'name', 'product', 'employerId', 'currentDpd', 'overdue', 'outstanding'];
        return new Promise((resolve, reject) => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const rows = results.data;
                        const recordsToInsert = [];
                        for (const row of rows) {
                            const dynamicFields = {};
                            const record = {
                                portfolioId,
                                tenantId,
                                dynamicFields,
                            };
                            for (const [header, value] of Object.entries(row)) {
                                const normalizedHeader = header.toLowerCase().trim();
                                const fieldKey = mappingMap.get(normalizedHeader);
                                if (fieldKey) {
                                    dynamicFields[fieldKey] = value;
                                    const mapping = mappings.find(m => m.headerName.toLowerCase().trim() === normalizedHeader);
                                    if (mapping?.displayLabel) {
                                        const label = mapping.displayLabel.toLowerCase().replace(/\s/g, '');
                                        if (coreIdentityFields.includes(mapping.displayLabel)) {
                                            record[mapping.displayLabel] = this.coerceValue(value, mapping.dataType);
                                        }
                                    }
                                }
                            }
                            if (record.currentDpd !== undefined) {
                                record.dpdBucket = await this.bucketService.resolveBucketForDpd(Number(record.currentDpd));
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
                        await this.update((0, drizzle_orm_1.eq)(drizzle_1.portfolios.id, portfolioId), {
                            status: 'completed',
                            totalRecords: recordsToInsert.length,
                            processedRecords: recordsToInsert.length,
                        });
                        resolve({
                            totalProcessed: recordsToInsert.length,
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
        dpd_bucket_configs_service_1.DpdBucketConfigsService,
        portfolio_records_service_1.PortfolioRecordsService])
], PortfoliosService);
//# sourceMappingURL=portfolios.service.js.map