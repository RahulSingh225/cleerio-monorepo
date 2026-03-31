import type { TenantContextData } from '@platform/tenant';
import { PortfoliosService } from './portfolios.service';
export declare class PortfoliosController {
    private readonly portfoliosService;
    constructor(portfoliosService: PortfoliosService);
    uploadPortfolio(file: Express.Multer.File, tenant: TenantContextData): Promise<unknown>;
}
