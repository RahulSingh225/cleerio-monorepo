import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // 1. Check if already set by middleware (via headers)
    let tenantId = TenantContext.tenantId;
    
    // 2. Fallback to authenticated user info if context is missing
    // This allows dashboard calls to work even without x-tenant-id headers
    if (!tenantId && request.user?.tenantId) {
      tenantId = request.user.tenantId;
      // Note: We don't overwrite AsyncLocalStorage here as it's immutable for this execution
    }

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }

    // Attach resolved tenantId to request for easy access in controllers if needed
    request.resolvedTenantId = tenantId;

    return true;
  }
}
