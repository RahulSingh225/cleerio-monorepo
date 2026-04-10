"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiInsights = exports.optOutList = exports.auditLogs = exports.reportJobs = exports.taskQueue = exports.repaymentRecords = exports.repaymentSyncs = exports.callRecordings = exports.conversationTranscripts = exports.interactionEvents = exports.deliveryLogs = exports.commEvents = exports.journeySteps = exports.commTemplates = exports.channelConfigs = exports.journeys = exports.segmentationRuns = exports.portfolioRecords = exports.segments = exports.dpdBucketConfigs = exports.portfolios = exports.tenantFieldRegistry = exports.tenantUsers = exports.platformUsers = exports.tenants = exports.genUlidFunction = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.genUlidFunction = (0, drizzle_orm_1.sql) `
-- =============================================
-- gen_ulid() – ULID generator returning UUID type
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION gen_ulid()
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    timestamp_ms bigint;
    ulid_bytes bytea;
BEGIN
    -- Get current timestamp in milliseconds
    timestamp_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;

    -- Combine 6 bytes of timestamp and 10 bytes of randomness
    ulid_bytes := substring(int8send(timestamp_ms) FROM 3 FOR 6) 
               || gen_random_bytes(10);

    -- Postgres natively encodes the 16 bytes into hex and cast to uuid
    RETURN encode(ulid_bytes, 'hex')::uuid;
END;
$$;
`;
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    settings: (0, pg_core_1.jsonb)('settings').default({}),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
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
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    fieldKey: (0, pg_core_1.varchar)('field_key', { length: 20 }).notNull(),
    fieldIndex: (0, pg_core_1.integer)('field_index').notNull(),
    headerName: (0, pg_core_1.varchar)('header_name', { length: 100 }).notNull(),
    displayLabel: (0, pg_core_1.varchar)('display_label', { length: 100 }).notNull(),
    dataType: (0, pg_core_1.varchar)('data_type', { length: 20 }).default('string'),
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
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    allocationMonth: (0, pg_core_1.varchar)('allocation_month', { length: 10 }).notNull(),
    sourceType: (0, pg_core_1.varchar)('source_type', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending'),
    fileUrl: (0, pg_core_1.text)('file_url'),
    totalRecords: (0, pg_core_1.integer)('total_records').default(0),
    processedRecords: (0, pg_core_1.integer)('processed_records').default(0),
    failedRecords: (0, pg_core_1.integer)('failed_records').default(0),
    uploadedBy: (0, pg_core_1.uuid)('uploaded_by').references(() => exports.tenantUsers.id),
    errorLog: (0, pg_core_1.jsonb)('error_log').default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
}, (t) => ({
    tenantMonthStatusIdx: (0, pg_core_1.index)('portfolios_tenant_month_status_idx').on(t.tenantId, t.allocationMonth, t.status),
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
exports.segments = (0, pg_core_1.pgTable)('segments', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    priority: (0, pg_core_1.integer)('priority').default(100),
    criteriaJsonb: (0, pg_core_1.jsonb)('criteria_jsonb').notNull(),
    successRate: (0, pg_core_1.numeric)('success_rate', { precision: 5, scale: 2 }).default('0'),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('segments_tenant_id_idx').on(t.tenantId),
    tenantActiveIdx: (0, pg_core_1.index)('segments_tenant_active_priority_idx').on(t.tenantId, t.isActive, t.priority),
    tenantDefaultIdx: (0, pg_core_1.index)('segments_tenant_default_idx').on(t.tenantId, t.isDefault),
}));
exports.portfolioRecords = (0, pg_core_1.pgTable)('portfolio_records', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    portfolioId: (0, pg_core_1.uuid)('portfolio_id')
        .notNull()
        .references(() => exports.portfolios.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    userId: (0, pg_core_1.varchar)('user_id', { length: 100 }).notNull(),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 15 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    product: (0, pg_core_1.varchar)('product', { length: 100 }),
    employerId: (0, pg_core_1.varchar)('employer_id', { length: 50 }),
    outstanding: (0, pg_core_1.numeric)('outstanding', { precision: 14, scale: 2 }).default('0'),
    currentDpd: (0, pg_core_1.integer)('current_dpd').default(0),
    dpdBucket: (0, pg_core_1.varchar)('dpd_bucket', { length: 50 }),
    dynamicFields: (0, pg_core_1.jsonb)('dynamic_fields').default({}),
    segmentId: (0, pg_core_1.uuid)('segment_id').references(() => exports.segments.id),
    lastSegmentedAt: (0, pg_core_1.timestamp)('last_segmented_at', { withTimezone: true }),
    isOptedOut: (0, pg_core_1.boolean)('is_opted_out').default(false),
    lastRepaymentAt: (0, pg_core_1.timestamp)('last_repayment_at', { withTimezone: true }),
    totalRepaid: (0, pg_core_1.numeric)('total_repaid', { precision: 14, scale: 2 }).default('0'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('portfolio_records_tenant_id_idx').on(t.tenantId),
    tenantUserIdIdx: (0, pg_core_1.uniqueIndex)('portfolio_records_tenant_user_id_idx').on(t.tenantId, t.userId),
    tenantMobileIdx: (0, pg_core_1.index)('portfolio_records_tenant_mobile_idx').on(t.tenantId, t.mobile),
    tenantSegmentIdx: (0, pg_core_1.index)('portfolio_records_tenant_segment_idx').on(t.tenantId, t.segmentId),
    tenantDpdIdx: (0, pg_core_1.index)('portfolio_records_tenant_dpd_idx').on(t.tenantId, t.currentDpd),
    tenantOutstandingIdx: (0, pg_core_1.index)('portfolio_records_tenant_outstanding_idx').on(t.tenantId, t.outstanding),
    portfolioIdIdx: (0, pg_core_1.index)('portfolio_records_portfolio_id_idx').on(t.portfolioId),
    dynamicFieldsGinIdx: (0, pg_core_1.index)('portfolio_records_dynamic_fields_gin_idx').using('gin', t.dynamicFields),
}));
exports.segmentationRuns = (0, pg_core_1.pgTable)('segmentation_runs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    portfolioId: (0, pg_core_1.uuid)('portfolio_id').references(() => exports.portfolios.id),
    triggeredBy: (0, pg_core_1.uuid)('triggered_by').references(() => exports.tenantUsers.id),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending'),
    totalRecords: (0, pg_core_1.integer)('total_records'),
    processed: (0, pg_core_1.integer)('processed').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
}, (t) => ({
    tenantPortfolioIdx: (0, pg_core_1.index)('segmentation_runs_tenant_portfolio_idx').on(t.tenantId, t.portfolioId),
}));
exports.journeys = (0, pg_core_1.pgTable)('journeys', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    segmentId: (0, pg_core_1.uuid)('segment_id')
        .notNull()
        .references(() => exports.segments.id),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    successMetric: (0, pg_core_1.varchar)('success_metric', { length: 50 }).default('ptp_rate'),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantSegmentIdx: (0, pg_core_1.index)('journeys_tenant_segment_idx').on(t.tenantId, t.segmentId),
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
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    language: (0, pg_core_1.varchar)('language', { length: 10 }).default('en'),
    body: (0, pg_core_1.text)('body').notNull(),
    variables: (0, pg_core_1.jsonb)('variables').default([]),
    mediaUrl: (0, pg_core_1.text)('media_url'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantChannelIdx: (0, pg_core_1.index)('comm_templates_tenant_channel_idx').on(t.tenantId, t.channel),
}));
exports.journeySteps = (0, pg_core_1.pgTable)('journey_steps', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    journeyId: (0, pg_core_1.uuid)('journey_id')
        .notNull()
        .references(() => exports.journeys.id),
    stepOrder: (0, pg_core_1.integer)('step_order').notNull(),
    actionType: (0, pg_core_1.varchar)('action_type', { length: 30 }).notNull(),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }),
    templateId: (0, pg_core_1.uuid)('template_id').references(() => exports.commTemplates.id),
    delayHours: (0, pg_core_1.integer)('delay_hours').default(0),
    repeatIntervalDays: (0, pg_core_1.integer)('repeat_interval_days'),
    scheduleCron: (0, pg_core_1.varchar)('schedule_cron', { length: 50 }),
    conditionsJsonb: (0, pg_core_1.jsonb)('conditions_jsonb').default({}),
    providerOverride: (0, pg_core_1.jsonb)('provider_override').default({}),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.tenantUsers.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    journeyStepOrderIdx: (0, pg_core_1.index)('journey_steps_journey_step_order_idx').on(t.journeyId, t.stepOrder),
}));
exports.commEvents = (0, pg_core_1.pgTable)('comm_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id')
        .notNull()
        .references(() => exports.portfolioRecords.id),
    journeyStepId: (0, pg_core_1.uuid)('journey_step_id').references(() => exports.journeySteps.id),
    segmentId: (0, pg_core_1.uuid)('segment_id').references(() => exports.segments.id),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('scheduled'),
    resolvedBody: (0, pg_core_1.text)('resolved_body'),
    resolvedFields: (0, pg_core_1.jsonb)('resolved_fields').default({}),
    scheduledAt: (0, pg_core_1.timestamp)('scheduled_at', { withTimezone: true }),
    sentAt: (0, pg_core_1.timestamp)('sent_at', { withTimezone: true }),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 150 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantIdIdx: (0, pg_core_1.index)('comm_events_tenant_id_idx').on(t.tenantId),
    recordIdIdx: (0, pg_core_1.index)('comm_events_record_id_idx').on(t.recordId),
    tenantStatusScheduledIdx: (0, pg_core_1.index)('comm_events_tenant_status_scheduled_idx').on(t.tenantId, t.status, t.scheduledAt),
    idempotencyKeyIdx: (0, pg_core_1.uniqueIndex)('comm_events_idempotency_key_idx').on(t.idempotencyKey),
    journeyStepIdIdx: (0, pg_core_1.index)('comm_events_journey_step_id_idx').on(t.journeyStepId),
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
exports.interactionEvents = (0, pg_core_1.pgTable)('interaction_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id')
        .notNull()
        .references(() => exports.portfolioRecords.id),
    commEventId: (0, pg_core_1.uuid)('comm_event_id').references(() => exports.commEvents.id),
    journeyStepId: (0, pg_core_1.uuid)('journey_step_id').references(() => exports.journeySteps.id),
    interactionType: (0, pg_core_1.varchar)('interaction_type', { length: 50 }).notNull(),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }),
    details: (0, pg_core_1.jsonb)('details').default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantTypeRecordIdx: (0, pg_core_1.index)('interaction_events_tenant_type_record_idx').on(t.tenantId, t.interactionType, t.recordId, t.commEventId),
}));
exports.conversationTranscripts = (0, pg_core_1.pgTable)('conversation_transcripts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    interactionId: (0, pg_core_1.uuid)('interaction_id')
        .notNull()
        .references(() => exports.interactionEvents.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id').references(() => exports.portfolioRecords.id),
    transcriptText: (0, pg_core_1.text)('transcript_text'),
    confidence: (0, pg_core_1.numeric)('confidence', { precision: 4, scale: 2 }),
    rawJson: (0, pg_core_1.jsonb)('raw_json'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.callRecordings = (0, pg_core_1.pgTable)('call_recordings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    interactionId: (0, pg_core_1.uuid)('interaction_id').references(() => exports.interactionEvents.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id').references(() => exports.portfolioRecords.id),
    s3AudioUrl: (0, pg_core_1.text)('s3_audio_url'),
    durationSeconds: (0, pg_core_1.integer)('duration_seconds'),
    transcriptId: (0, pg_core_1.uuid)('transcript_id').references(() => exports.conversationTranscripts.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
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
exports.repaymentRecords = (0, pg_core_1.pgTable)('repayment_records', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    portfolioRecordId: (0, pg_core_1.uuid)('portfolio_record_id')
        .notNull()
        .references(() => exports.portfolioRecords.id),
    repaymentSyncId: (0, pg_core_1.uuid)('repayment_sync_id').references(() => exports.repaymentSyncs.id),
    paymentDate: (0, pg_core_1.date)('payment_date').notNull(),
    amount: (0, pg_core_1.numeric)('amount', { precision: 14, scale: 2 }).notNull(),
    paymentType: (0, pg_core_1.varchar)('payment_type', { length: 30 }),
    reference: (0, pg_core_1.varchar)('reference', { length: 100 }),
    sourceRaw: (0, pg_core_1.jsonb)('source_raw'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    tenantDateRecordIdx: (0, pg_core_1.index)('repayment_records_tenant_date_record_idx').on(t.tenantId, t.paymentDate, t.portfolioRecordId),
}));
exports.taskQueue = (0, pg_core_1.pgTable)('task_queue', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => exports.tenants.id),
    jobType: (0, pg_core_1.varchar)('task_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending'),
    payload: (0, pg_core_1.jsonb)('payload').notNull(),
    kafkaTopic: (0, pg_core_1.varchar)('kafka_topic', { length: 100 }),
    kafkaKey: (0, pg_core_1.varchar)('kafka_key', { length: 100 }),
    priority: (0, pg_core_1.integer)('priority').default(5),
    attempts: (0, pg_core_1.integer)('attempts').default(0),
    runAfter: (0, pg_core_1.timestamp)('run_after', { withTimezone: true }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
    failedAt: (0, pg_core_1.timestamp)('failed_at', { withTimezone: true }),
    lastError: (0, pg_core_1.text)('last_error'),
    result: (0, pg_core_1.jsonb)('result'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.reportJobs = (0, pg_core_1.pgTable)('report_jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.taskQueue.id),
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
exports.aiInsights = (0, pg_core_1.pgTable)('ai_insights', {
    id: (0, pg_core_1.uuid)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_ulid()`),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => exports.tenants.id),
    recordId: (0, pg_core_1.uuid)('record_id').references(() => exports.portfolioRecords.id),
    segmentId: (0, pg_core_1.uuid)('segment_id').references(() => exports.segments.id),
    insightType: (0, pg_core_1.varchar)('insight_type', { length: 50 }),
    content: (0, pg_core_1.jsonb)('content').notNull(),
    confidence: (0, pg_core_1.numeric)('confidence', { precision: 4, scale: 2 }),
    generatedAt: (0, pg_core_1.timestamp)('generated_at', { withTimezone: true }).defaultNow(),
    createdBy: (0, pg_core_1.varchar)('created_by', { length: 30 }).default('ai_agent'),
});
//# sourceMappingURL=schema.js.map