"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogs = exports.reportJobs = exports.optOutList = exports.deliveryLogs = exports.commEvents = exports.scheduledJobs = exports.batchErrors = exports.batchRuns = exports.jobQueue = exports.workflowRules = exports.commTemplates = exports.channelConfigs = exports.repaymentSyncs = exports.portfolioRecords = exports.dpdBucketConfigs = exports.portfolios = exports.tenantFieldRegistry = exports.tenantUsers = exports.platformUsers = exports.tenants = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    settings: (0, pg_core_1.jsonb)('settings').default({}),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    codeIdx: (0, pg_core_1.uniqueIndex)('tenants_code_idx').on(t.code),
}));
exports.platformUsers = (0, pg_core_1.pgTable)('platform_users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    role: (0, pg_core_1.varchar)('role', { length: 30 }).notNull().default('platform_admin'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.tenantUsers = (0, pg_core_1.pgTable)('tenant_users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    role: (0, pg_core_1.varchar)('role', { length: 30 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    invitedBy: (0, pg_core_1.uuid)('invited_by').references(() => exports.tenantUsers.id),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantEmailIdx: (0, pg_core_1.uniqueIndex)('tenant_users_tenant_email_idx').on(t.tenantId, t.email),
    tenantIdIdx: (0, pg_core_1.index)('tenant_users_tenant_id_idx').on(t.tenantId),
}));
exports.tenantFieldRegistry = (0, pg_core_1.pgTable)('tenant_field_registry', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    fieldKey: (0, pg_core_1.varchar)('field_key', { length: 20 }).notNull(),
    fieldIndex: (0, pg_core_1.integer)('field_index').notNull(),
    headerName: (0, pg_core_1.varchar)('header_name', { length: 100 }).notNull(),
    displayLabel: (0, pg_core_1.varchar)('display_label', { length: 100 }).notNull(),
    dataType: (0, pg_core_1.varchar)('data_type', { length: 20 }).notNull().default('string'),
    isCore: (0, pg_core_1.boolean)('is_core').default(false),
    isPii: (0, pg_core_1.boolean)('is_pii').default(false),
    sampleValue: (0, pg_core_1.varchar)('sample_value', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantFieldKeyIdx: (0, pg_core_1.uniqueIndex)('tenant_field_registry_tenant_field_key_idx').on(t.tenantId, t.fieldKey),
    tenantHeaderIdx: (0, pg_core_1.uniqueIndex)('tenant_field_registry_tenant_header_idx').on(t.tenantId, t.headerName),
    tenantIdIdx: (0, pg_core_1.index)('tenant_field_registry_tenant_id_idx').on(t.tenantId),
}));
exports.portfolios = (0, pg_core_1.pgTable)('portfolios', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    allocationMonth: (0, pg_core_1.varchar)('allocation_month', { length: 10 }).notNull(),
    sourceType: (0, pg_core_1.varchar)('source_type', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    fileUrl: (0, pg_core_1.text)('file_url'),
    totalRecords: (0, pg_core_1.integer)('total_records').default(0),
    processedRecords: (0, pg_core_1.integer)('processed_records').default(0),
    failedRecords: (0, pg_core_1.integer)('failed_records').default(0),
    uploadedBy: (0, pg_core_1.uuid)('uploaded_by').references(() => exports.tenantUsers.id),
    errorLog: (0, pg_core_1.jsonb)('error_log').default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('portfolios_tenant_id_idx').on(t.tenantId),
    tenantAllocMonthIdx: (0, pg_core_1.index)('portfolios_tenant_alloc_month_idx').on(t.tenantId, t.allocationMonth),
    statusIdx: (0, pg_core_1.index)('portfolios_status_idx').on(t.status),
}));
exports.dpdBucketConfigs = (0, pg_core_1.pgTable)('dpd_bucket_configs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    bucketName: (0, pg_core_1.varchar)('bucket_name', { length: 50 }).notNull(),
    dpdMin: (0, pg_core_1.integer)('dpd_min').notNull(),
    dpdMax: (0, pg_core_1.integer)('dpd_max'),
    displayLabel: (0, pg_core_1.varchar)('display_label', { length: 100 }),
    priority: (0, pg_core_1.integer)('priority').default(0),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('dpd_bucket_configs_tenant_id_idx').on(t.tenantId),
    tenantBucketNameIdx: (0, pg_core_1.uniqueIndex)('dpd_bucket_configs_tenant_bucket_name_idx').on(t.tenantId, t.bucketName),
}));
exports.portfolioRecords = (0, pg_core_1.pgTable)('portfolio_records', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    portfolioId: (0, pg_core_1.uuid)('portfolio_id')
        .notNull()
        .references(() => exports.portfolios.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    userId: (0, pg_core_1.varchar)('user_id', { length: 50 }).notNull(),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 15 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    product: (0, pg_core_1.varchar)('product', { length: 100 }),
    employerId: (0, pg_core_1.varchar)('employer_id', { length: 50 }),
    currentDpd: (0, pg_core_1.integer)('current_dpd').default(0),
    dpdBucket: (0, pg_core_1.varchar)('dpd_bucket', { length: 50 }),
    overdue: (0, pg_core_1.numeric)('overdue', { precision: 14, scale: 2 }).default('0'),
    outstanding: (0, pg_core_1.numeric)('outstanding', { precision: 14, scale: 2 }).default('0'),
    dynamicFields: (0, pg_core_1.jsonb)('dynamic_fields').default({}),
    isOptedOut: (0, pg_core_1.boolean)('is_opted_out').default(false),
    lastSyncedAt: (0, pg_core_1.timestamp)('last_synced_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('portfolio_records_tenant_id_idx').on(t.tenantId),
    tenantUserIdIdx: (0, pg_core_1.index)('portfolio_records_tenant_user_idx').on(t.tenantId, t.userId),
    tenantDpdIdx: (0, pg_core_1.index)('portfolio_records_tenant_dpd_idx').on(t.tenantId, t.currentDpd),
    tenantBucketIdx: (0, pg_core_1.index)('portfolio_records_tenant_bucket_idx').on(t.tenantId, t.dpdBucket),
    mobileIdx: (0, pg_core_1.index)('portfolio_records_mobile_idx').on(t.mobile),
    portfolioIdIdx: (0, pg_core_1.index)('portfolio_records_portfolio_id_idx').on(t.portfolioId),
    dynamicFieldsGinIdx: (0, pg_core_1.index)('portfolio_records_dynamic_fields_gin_idx').using('gin', t.dynamicFields),
}));
exports.repaymentSyncs = (0, pg_core_1.pgTable)('repayment_syncs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    sourceType: (0, pg_core_1.varchar)('source_type', { length: 20 }).notNull(),
    fileUrl: (0, pg_core_1.text)('file_url'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    recordsUpdated: (0, pg_core_1.integer)('records_updated').default(0),
    uploadedBy: (0, pg_core_1.uuid)('uploaded_by').references(() => exports.tenantUsers.id),
    syncDate: (0, pg_core_1.date)('sync_date').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantDateIdx: (0, pg_core_1.index)('repayment_syncs_tenant_date_idx').on(t.tenantId, t.syncDate),
}));
exports.channelConfigs = (0, pg_core_1.pgTable)('channel_configs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(false),
    providerName: (0, pg_core_1.varchar)('provider_name', { length: 50 }),
    providerConfig: (0, pg_core_1.jsonb)('provider_config').default({}),
    dailyCap: (0, pg_core_1.integer)('daily_cap'),
    hourlyCap: (0, pg_core_1.integer)('hourly_cap'),
    updatedBy: (0, pg_core_1.uuid)('updated_by').references(() => exports.tenantUsers.id),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantChannelIdx: (0, pg_core_1.uniqueIndex)('channel_configs_tenant_channel_idx').on(t.tenantId, t.channel),
}));
exports.commTemplates = (0, pg_core_1.pgTable)('comm_templates', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    dpdBucket: (0, pg_core_1.varchar)('dpd_bucket', { length: 50 }),
    language: (0, pg_core_1.varchar)('language', { length: 10 }).notNull().default('en'),
    body: (0, pg_core_1.text)('body').notNull(),
    variables: (0, pg_core_1.jsonb)('variables').default([]),
    mediaUrl: (0, pg_core_1.text)('media_url'),
    version: (0, pg_core_1.integer)('version').notNull().default(1),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    approvedAt: (0, pg_core_1.timestamp)('approved_at', { withTimezone: true }),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('comm_templates_tenant_id_idx').on(t.tenantId),
    tenantChannelBucketIdx: (0, pg_core_1.index)('comm_templates_tenant_channel_bucket_idx').on(t.tenantId, t.channel, t.dpdBucket),
}));
exports.workflowRules = (0, pg_core_1.pgTable)('workflow_rules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    bucketId: (0, pg_core_1.uuid)('bucket_id')
        .notNull()
        .references(() => exports.dpdBucketConfigs.id),
    templateId: (0, pg_core_1.uuid)('template_id').references(() => exports.commTemplates.id),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    priority: (0, pg_core_1.integer)('priority').notNull().default(1),
    delayDays: (0, pg_core_1.integer)('delay_days').default(0),
    repeatIntervalDays: (0, pg_core_1.integer)('repeat_interval_days'),
    scheduleCron: (0, pg_core_1.varchar)('schedule_cron', { length: 50 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('workflow_rules_tenant_id_idx').on(t.tenantId),
    tenantBucketIdx: (0, pg_core_1.index)('workflow_rules_tenant_bucket_idx').on(t.tenantId, t.bucketId),
    tenantChannelIdx: (0, pg_core_1.index)('workflow_rules_tenant_channel_idx').on(t.tenantId, t.channel),
}));
exports.jobQueue = (0, pg_core_1.pgTable)('job_queue', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id),
    jobType: (0, pg_core_1.varchar)('job_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    payload: (0, pg_core_1.jsonb)('payload').notNull(),
    priority: (0, pg_core_1.integer)('priority').default(5),
    attempts: (0, pg_core_1.integer)('attempts').default(0),
    maxAttempts: (0, pg_core_1.integer)('max_attempts').default(3),
    claimedBy: (0, pg_core_1.varchar)('claimed_by', { length: 100 }),
    claimedAt: (0, pg_core_1.timestamp)('claimed_at', { withTimezone: true }),
    claimExpiresAt: (0, pg_core_1.timestamp)('claim_expires_at', { withTimezone: true }),
    runAfter: (0, pg_core_1.timestamp)('run_after', { withTimezone: true }).defaultNow(),
    result: (0, pg_core_1.jsonb)('result'),
    lastError: (0, pg_core_1.text)('last_error'),
    failedAt: (0, pg_core_1.timestamp)('failed_at', { withTimezone: true }),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
    nextRetryAt: (0, pg_core_1.timestamp)('next_retry_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    statusRunAfterPriorityIdx: (0, pg_core_1.index)('job_queue_status_runafter_priority_idx').on(t.status, t.runAfter, t.priority),
    tenantJobTypeStatusIdx: (0, pg_core_1.index)('job_queue_tenant_jobtype_status_idx').on(t.tenantId, t.jobType, t.status),
    claimExpiresAtIdx: (0, pg_core_1.index)('job_queue_claim_expires_at_idx').on(t.claimExpiresAt),
}));
exports.batchRuns = (0, pg_core_1.pgTable)('batch_runs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobQueue.id),
    batchType: (0, pg_core_1.varchar)('batch_type', { length: 30 }).notNull(),
    sourceRef: (0, pg_core_1.uuid)('source_ref'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'),
    totalRecords: (0, pg_core_1.integer)('total_records').default(0),
    processed: (0, pg_core_1.integer)('processed').default(0),
    succeeded: (0, pg_core_1.integer)('succeeded').default(0),
    failed: (0, pg_core_1.integer)('failed').default(0),
    skipped: (0, pg_core_1.integer)('skipped').default(0),
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantBatchTypeStatusIdx: (0, pg_core_1.index)('batch_runs_tenant_batchtype_status_idx').on(t.tenantId, t.batchType, t.status),
    jobIdIdx: (0, pg_core_1.index)('batch_runs_job_id_idx').on(t.jobId),
    sourceRefIdx: (0, pg_core_1.index)('batch_runs_source_ref_idx').on(t.sourceRef),
}));
exports.batchErrors = (0, pg_core_1.pgTable)('batch_errors', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    batchRunId: (0, pg_core_1.uuid)('batch_run_id')
        .notNull()
        .references(() => exports.batchRuns.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    rowIndex: (0, pg_core_1.integer)('row_index'),
    recordRef: (0, pg_core_1.varchar)('record_ref', { length: 50 }),
    errorCode: (0, pg_core_1.varchar)('error_code', { length: 50 }),
    errorMessage: (0, pg_core_1.text)('error_message'),
    rawData: (0, pg_core_1.jsonb)('raw_data'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    batchRunIdIdx: (0, pg_core_1.index)('batch_errors_batch_run_id_idx').on(t.batchRunId),
    tenantBatchRunIdIdx: (0, pg_core_1.index)('batch_errors_tenant_batch_run_id_idx').on(t.tenantId, t.batchRunId),
}));
exports.scheduledJobs = (0, pg_core_1.pgTable)('scheduled_jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id),
    jobType: (0, pg_core_1.varchar)('job_type', { length: 50 }).notNull(),
    cronExpression: (0, pg_core_1.varchar)('cron_expression', { length: 50 }).notNull(),
    payloadTemplate: (0, pg_core_1.jsonb)('payload_template').default({}),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    lastRunAt: (0, pg_core_1.timestamp)('last_run_at', { withTimezone: true }),
    lastRunStatus: (0, pg_core_1.varchar)('last_run_status', { length: 20 }),
    lastJobId: (0, pg_core_1.uuid)('last_job_id').references(() => exports.jobQueue.id),
    nextRunAt: (0, pg_core_1.timestamp)('next_run_at', { withTimezone: true }).notNull(),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    isActiveNextRunAtIdx: (0, pg_core_1.index)('scheduled_jobs_isactive_nextrunat_idx').on(t.isActive, t.nextRunAt),
    tenantIdIdx: (0, pg_core_1.index)('scheduled_jobs_tenant_id_idx').on(t.tenantId),
}));
exports.commEvents = (0, pg_core_1.pgTable)('comm_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id')
        .notNull()
        .references(() => exports.portfolioRecords.id),
    ruleId: (0, pg_core_1.uuid)('rule_id').references(() => exports.workflowRules.id),
    templateId: (0, pg_core_1.uuid)('template_id').references(() => exports.commTemplates.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobQueue.id),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('scheduled'),
    resolvedBody: (0, pg_core_1.text)('resolved_body'),
    resolvedFields: (0, pg_core_1.jsonb)('resolved_fields').default({}),
    scheduledAt: (0, pg_core_1.timestamp)('scheduled_at', { withTimezone: true }).notNull(),
    queuedAt: (0, pg_core_1.timestamp)('queued_at', { withTimezone: true }),
    sentAt: (0, pg_core_1.timestamp)('sent_at', { withTimezone: true }),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 150 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('comm_events_tenant_id_idx').on(t.tenantId),
    recordIdIdx: (0, pg_core_1.index)('comm_events_record_id_idx').on(t.recordId),
    tenantStatusIdx: (0, pg_core_1.index)('comm_events_tenant_status_idx').on(t.tenantId, t.status),
    tenantScheduledAtIdx: (0, pg_core_1.index)('comm_events_tenant_scheduled_at_idx').on(t.tenantId, t.scheduledAt),
    jobIdIdx: (0, pg_core_1.index)('comm_events_job_id_idx').on(t.jobId),
}));
exports.deliveryLogs = (0, pg_core_1.pgTable)('delivery_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    eventId: (0, pg_core_1.uuid)('event_id')
        .notNull()
        .references(() => exports.commEvents.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    providerName: (0, pg_core_1.varchar)('provider_name', { length: 50 }),
    providerMsgId: (0, pg_core_1.varchar)('provider_msg_id', { length: 255 }),
    deliveryStatus: (0, pg_core_1.varchar)('delivery_status', { length: 30 }),
    errorCode: (0, pg_core_1.varchar)('error_code', { length: 50 }),
    errorMessage: (0, pg_core_1.text)('error_message'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at', { withTimezone: true }),
    readAt: (0, pg_core_1.timestamp)('read_at', { withTimezone: true }),
    callbackPayload: (0, pg_core_1.jsonb)('callback_payload').default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    eventIdIdx: (0, pg_core_1.index)('delivery_logs_event_id_idx').on(t.eventId),
    tenantIdIdx: (0, pg_core_1.index)('delivery_logs_tenant_id_idx').on(t.tenantId),
    providerMsgIdIdx: (0, pg_core_1.index)('delivery_logs_provider_msg_id_idx').on(t.providerMsgId),
}));
exports.optOutList = (0, pg_core_1.pgTable)('opt_out_list', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 15 }).notNull(),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }),
    reason: (0, pg_core_1.varchar)('reason', { length: 100 }),
    source: (0, pg_core_1.varchar)('source', { length: 30 }),
    optedOutAt: (0, pg_core_1.timestamp)('opted_out_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantMobileIdx: (0, pg_core_1.index)('opt_out_list_tenant_mobile_idx').on(t.tenantId, t.mobile),
    mobileIdx: (0, pg_core_1.index)('opt_out_list_mobile_idx').on(t.mobile),
}));
exports.reportJobs = (0, pg_core_1.pgTable)('report_jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobQueue.id),
    requestedBy: (0, pg_core_1.uuid)('requested_by').references(() => exports.tenantUsers.id),
    reportType: (0, pg_core_1.varchar)('report_type', { length: 50 }).notNull(),
    filters: (0, pg_core_1.jsonb)('filters').default({}),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('queued'),
    fileUrl: (0, pg_core_1.text)('file_url'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    queuedAt: (0, pg_core_1.timestamp)('queued_at', { withTimezone: true }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('report_jobs_tenant_id_idx').on(t.tenantId),
    tenantStatusIdx: (0, pg_core_1.index)('report_jobs_tenant_status_idx').on(t.tenantId, t.status),
    jobIdIdx: (0, pg_core_1.index)('report_jobs_job_id_idx').on(t.jobId),
}));
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id),
    actorId: (0, pg_core_1.uuid)('actor_id'),
    actorType: (0, pg_core_1.varchar)('actor_type', { length: 20 }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    oldValue: (0, pg_core_1.jsonb)('old_value'),
    newValue: (0, pg_core_1.jsonb)('new_value'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('audit_logs_tenant_id_idx').on(t.tenantId),
    tenantActionIdx: (0, pg_core_1.index)('audit_logs_tenant_action_idx').on(t.tenantId, t.action),
    entityTypeEntityIdIdx: (0, pg_core_1.index)('audit_logs_entity_type_entity_id_idx').on(t.entityType, t.entityId),
    createdAtIdx: (0, pg_core_1.index)('audit_logs_created_at_idx').on(t.createdAt),
}));
//# sourceMappingURL=schema.js.map