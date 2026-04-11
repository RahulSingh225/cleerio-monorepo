import { TenantFieldRegistryService } from './tenant-field-registry.service';
import { CreateFieldMappingDto } from './dto/create-field-mapping.dto';
export declare class TenantFieldRegistryController {
    private readonly registryService;
    constructor(registryService: TenantFieldRegistryService);
    createMapping(createFieldMappingDto: CreateFieldMappingDto): Promise<any[] | import("pg").QueryResult<never>>;
    getMapping(): Promise<{
        [x: string]: any;
    }[]>;
    getProfiles(): Promise<{
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
    }[]>;
    getProfile(id: string): Promise<{
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
    }>;
    createProfile(body: {
        name: string;
        description?: string;
        mappings: Record<string, string>;
        headers: string[];
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        description: string | null;
        mappings: unknown;
        headers: unknown;
        fieldCount: number | null;
        isDefault: boolean | null;
    }>;
    updateProfile(id: string, body: {
        name?: string;
        description?: string;
        mappings?: Record<string, string>;
        headers?: string[];
    }): Promise<{
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
    }>;
}
