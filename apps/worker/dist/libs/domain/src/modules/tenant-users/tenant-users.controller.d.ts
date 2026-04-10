import { TenantUsersService } from './tenant-users.service';
import { CreateTenantUserDto, UpdateTenantUserDto } from './dto/create-tenant-user.dto';
export declare class TenantUsersController {
    private readonly tenantUsersService;
    constructor(tenantUsersService: TenantUsersService);
    create(dto: CreateTenantUserDto, req: any): Promise<{
        id: string;
        name: string | null;
        status: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        email: string;
        passwordHash: string | null;
        role: string;
        tenantId: string;
        invitedBy: string | null;
        lastLoginAt: Date | null;
    }[]>;
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
    update(id: string, dto: UpdateTenantUserDto): Promise<{
        [x: string]: any;
    }[]>;
    deactivate(id: string): Promise<{
        [x: string]: any;
    }[]>;
}
