export declare class CreateTenantUserDto {
    tenantId: string;
    email: string;
    name: string;
    password: string;
    role: string;
    invitedBy?: string;
}
export declare class UpdateTenantUserDto {
    name?: string;
    role?: string;
    status?: string;
    password?: string;
}
