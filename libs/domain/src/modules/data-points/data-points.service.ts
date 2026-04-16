import { Injectable } from '@nestjs/common';
import { db, tenantFieldRegistry } from '@platform/drizzle';
import { eq } from 'drizzle-orm';

export interface DataPointField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum';
  values?: string[];
  isCore?: boolean;
  isDynamic?: boolean;
  min?: number;
  max?: number;
}

export interface DataPointGroup {
  group: string;
  icon: string;
  fields: DataPointField[];
}

@Injectable()
export class DataPointsService {

  /**
   * Returns all available data points grouped by category.
   * Used by the Journey Builder's Condition Node config panel.
   */
  async getAvailableDataPoints(tenantId: string): Promise<DataPointGroup[]> {
    // Fetch tenant-specific dynamic fields from registry
    const registryFields = await db
      .select()
      .from(tenantFieldRegistry)
      .where(eq(tenantFieldRegistry.tenantId, tenantId));

    const dynamicDataPoints: DataPointField[] = registryFields
      .filter(f => !f.isCore)
      .map(f => ({
        key: f.fieldKey,
        label: f.displayLabel,
        type: (f.dataType as any) || 'string',
        isDynamic: true,
      }));

    return [
      {
        group: 'Portfolio Fields',
        icon: 'clipboard',
        fields: [
          { key: 'name', label: 'Borrower Name', type: 'string', isCore: true },
          { key: 'mobile', label: 'Mobile Number', type: 'string', isCore: true },
          { key: 'userId', label: 'User ID', type: 'string', isCore: true },
          { key: 'loanNumber', label: 'Loan Number', type: 'string', isCore: true },
          { key: 'email', label: 'Email', type: 'string', isCore: true },
          { key: 'outstanding', label: 'Outstanding Amount', type: 'number', isCore: true },
          { key: 'emiAmount', label: 'EMI Amount', type: 'number', isCore: true },
          { key: 'loanAmount', label: 'Loan Amount', type: 'number', isCore: true },
          { key: 'currentDpd', label: 'Current DPD', type: 'number', isCore: true },
          { key: 'dueDate', label: 'Due Date', type: 'date', isCore: true },
          { key: 'product', label: 'Product / Loan Type', type: 'string', isCore: true },
          { key: 'cibilScore', label: 'CIBIL Score', type: 'number', isCore: true, min: 300, max: 900 },
          { key: 'language', label: 'Preferred Language', type: 'string', isCore: true },
          { key: 'state', label: 'State', type: 'string', isCore: true },
          { key: 'city', label: 'City', type: 'string', isCore: true },
          { key: 'salaryDate', label: 'Salary Day of Month', type: 'number', isCore: true, min: 1, max: 31 },
          { key: 'enachEnabled', label: 'E-NACH / Auto Debit', type: 'boolean', isCore: true },
          { key: 'employerName', label: 'Employer Name', type: 'string', isCore: true },
          { key: 'totalRepaid', label: 'Total Repaid', type: 'number', isCore: true },
        ],
      },
      {
        group: 'Delivery Data Points',
        icon: 'mail-check',
        fields: [
          { key: 'lastDeliveryStatus', label: 'Last Delivery Status', type: 'enum', values: ['sent', 'delivered', 'read', 'failed', 'replied'] },
          { key: 'lastContactedChannel', label: 'Last Channel Used', type: 'enum', values: ['sms', 'whatsapp', 'ivr', 'voice_bot'] },
          { key: 'lastContactedAt', label: 'Last Contacted At', type: 'datetime' },
          { key: 'totalCommAttempts', label: 'Total Communication Attempts', type: 'number' },
          { key: 'totalCommDelivered', label: 'Total Delivered', type: 'number' },
          { key: 'totalCommRead', label: 'Total Read / Opened', type: 'number' },
          { key: 'totalCommReplied', label: 'Total Replied', type: 'number' },
        ],
      },
      {
        group: 'Interaction Data Points',
        icon: 'message-circle',
        fields: [
          { key: 'lastInteractionType', label: 'Last Interaction Type', type: 'enum', values: ['ptp', 'dispute', 'link_click', 'reply', 'callback_request', 'opt_out', 'no_response', 'invalid_contact'] },
          { key: 'lastInteractionAt', label: 'Last Interaction At', type: 'datetime' },
          { key: 'ptpDate', label: 'PTP Date', type: 'date' },
          { key: 'ptpAmount', label: 'PTP Amount', type: 'number' },
          { key: 'ptpStatus', label: 'PTP Status', type: 'enum', values: ['pending_review', 'confirmed', 'honored', 'broken'] },
          { key: 'riskBucket', label: 'Risk Bucket', type: 'enum', values: ['low_risk', 'medium_risk', 'high_risk'] },
        ],
      },
      {
        group: 'Score & Preference',
        icon: 'bar-chart',
        fields: [
          { key: 'contactabilityScore', label: 'Contactability Score', type: 'number', min: 0, max: 100 },
          { key: 'preferredChannel', label: 'Preferred Channel', type: 'enum', values: ['sms', 'whatsapp', 'ivr'] },
        ],
      },
      {
        group: 'Repayment Data Points',
        icon: 'banknote',
        fields: [
          { key: 'totalRepaid', label: 'Total Repaid', type: 'number' },
          { key: 'lastRepaymentAt', label: 'Last Repayment At', type: 'datetime' },
        ],
      },
      {
        group: 'Domain Operators',
        icon: 'zap',
        fields: [
          { key: '_has_ptp', label: 'Has Active PTP', type: 'boolean' },
          { key: '_channel_viable', label: 'Channel Is Viable', type: 'enum', values: ['sms', 'whatsapp', 'ivr'] },
          { key: '_due_date_within', label: 'Due Date Within N Days', type: 'number' },
          { key: '_salary_date_is', label: 'Today Is Salary Day', type: 'boolean' },
          { key: '_no_response_since', label: 'No Response Since (hours)', type: 'number' },
        ],
      },
      ...(dynamicDataPoints.length > 0
        ? [{
            group: 'Custom Portfolio Fields',
            icon: 'database',
            fields: dynamicDataPoints,
          }]
        : []),
    ];
  }
}
