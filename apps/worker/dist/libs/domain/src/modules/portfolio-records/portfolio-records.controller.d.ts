import { PortfolioRecordsService } from './portfolio-records.service';
export declare class PortfolioRecordsController {
    private readonly recordsService;
    constructor(recordsService: PortfolioRecordsService);
    getAvailableFields(): Promise<{
        data: {
            key: string;
            label: string;
            dataType: string;
            isCore: boolean;
        }[];
    }>;
    getCount(): Promise<{
        data: {
            count: number;
        };
    }>;
    findByPortfolio(portfolioId: string, limit?: number, offset?: number): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
}
