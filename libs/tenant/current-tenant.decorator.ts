import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContextData } from './tenant.context';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContextData => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
