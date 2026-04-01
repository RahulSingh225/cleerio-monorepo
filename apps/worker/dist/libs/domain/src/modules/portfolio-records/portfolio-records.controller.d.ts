import { PortfolioRecordsService } from './portfolio-records.service';
export declare class PortfolioRecordsController {
    private readonly recordsService;
    constructor(recordsService: PortfolioRecordsService);
    findByPortfolio(portfolioId: string, limit?: number, offset?: number): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
}
