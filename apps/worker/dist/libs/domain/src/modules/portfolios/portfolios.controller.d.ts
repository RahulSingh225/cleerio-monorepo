import type { TenantContextData } from '@platform/tenant';
import { PortfoliosService } from './portfolios.service';
export declare class PortfoliosController {
    private readonly portfoliosService;
    constructor(portfoliosService: PortfoliosService);
    uploadPortfolio(file: Express.Multer.File, tenant: TenantContextData, req: any): Promise<{
        portfolioId: any;
        headers: string[];
        previewRows: any[];
        savedProfiles: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            mappings: unknown;
            headers: unknown;
            fieldCount: number | null;
            isDefault: boolean | null;
            createdAt: Date | null;
            updatedAt: Date | null;
        }[];
    }>;
    ingestPortfolio(portfolioId: string, file: Express.Multer.File, tenant: TenantContextData, req: any): Promise<{
        status: string;
        portfolioId: string;
    }>;
    findAll(req: any): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
    delete(id: string): Promise<any[] | import("pg").QueryResult<never>>;
}
