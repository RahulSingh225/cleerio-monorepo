import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { db, deliveryLogs, commEvents, tenantFieldRegistry } from '@platform/drizzle';
import { eq, and } from 'drizzle-orm';
import { TemplateRendererService } from '../comm-templates/template-renderer.service';

@Injectable()
export class GenericDispatcherService {
  private readonly logger = new Logger(GenericDispatcherService.name);

  constructor(private readonly templateRenderer: TemplateRendererService) {}

  /**
   * Dispatches a communication via a generic HTTP API based on the channel's blueprint.
   */
  async dispatch(
    tenantId: string,
    event: any,
    record: any,
    channelConfig: any,
    template: any
  ) {
    const { dispatchApiTemplate } = channelConfig;
    if (!dispatchApiTemplate || !dispatchApiTemplate.url) {
      throw new Error(`Channel ${channelConfig.channel} for tenant ${tenantId} missing dispatchApiTemplate`);
    }

    // 1. Prepare variables for resolution — dynamically from the full record
    const variables: Record<string, any> = {};

    // Populate all record columns (covers every core + feedback column automatically)
    for (const [key, value] of Object.entries(record)) {
      if (key === 'dynamicFields' || key === 'deletedAt') continue;
      variables[key] = value;
      // Add snake_case alias: employerName → employer_name
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey !== key) variables[snakeKey] = value;
    }

    // Legacy alias
    variables['overdue'] = record.outstanding;

    // Spread dynamic fields from portfolio_records.dynamic_fields
    const dynFields = (record.dynamicFields as Record<string, any>) || {};
    Object.assign(variables, dynFields);

    // Provider specifics (Precedence: Template > Record)
    variables['TEMPLATE_ID'] = template?.providerTemplateId;
    variables['templateId'] = template?.providerTemplateId;
    variables['template_id'] = template?.providerTemplateId;
    variables['providerTemplateId'] = template?.providerTemplateId;

    // Resolve fieldN aliases from tenant_field_registry
    // Maps abstract keys like "field4" → the actual value (e.g. record.name)
    try {
      const registryFields = await db
        .select({ fieldKey: tenantFieldRegistry.fieldKey, displayLabel: tenantFieldRegistry.displayLabel, headerName: tenantFieldRegistry.headerName, isCore: tenantFieldRegistry.isCore })
        .from(tenantFieldRegistry)
        .where(eq(tenantFieldRegistry.tenantId, tenantId));

      for (const rf of registryFields) {
        // Core fields: displayLabel is the record column name (e.g. "name", "outstanding")
        // Dynamic fields: headerName is the key in dynamicFields JSONB (e.g. "overdue_amount")
        const resolvedKey = rf.isCore ? rf.displayLabel : rf.headerName;
        if (resolvedKey && variables[resolvedKey] !== undefined) {
          variables[rf.fieldKey] = variables[resolvedKey];
        }
      }
    } catch (err) {
      this.logger.warn(`Could not resolve field registry aliases: ${(err as Error).message}`);
    }


    // 2. Resolve providerVariables from template if present
    // These are specific mappings like {"vendorVar": "VAR1", "systemVar": "name"}
    const templateVars: Record<string, any> = {};
    if (template.providerVariables && Array.isArray(template.providerVariables)) {
        template.providerVariables.forEach((mapping: any) => {
            if (mapping.vendorVar && mapping.systemVar) {
                let val = mapping.systemVar;
                if (typeof val === 'string' && val.includes('{{')) {
                    // It's a template string (e.g. "{{field4}}" or "https://pay.me/{{outstanding}}")
                    val = this.templateRenderer.renderBody(val, variables);
                } else if (mapping.systemVar in variables) {
                    // Legacy support: if they just typed "name" or "mobile" without brackets
                    val = variables[mapping.systemVar] || '';
                }
                
                variables[mapping.vendorVar] = val;
                templateVars[mapping.vendorVar] = val;
            }
        });
    }

    // 3. Resolve the API Blueprint
    const resolvedUrl = this.templateRenderer.renderBody(dispatchApiTemplate.url, variables);
    const resolvedHeaders = this.templateRenderer.renderObject(dispatchApiTemplate.headers || {}, variables, templateVars);
    const resolvedBody = this.templateRenderer.renderObject(dispatchApiTemplate.bodyTemplate || {}, variables, templateVars);
    const method = (dispatchApiTemplate.method || 'POST').toUpperCase();

    // 4. Fire the HTTP request
    this.logger.log(`Dispatching ${channelConfig.channel} to ${record.mobile} via ${resolvedUrl}`);
    this.logger.debug(`Template vars resolved: ${JSON.stringify(templateVars)}`);
    this.logger.debug(`Resolved body: ${JSON.stringify(resolvedBody)}`);
    
    let response;
    let status = 'sent';
    let error = null;

    try {
      response = await axios({
        method,
        url: resolvedUrl,
        headers: resolvedHeaders,
        data: resolvedBody,
        timeout: 10000, // 10s safety
      });
      
      this.logger.debug(`Vendor Response [${response.status}]: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      this.logger.error(`Dispatch failed for event ${event.id}: ${err.message}`);
      status = 'failed';
      error = err.response?.data || err.message;
    }

    // 5. Generate cURL for manual debugging
    const headerString = Object.entries(resolvedHeaders)
      .map(([k, v]) => `-H "${k}: ${v}"`)
      .join(' ');
    
    // Ensure body is safely quoted for shell
    const escapedBody = JSON.stringify(resolvedBody).replace(/'/g, "'\\''");
    const bodyString = method !== 'GET' ? `-d '${escapedBody}'` : '';
    const curlCommand = `curl -X ${method} "${resolvedUrl}" ${headerString} ${bodyString}`;

    // 6. Update event and write log
    await db.update(commEvents).set({
      status: status === 'sent' ? 'sent' : 'failed',
      sentAt: status === 'sent' ? new Date() : null,
      resolvedBody: JSON.stringify(resolvedBody),
    }).where(eq(commEvents.id, event.id));

    await db.insert(deliveryLogs).values({
      eventId: event.id,
      tenantId,
      providerName: channelConfig.providerName || channelConfig.channel,
      providerMsgId: response?.data?.request_id || response?.data?.requestId || response?.data?.id || response?.data?.msgid || response?.data?.message || `local_${Date.now()}`,
      deliveryStatus: status,
      errorCode: error ? String((error as any).code || 'ERR') : null,
      errorMessage: error ? (typeof error === 'string' ? error : JSON.stringify(error)) : null,
      callbackPayload: {
        request: {
          url: resolvedUrl,
          method,
          headers: resolvedHeaders,
          body: resolvedBody,
          curl: curlCommand
        },
        response: response?.data || null,
        error: error || null
      }
    });

    return { status, response: response?.data };
  }
}
