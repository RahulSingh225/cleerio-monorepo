import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { tenantStorage, TenantContextData } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Determine tenantId from header or subdomain logic
    // For this boilerplate, checking x-tenant-id header
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    const tenantCodeHeader = req.headers['x-tenant-code'] as string;

    const tenantContext: TenantContextData = {
      tenantId: tenantIdHeader || null,
      tenantCode: tenantCodeHeader || null,
    };

    // Run the remaining pipeline inside the context of AsyncLocalStorage
    tenantStorage.run(tenantContext, () => {
      // we could also attach it to the request object for easy decorator access
      (req as any).tenant = tenantContext;
      next();
    });
  }
}
