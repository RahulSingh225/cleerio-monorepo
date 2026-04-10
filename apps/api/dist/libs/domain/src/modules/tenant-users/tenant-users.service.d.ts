import { tenantUsers } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class TenantUsersService extends BaseRepository<typeof tenantUsers> {
    constructor();
    createUser(data: {
        tenantId: string;
        email: string;
        name: string;
        password: string;
        role: string;
        invitedBy?: string;
    }): Promise<{
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
    updateUser(id: string, data: {
        name?: string;
        role?: string;
        status?: string;
        password?: string;
    }): Promise<{
        [x: string]: any;
    }[]>;
    deactivateUser(id: string): Promise<{
        [x: string]: any;
    }[]>;
}
