import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: string;
        name: string;
        code: string;
        status: string;
        settings: unknown;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    findOne(code: string): Promise<{
        [x: string]: any;
    }>;
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
}
