export declare class ReportsService {
    constructor();
    getPortfolioSummary(tenantId: string, portfolioId?: string): Promise<{
        totalRecords: number;
        totalOutstanding: string;
        totalRepaid: string;
        activeBorrowers: number;
        portfolioId: string;
    }>;
    getSegmentDistribution(tenantId: string): Promise<{
        segmentId: string | null;
        count: number;
        totalOutstanding: string | null;
    }[]>;
}
