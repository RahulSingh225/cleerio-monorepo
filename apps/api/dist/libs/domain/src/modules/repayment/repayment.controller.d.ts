import { RepaymentService } from './repayment.service';
export declare class RepaymentController {
    private readonly repaymentService;
    constructor(repaymentService: RepaymentService);
    createSync(body: any): Promise<{
        data: {
            id: string;
            status: string;
            createdAt: Date | null;
            tenantId: string;
            sourceType: string;
            fileUrl: string | null;
            uploadedBy: string | null;
            recordsUpdated: number | null;
            syncDate: string;
        };
    }>;
    findAll(): Promise<{
        data: {
            id: string;
            tenantId: string;
            sourceType: string;
            fileUrl: string | null;
            status: string;
            recordsUpdated: number | null;
            uploadedBy: string | null;
            syncDate: string;
            createdAt: Date | null;
        }[];
    }>;
    findRecords(portfolioRecordId: string): Promise<{
        data: {
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
        }[];
    }>;
}
