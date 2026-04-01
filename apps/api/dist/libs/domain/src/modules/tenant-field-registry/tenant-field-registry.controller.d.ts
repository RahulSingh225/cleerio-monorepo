import { TenantFieldRegistryService } from './tenant-field-registry.service';
import { CreateFieldMappingDto } from './dto/create-field-mapping.dto';
export declare class TenantFieldRegistryController {
    private readonly registryService;
    constructor(registryService: TenantFieldRegistryService);
    createMapping(createFieldMappingDto: CreateFieldMappingDto): Promise<any[] | import("pg").QueryResult<never>>;
    getMapping(): Promise<{
        [x: string]: any;
    }[]>;
}
