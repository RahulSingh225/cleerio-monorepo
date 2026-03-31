import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db, platformUsers, tenantUsers } from '@platform/drizzle';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validatePlatformUser(email: string, pass: string): Promise<any> {
    const [user] = await db.select().from(platformUsers).where(eq(platformUsers.email, email)).limit(1);
    if (user && await bcrypt.compare(pass, user.passwordHash || '')) {
      const { passwordHash, ...result } = user;
      return { ...result, isPlatformUser: true };
    }
    return null;
  }

  async validateTenantUser(email: string, pass: string, tenantId: string): Promise<any> {
    const [user] = await db
        .select()
        .from(tenantUsers)
        .where(eq(tenantUsers.email, email))
        .limit(1);
        
    // In real app we also check if user.tenantId === tenantId
    if (user && user.tenantId === tenantId && await bcrypt.compare(pass, user.passwordHash || '')) {
      const { passwordHash, ...result } = user;
      return { ...result, isPlatformUser: false };
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, 
        tenantId: user.tenantId || null,
        isPlatformUser: user.isPlatformUser
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
