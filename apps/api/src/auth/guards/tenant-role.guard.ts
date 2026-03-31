import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TenantContext } from '@platform/tenant';

@Injectable()
export class TenantRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    // Platform user has override capabilities over active tenants, or standard restrictions
    if (user.isPlatformUser && user.role === 'platform_admin') {
        return true;
    }

    // Role MUST match exactly from what is in token (which is locked to their tenant user)
    return requiredRoles.includes(user.role);
  }
}
