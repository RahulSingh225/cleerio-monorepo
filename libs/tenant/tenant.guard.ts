import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const tenantId = TenantContext.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }
    return true;
  }
}
