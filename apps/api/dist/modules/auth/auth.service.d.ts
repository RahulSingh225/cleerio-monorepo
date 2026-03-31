import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    validatePlatformUser(email: string, pass: string): Promise<any>;
    validateTenantUser(email: string, pass: string, tenantId: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
