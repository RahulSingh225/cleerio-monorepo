import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSummary(req: any, portfolioId?: string): Promise<{
        totalRecords: number;
        totalOutstanding: string;
        totalRepaid: string;
        activeBorrowers: number;
        portfolioId: string;
    }>;
    getSegmentDist(req: any): Promise<{
        segmentId: string | null;
        count: number;
        totalOutstanding: string | null;
    }[]>;
}
