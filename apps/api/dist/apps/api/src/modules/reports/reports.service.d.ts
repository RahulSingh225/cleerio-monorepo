export declare class ReportsService {
    constructor();
    getPortfolioSummary(tenantId: string, portfolioId?: string): Promise<{
        totalRecords: number;
        totalOutstanding: string;
        totalRepaid: string;
        activeBorrowers: number;
        portfolioId: string;
    }>;
    getDpdDistribution(tenantId: string): Promise<{
        bucket: string | null;
        count: number;
        totalOverdue: string | null;
    }[]>;
}
