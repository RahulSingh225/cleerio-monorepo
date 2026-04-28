// Filter source options and field definitions for Data Explorer

export const CORE_FIELDS = [
  { key: 'name', label: 'Borrower Name', type: 'string' },
  { key: 'mobile', label: 'Mobile', type: 'string' },
  { key: 'userId', label: 'User ID', type: 'string' },
  { key: 'product', label: 'Product', type: 'string' },
  { key: 'outstanding', label: 'Outstanding', type: 'number' },
  { key: 'currentDpd', label: 'Current DPD', type: 'number' },
  { key: 'loanNumber', label: 'Loan Number', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'dueDate', label: 'Due Date', type: 'date' },
  { key: 'emiAmount', label: 'EMI Amount', type: 'number' },
  { key: 'language', label: 'Language', type: 'string' },
  { key: 'state', label: 'State', type: 'string' },
  { key: 'city', label: 'City', type: 'string' },
  { key: 'cibilScore', label: 'CIBIL Score', type: 'number' },
  { key: 'loanAmount', label: 'Loan Amount', type: 'number' },
  { key: 'totalRepaid', label: 'Total Repaid', type: 'number' },
  { key: 'segmentId', label: 'Segment ID', type: 'string' },
  { key: 'lastDeliveryStatus', label: 'Last Delivery Status', type: 'string' },
  { key: 'contactabilityScore', label: 'Contactability Score', type: 'number' },
  { key: 'totalCommAttempts', label: 'Total Comm Attempts', type: 'number' },
  { key: 'ptpStatus', label: 'PTP Status', type: 'string' },
  { key: 'riskBucket', label: 'Risk Bucket', type: 'string' },
  { key: 'preferredChannel', label: 'Preferred Channel', type: 'string' },
  { key: 'employerName', label: 'Employer Name', type: 'string' },
];

export const COMM_FIELDS = [
  { key: 'channel', label: 'Channel', type: 'string' },
  { key: 'status', label: 'Event Status', type: 'string' },
  { key: 'deliveryStatus', label: 'Delivery Status', type: 'string' },
  { key: 'errorCode', label: 'Error Code', type: 'string' },
];

export const REPAYMENT_FIELDS = [
  { key: 'amount', label: 'Payment Amount', type: 'number' },
  { key: 'paymentDate', label: 'Payment Date', type: 'date' },
  { key: 'paymentType', label: 'Payment Type', type: 'string' },
  { key: 'reference', label: 'Reference', type: 'string' },
];

export const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In (comma-separated)' },
  { value: 'is_null', label: 'Is Empty' },
  { value: 'is_not_null', label: 'Is Not Empty' },
];

export const QUICK_FILTERS = [
  {
    label: 'SMS Failed + Has Repayment',
    filters: [
      { field: 'channel', operator: 'eq' as const, value: 'sms', source: 'comm' as const },
      { field: 'deliveryStatus', operator: 'eq' as const, value: 'failed', source: 'comm' as const },
      { field: 'hasRepayment', operator: 'is_not_null' as const, value: true, source: 'repayment' as const },
    ],
    groupBy: 'dynamic.state',
  },
  {
    label: 'DPD > 30',
    filters: [
      { field: 'currentDpd', operator: 'gt' as const, value: 30, source: 'core' as const },
    ],
  },
  {
    label: 'WhatsApp Delivered',
    filters: [
      { field: 'channel', operator: 'eq' as const, value: 'whatsapp', source: 'comm' as const },
      { field: 'deliveryStatus', operator: 'eq' as const, value: 'delivered', source: 'comm' as const },
    ],
  },
  {
    label: 'Has PTP',
    filters: [
      { field: 'ptpStatus', operator: 'is_not_null' as const, value: '', source: 'core' as const },
    ],
  },
];

export const AGG_FUNCTIONS = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];
