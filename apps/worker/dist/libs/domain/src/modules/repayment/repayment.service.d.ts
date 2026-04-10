import { repaymentSyncs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class RepaymentService extends BaseRepository<typeof repaymentSyncs> {
    constructor();
    createSync(data: typeof repaymentSyncs.$inferInsert): Promise<{
        id: string;
        status: string;
        createdAt: Date | null;
        tenantId: string;
        sourceType: string;
        fileUrl: string | null;
        uploadedBy: string | null;
        recordsUpdated: number | null;
        syncDate: string;
    }[]>;
    processSync(syncId: string, records: Array<{
        userId: string;
        paymentDate: string;
        amount: number;
        paymentType?: string;
        reference?: string;
    }>): Promise<{
        syncId: string;
        updated: number;
    }>;
    findSyncsByTenant(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        sourceType: string;
        fileUrl: string | null;
        status: string;
        recordsUpdated: number | null;
        uploadedBy: string | null;
        syncDate: string;
        createdAt: Date | null;
    }[]>;
    findRecordsByPortfolioRecord(portfolioRecordId: string): Promise<{
        id: string;
        tenantId: string;
        portfolioRecordId: string;
        repaymentSyncId: string | null;
        paymentDate: string;
        amount: string;
        paymentType: string | null;
        reference: string | null;
        sourceRaw: unknown;
        createdAt: Date | null;
    }[]>;
}
