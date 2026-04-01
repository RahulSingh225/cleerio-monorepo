import type { TenantContextData } from '@platform/tenant';
import { PortfoliosService } from './portfolios.service';
export declare class PortfoliosController {
    private readonly portfoliosService;
    constructor(portfoliosService: PortfoliosService);
    uploadPortfolio(file: Express.Multer.File, tenant: TenantContextData, req: any): Promise<any>;
    findAll(req: any): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
    delete(id: string): Promise<any[] | import("pg").QueryResult<never>>;
}
