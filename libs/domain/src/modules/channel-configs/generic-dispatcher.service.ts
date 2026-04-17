import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { db, deliveryLogs, commEvents } from '@platform/drizzle';
import { eq } from 'drizzle-orm';
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

    // 1. Prepare variables for resolution
    const variables: Record<string, any> = {
      // System Fields (original core)
      name: record.name,
      mobile: record.mobile,
      userId: record.userId,
      product: record.product,
      currentDpd: record.currentDpd,
      outstanding: record.outstanding,
      overdue: record.outstanding,
      employerName: record.employerName,
      
      // Promoted core fields (from stakeholder data requirements)
      loanNumber: record.loanNumber,
      email: record.email,
      dueDate: record.dueDate,
      emiAmount: record.emiAmount,
      language: record.language,
      state: record.state,
      city: record.city,
      cibilScore: record.cibilScore,
      salaryDate: record.salaryDate,
      enachEnabled: record.enachEnabled,
      loanAmount: record.loanAmount,
      
      // Provider specifics
      TEMPLATE_ID: template.providerTemplateId,
      
      // Dynamic fields from portfolio_records.dynamic_fields
      ...(record.dynamicFields as Record<string, any> || {}),
    };

    // 2. Resolve providerVariables from template if present
    // These are specific mappings like {"vendorVar": "VAR1", "systemVar": "name"}
    if (template.providerVariables && Array.isArray(template.providerVariables)) {
        template.providerVariables.forEach((mapping: any) => {
            if (mapping.vendorVar && mapping.systemVar) {
                variables[mapping.vendorVar] = variables[mapping.systemVar] || '';
            }
        });
    }

    // 3. Resolve the API Blueprint
    const resolvedUrl = this.templateRenderer.renderBody(dispatchApiTemplate.url, variables);
    const resolvedHeaders = this.templateRenderer.renderObject(dispatchApiTemplate.headers || {}, variables);
    const resolvedBody = this.templateRenderer.renderObject(dispatchApiTemplate.bodyTemplate || {}, variables);
    const method = (dispatchApiTemplate.method || 'POST').toUpperCase();

    // 4. Fire the HTTP request
    this.logger.log(`Dispatching ${channelConfig.channel} to ${record.mobile} via ${resolvedUrl}`);
    
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
      providerMsgId: response?.data?.id || response?.data?.msgid || `local_${Date.now()}`,
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
