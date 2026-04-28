import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  boolean,
  integer,
  numeric,
  text,
  index,
  uniqueIndex,
  timestamp,
  date,
  AnyPgColumn,
  inet,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';


export const genUlidFunction = sql`
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


// ─── TENANTS ─────────────────────────────────────────────────

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    settings: jsonb('settings').default({}),
    createdBy: uuid('created_by'), // → platform_users.id
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    codeIdx: uniqueIndex('tenants_code_idx').on(t.code),
  })
);

// ─── PLATFORM USERS ──────────────────────────────────────────

export const platformUsers = pgTable('platform_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 30 }).notNull().default('platform_admin'), // platform_admin | platform_ops
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── TENANT USERS ────────────────────────────────────────────

export const tenantUsers = pgTable(
  'tenant_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: varchar('role', { length: 30 }).notNull(), // tenant_admin | analyst | ops | viewer
    status: varchar('status', { length: 20 }).notNull().default('active'), // active | inactive | invited
    invitedBy: uuid('invited_by').references((): AnyPgColumn => tenantUsers.id),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantEmailIdx: uniqueIndex('tenant_users_tenant_email_idx').on(t.tenantId, t.email),
    tenantIdIdx: index('tenant_users_tenant_id_idx').on(t.tenantId),
  })
);

// ─── FIELD REGISTRY ──────────────────────────────────────────

export const tenantFieldRegistry = pgTable(
  'tenant_field_registry',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    fieldKey: varchar('field_key', { length: 20 }).notNull(),
    fieldIndex: integer('field_index').notNull(),
    headerName: varchar('header_name', { length: 100 }).notNull(),
    displayLabel: varchar('display_label', { length: 100 }).notNull(),
    dataType: varchar('data_type', { length: 20 }).default('string'),
    isCore: boolean('is_core').default(false),
    isPii: boolean('is_pii').default(false),
    isStrategic: boolean('is_strategic').default(false),
    semanticRole: varchar('semantic_role', { length: 50 }),  // loan_id | due_date | emi | language | contact_alt | payment_link | risk_score | etc.
    sampleValue: varchar('sample_value', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantFieldKeyIdx: uniqueIndex('tenant_field_registry_tenant_field_key_idx').on(t.tenantId, t.fieldKey),
    tenantHeaderIdx: uniqueIndex('tenant_field_registry_tenant_header_idx').on(t.tenantId, t.headerName),
    tenantIdIdx: index('tenant_field_registry_tenant_id_idx').on(t.tenantId),
  })
);

// ─── PORTFOLIO MAPPING PROFILES ─────────────────────────────

export const portfolioMappingProfiles = pgTable(
  'portfolio_mapping_profiles',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    mappings: jsonb('mappings').notNull().default({}), // { "CSV Header": "userId" | "mobile" | "field1", ... }
    headers: jsonb('headers').notNull().default([]),    // Original CSV header order
    fieldCount: integer('field_count').default(0),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('portfolio_mapping_profiles_tenant_id_idx').on(t.tenantId),
    tenantNameIdx: uniqueIndex('portfolio_mapping_profiles_tenant_name_idx').on(t.tenantId, t.name),
  })
);

// ─── PORTFOLIO MANAGEMENT ────────────────────────────────────

export const portfolios = pgTable(
  'portfolios',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    mappingProfileId: uuid('mapping_profile_id').references(() => portfolioMappingProfiles.id),
    allocationMonth: varchar('allocation_month', { length: 10 }).notNull(),
    sourceType: varchar('source_type', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending'),
    fileUrl: text('file_url'),
    totalRecords: integer('total_records').default(0),
    processedRecords: integer('processed_records').default(0),
    failedRecords: integer('failed_records').default(0),
    uploadedBy: uuid('uploaded_by').references(() => tenantUsers.id),
    errorLog: jsonb('error_log').default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    tenantMonthStatusIdx: index('portfolios_tenant_month_status_idx').on(t.tenantId, t.allocationMonth, t.status),
  })
);

// ─── DPD BUCKET CONFIGURATION ───────────────────────────────

export const dpdBucketConfigs = pgTable(
  'dpd_bucket_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    bucketName: varchar('bucket_name', { length: 50 }).notNull(),
    dpdMin: integer('dpd_min').notNull(),
    dpdMax: integer('dpd_max'),
    displayLabel: varchar('display_label', { length: 100 }),
    priority: integer('priority').default(0),
    isActive: boolean('is_active').default(true),
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('dpd_bucket_configs_tenant_id_idx').on(t.tenantId),
    tenantBucketNameIdx: uniqueIndex('dpd_bucket_configs_tenant_bucket_name_idx').on(t.tenantId, t.bucketName),
  })
);

// ─── SEGMENTS ────────────────────────────────────────────────

export const segments = pgTable(
  'segments',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    description: text('description'),
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    priority: integer('priority').default(100),
    criteriaJsonb: jsonb('criteria_jsonb').notNull(), // rule engine criteria
    successRate: numeric('success_rate', { precision: 5, scale: 2 }).default('0'),
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('segments_tenant_id_idx').on(t.tenantId),
    tenantActiveIdx: index('segments_tenant_active_priority_idx').on(t.tenantId, t.isActive, t.priority),
    tenantDefaultIdx: index('segments_tenant_default_idx').on(t.tenantId, t.isDefault),
  })
);

// ─── PORTFOLIO RECORDS ───────────────────────────────────────

export const portfolioRecords = pgTable(
  'portfolio_records',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    portfolioId: uuid('portfolio_id')
      .notNull()
      .references(() => portfolios.id),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),

    // ── Core identity & financial fields ──
    userId: varchar('user_id', { length: 100 }).notNull(),
    mobile: varchar('mobile', { length: 15 }).notNull(),
    name: varchar('name', { length: 255 }),
    product: varchar('product', { length: 100 }),
    employerName: varchar('employer_name', { length: 255 }),
    outstanding: numeric('outstanding', { precision: 14, scale: 2 }).default('0'),
    currentDpd: integer('current_dpd').default(0),

    // ── Promoted core fields (from stakeholder docs) ──
    loanNumber: varchar('loan_number', { length: 100 }),
    email: varchar('email', { length: 255 }),
    dueDate: date('due_date'),
    emiAmount: numeric('emi_amount', { precision: 14, scale: 2 }),
    language: varchar('language', { length: 20 }),
    state: varchar('state', { length: 100 }),
    city: varchar('city', { length: 100 }),
    cibilScore: integer('cibil_score'),
    salaryDate: integer('salary_date'),           // Day of month (1-31)
    enachEnabled: boolean('enach_enabled'),
    alternateNumbers: jsonb('alternate_numbers').default([]),  // [ref1, ref2, alt1, alt2]
    loanAmount: numeric('loan_amount', { precision: 14, scale: 2 }),

    // ── Dynamic fields (all other CSV columns) ──
    dynamicFields: jsonb('dynamic_fields').default({}),

    // ── Segmentation ──
    segmentId: uuid('segment_id').references(() => segments.id),
    lastSegmentedAt: timestamp('last_segmented_at', { withTimezone: true }),

    // ── Communication feedback summary ──
    lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
    lastContactedChannel: varchar('last_contacted_channel', { length: 20 }),
    lastDeliveryStatus: varchar('last_delivery_status', { length: 30 }),
    lastInteractionType: varchar('last_interaction_type', { length: 50 }),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
    ptpDate: date('ptp_date'),
    ptpAmount: numeric('ptp_amount', { precision: 14, scale: 2 }),
    ptpStatus: varchar('ptp_status', { length: 20 }),  // pending_review | confirmed | honored | broken
    contactabilityScore: integer('contactability_score').default(0),
    preferredChannel: varchar('preferred_channel', { length: 20 }),
    totalCommAttempts: integer('total_comm_attempts').default(0),
    totalCommDelivered: integer('total_comm_delivered').default(0),
    totalCommRead: integer('total_comm_read').default(0),
    totalCommReplied: integer('total_comm_replied').default(0),
    riskBucket: varchar('risk_bucket', { length: 20 }),
    feedbackSummary: jsonb('feedback_summary').default({}),

    // ── Record state ──
    isOptedOut: boolean('is_opted_out').default(false),
    lastRepaymentAt: timestamp('last_repayment_at', { withTimezone: true }),
    totalRepaid: numeric('total_repaid', { precision: 14, scale: 2 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    tenantIdIdx: index('portfolio_records_tenant_id_idx').on(t.tenantId),
    tenantUserIdIdx: index('portfolio_records_tenant_user_id_idx').on(t.tenantId, t.userId),
    tenantMobileIdx: index('portfolio_records_tenant_mobile_idx').on(t.tenantId, t.mobile),
    tenantSegmentIdx: index('portfolio_records_tenant_segment_idx').on(t.tenantId, t.segmentId),
    tenantDpdIdx: index('portfolio_records_tenant_dpd_idx').on(t.tenantId, t.currentDpd),
    tenantOutstandingIdx: index('portfolio_records_tenant_outstanding_idx').on(t.tenantId, t.outstanding),
    portfolioIdIdx: index('portfolio_records_portfolio_id_idx').on(t.portfolioId),
    dynamicFieldsGinIdx: index('portfolio_records_dynamic_fields_gin_idx').using('gin', t.dynamicFields),
    // New strategic indexes
    tenantStateIdx: index('portfolio_records_tenant_state_idx').on(t.tenantId, t.state),
    tenantCibilIdx: index('portfolio_records_tenant_cibil_idx').on(t.tenantId, t.cibilScore),
    tenantDueDateIdx: index('portfolio_records_tenant_due_date_idx').on(t.tenantId, t.dueDate),
    tenantLoanNumberIdx: index('portfolio_records_tenant_loan_number_idx').on(t.tenantId, t.loanNumber),
    tenantEmailIdx: index('portfolio_records_tenant_email_idx').on(t.tenantId, t.email),
    tenantContactabilityIdx: index('portfolio_records_tenant_contactability_idx').on(t.tenantId, t.contactabilityScore),
  })
);

// ─── SEGMENTATION RUNS ──────────────────────────────────────

export const segmentationRuns = pgTable(
  'segmentation_runs',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    portfolioId: uuid('portfolio_id').references(() => portfolios.id),
    triggeredBy: uuid('triggered_by').references(() => tenantUsers.id),
    status: varchar('status', { length: 20 }).default('pending'),
    totalRecords: integer('total_records'),
    processed: integer('processed').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    tenantPortfolioIdx: index('segmentation_runs_tenant_portfolio_idx').on(t.tenantId, t.portfolioId),
  })
);

// ─── JOURNEYS ────────────────────────────────────────────────

export const journeys = pgTable(
  'journeys',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    segmentId: uuid('segment_id')
      .notNull()
      .references(() => segments.id),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    successMetric: varchar('success_metric', { length: 50 }).default('ptp_rate'),
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantSegmentIdx: index('journeys_tenant_segment_idx').on(t.tenantId, t.segmentId),
  })
);

// ─── CHANNEL CONFIGURATION ──────────────────────────────────

export const channelConfigs = pgTable(
  'channel_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    channel: varchar('channel', { length: 20 }).notNull(),
    isEnabled: boolean('is_enabled').default(false),
    providerName: varchar('provider_name', { length: 50 }),
    providerConfig: jsonb('provider_config').default({}),
    dispatchApiTemplate: jsonb('dispatch_api_template').default({}),
    dailyCap: integer('daily_cap'),
    hourlyCap: integer('hourly_cap'),
    // Webhook callback configuration
    callbackUrl: text('callback_url'),
    callbackSecret: varchar('callback_secret', { length: 255 }),
    callbackPayloadMap: jsonb('callback_payload_map').default({}),
    updatedBy: uuid('updated_by').references(() => tenantUsers.id),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantChannelIdx: uniqueIndex('channel_configs_tenant_channel_idx').on(t.tenantId, t.channel),
  })
);

// ─── PORTFOLIO CONFIGS (Allocation Checklist) ───────────────

export const portfolioConfigs = pgTable(
  'portfolio_configs',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    portfolioId: uuid('portfolio_id').references(() => portfolios.id),
    lenderName: varchar('lender_name', { length: 255 }),
    totalBookSize: numeric('total_book_size', { precision: 14, scale: 2 }),
    securedUnsecuredSplit: varchar('secured_unsecured_split', { length: 20 }),
    primaryProducts: jsonb('primary_products').default([]),
    monthlyInflow: numeric('monthly_inflow', { precision: 14, scale: 2 }),
    currentDpdStock: numeric('current_dpd_stock', { precision: 14, scale: 2 }),
    currentEfficiency: numeric('current_efficiency', { precision: 5, scale: 2 }),
    targetEfficiency: numeric('target_efficiency', { precision: 5, scale: 2 }),
    targetRor: numeric('target_ror', { precision: 5, scale: 2 }),
    currentContactability: numeric('current_contactability', { precision: 5, scale: 2 }),
    approvedChannels: jsonb('approved_channels').default([]),
    allocationStartDate: date('allocation_start_date'),
    allocationEndDate: date('allocation_end_date'),
    paidFileFrequency: varchar('paid_file_frequency', { length: 20 }),
    waiverGrid: jsonb('waiver_grid').default({}),
    currentAcr: numeric('current_acr', { precision: 8, scale: 2 }),
    commercialsModel: varchar('commercials_model', { length: 50 }),
    reportingFrequency: varchar('reporting_frequency', { length: 20 }),
    expectedRegionSplit: jsonb('expected_region_split').default({}),
    stakeholderGoals: jsonb('stakeholder_goals').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('portfolio_configs_tenant_id_idx').on(t.tenantId),
  })
);

// ─── COMMUNICATION TEMPLATES ─────────────────────────────────

export const commTemplates = pgTable(
  'comm_templates',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 100 }).notNull(),
    channel: varchar('channel', { length: 20 }).notNull(),
    language: varchar('language', { length: 10 }).default('en'),
    body: text('body').notNull(),
    variables: jsonb('variables').default([]),
    providerTemplateId: varchar('provider_template_id', { length: 150 }),
    providerVariables: jsonb('provider_variables').default([]),
    mediaUrl: text('media_url'),
    isActive: boolean('is_active').default(true),
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantChannelIdx: index('comm_templates_tenant_channel_idx').on(t.tenantId, t.channel),
  })
);

// ─── JOURNEY STEPS ──────────────────────────────────────────

export const journeySteps = pgTable(
  'journey_steps',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    journeyId: uuid('journey_id')
      .notNull()
      .references(() => journeys.id),
    stepOrder: integer('step_order').notNull(),
    actionType: varchar('action_type', { length: 30 }).notNull(), // send_sms | send_whatsapp | send_ivr | send_voice_bot | wait | condition_check | manual_review
    channel: varchar('channel', { length: 20 }),
    templateId: uuid('template_id').references(() => commTemplates.id),
    delayHours: integer('delay_hours').default(0),
    repeatIntervalDays: integer('repeat_interval_days'),
    scheduleCron: varchar('schedule_cron', { length: 50 }),
    conditionsJsonb: jsonb('conditions_jsonb').default({}),
    providerOverride: jsonb('provider_override').default({}),
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    journeyStepOrderIdx: index('journey_steps_journey_step_order_idx').on(t.journeyId, t.stepOrder),
  })
);

// ─── COMMUNICATION EVENTS ────────────────────────────────────

export const commEvents = pgTable(
  'comm_events',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    recordId: uuid('record_id')
      .notNull()
      .references(() => portfolioRecords.id),
    journeyStepId: uuid('journey_step_id').references(() => journeySteps.id),
    segmentId: uuid('segment_id').references(() => segments.id),
    channel: varchar('channel', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).default('scheduled'),
    resolvedBody: text('resolved_body'),
    resolvedFields: jsonb('resolved_fields').default({}),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    idempotencyKey: varchar('idempotency_key', { length: 150 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('comm_events_tenant_id_idx').on(t.tenantId),
    recordIdIdx: index('comm_events_record_id_idx').on(t.recordId),
    tenantStatusScheduledIdx: index('comm_events_tenant_status_scheduled_idx').on(t.tenantId, t.status, t.scheduledAt),
    idempotencyKeyIdx: uniqueIndex('comm_events_idempotency_key_idx').on(t.idempotencyKey),
    journeyStepIdIdx: index('comm_events_journey_step_id_idx').on(t.journeyStepId),
  })
);

// ─── DELIVERY LOGS ──────────────────────────────────────────

export const deliveryLogs = pgTable(
  'delivery_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => commEvents.id),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    providerName: varchar('provider_name', { length: 50 }),
    providerMsgId: varchar('provider_msg_id', { length: 255 }),
    deliveryStatus: varchar('delivery_status', { length: 30 }),
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),
    failureReason: varchar('failure_reason', { length: 100 }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),
    repliedAt: timestamp('replied_at', { withTimezone: true }),
    replyContent: text('reply_content'),
    linkClicked: boolean('link_clicked').default(false),
    linkClickedAt: timestamp('link_clicked_at', { withTimezone: true }),
    callbackPayload: jsonb('callback_payload').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    eventIdIdx: index('delivery_logs_event_id_idx').on(t.eventId),
    tenantIdIdx: index('delivery_logs_tenant_id_idx').on(t.tenantId),
    providerMsgIdIdx: index('delivery_logs_provider_msg_id_idx').on(t.providerMsgId),
  })
);

// ─── INTERACTION EVENTS ─────────────────────────────────────

export const interactionEvents = pgTable(
  'interaction_events',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    recordId: uuid('record_id')
      .notNull()
      .references(() => portfolioRecords.id),
    commEventId: uuid('comm_event_id').references(() => commEvents.id),
    journeyStepId: uuid('journey_step_id').references(() => journeySteps.id),
    interactionType: varchar('interaction_type', { length: 50 }).notNull(), // ptp | dispute | callback_request | link_click | reply | opt_out
    channel: varchar('channel', { length: 20 }),
    details: jsonb('details').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantTypeRecordIdx: index('interaction_events_tenant_type_record_idx').on(
      t.tenantId, t.interactionType, t.recordId, t.commEventId
    ),
  })
);

// ─── CONVERSATION TRANSCRIPTS ───────────────────────────────

export const conversationTranscripts = pgTable(
  'conversation_transcripts',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    interactionId: uuid('interaction_id')
      .notNull()
      .references(() => interactionEvents.id),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    recordId: uuid('record_id').references(() => portfolioRecords.id),
    transcriptText: text('transcript_text'),
    confidence: numeric('confidence', { precision: 4, scale: 2 }),
    rawJson: jsonb('raw_json'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);

// ─── CALL RECORDINGS ────────────────────────────────────────

export const callRecordings = pgTable(
  'call_recordings',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    interactionId: uuid('interaction_id').references(() => interactionEvents.id),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    recordId: uuid('record_id').references(() => portfolioRecords.id),
    s3AudioUrl: text('s3_audio_url'),
    durationSeconds: integer('duration_seconds'),
    transcriptId: uuid('transcript_id').references(() => conversationTranscripts.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);

// ─── REPAYMENT SYNCS ────────────────────────────────────────

export const repaymentSyncs = pgTable(
  'repayment_syncs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    sourceType: varchar('source_type', { length: 20 }).notNull(),
    fileUrl: text('file_url'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    recordsUpdated: integer('records_updated').default(0),
    uploadedBy: uuid('uploaded_by').references(() => tenantUsers.id),
    syncDate: date('sync_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantDateIdx: index('repayment_syncs_tenant_date_idx').on(t.tenantId, t.syncDate),
  })
);

// ─── REPAYMENT RECORDS ──────────────────────────────────────

export const repaymentRecords = pgTable(
  'repayment_records',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    portfolioRecordId: uuid('portfolio_record_id')
      .notNull()
      .references(() => portfolioRecords.id),
    repaymentSyncId: uuid('repayment_sync_id').references(() => repaymentSyncs.id),
    paymentDate: date('payment_date').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    paymentType: varchar('payment_type', { length: 30 }),
    reference: varchar('reference', { length: 100 }),
    sourceRaw: jsonb('source_raw'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantDateRecordIdx: index('repayment_records_tenant_date_record_idx').on(
      t.tenantId, t.paymentDate, t.portfolioRecordId
    ),
  })
);

// ─── TASK QUEUE ─────────────────────────────────────────────

export const taskQueue = pgTable(
  'task_queue',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    jobType: varchar('task_type', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending'),
    payload: jsonb('payload').notNull(),
    kafkaTopic: varchar('kafka_topic', { length: 100 }),
    kafkaKey: varchar('kafka_key', { length: 100 }),
    priority: integer('priority').default(5),
    attempts: integer('attempts').default(0),
    runAfter: timestamp('run_after', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    lastError: text('last_error'),
    result: jsonb('result'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  }
);

// ─── REPORT JOBS ────────────────────────────────────────────

export const reportJobs = pgTable(
  'report_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    jobId: uuid('job_id').references(() => taskQueue.id),
    requestedBy: uuid('requested_by').references(() => tenantUsers.id),
    reportType: varchar('report_type', { length: 50 }).notNull(),
    filters: jsonb('filters').default({}),
    status: varchar('status', { length: 20 }).notNull().default('queued'),
    fileUrl: text('file_url'),
    errorMessage: text('error_message'),
    queuedAt: timestamp('queued_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    tenantIdIdx: index('report_jobs_tenant_id_idx').on(t.tenantId),
    tenantStatusIdx: index('report_jobs_tenant_status_idx').on(t.tenantId, t.status),
    jobIdIdx: index('report_jobs_job_id_idx').on(t.jobId),
  })
);

// ─── AUDIT LOG ──────────────────────────────────────────────

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    actorId: uuid('actor_id'),
    actorType: varchar('actor_type', { length: 20 }),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('audit_logs_tenant_id_idx').on(t.tenantId),
    tenantActionIdx: index('audit_logs_tenant_action_idx').on(t.tenantId, t.action),
    entityTypeEntityIdIdx: index('audit_logs_entity_type_entity_id_idx').on(t.entityType, t.entityId),
    createdAtIdx: index('audit_logs_created_at_idx').on(t.createdAt),
  })
);

// ─── OPT-OUT / DNC ─────────────────────────────────────────

export const optOutList = pgTable(
  'opt_out_list',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    mobile: varchar('mobile', { length: 15 }).notNull(),
    channel: varchar('channel', { length: 20 }),
    reason: varchar('reason', { length: 100 }),
    source: varchar('source', { length: 30 }),
    optedOutAt: timestamp('opted_out_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantMobileIdx: index('opt_out_list_tenant_mobile_idx').on(t.tenantId, t.mobile),
    mobileIdx: index('opt_out_list_mobile_idx').on(t.mobile),
  })
);

// ─── AI INSIGHTS ────────────────────────────────────────────

export const aiInsights = pgTable(
  'ai_insights',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    recordId: uuid('record_id').references(() => portfolioRecords.id),
    segmentId: uuid('segment_id').references(() => segments.id),
    insightType: varchar('insight_type', { length: 50 }),
    content: jsonb('content').notNull(),
    confidence: numeric('confidence', { precision: 4, scale: 2 }),
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow(),
    createdBy: varchar('created_by', { length: 30 }).default('ai_agent'),
  }
);

// ─── SAVED QUERIES (Data Explorer) ──────────────────────────

export const savedQueries = pgTable(
  'saved_queries',
  {
    id: uuid('id').primaryKey().default(sql`gen_ulid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 150 }).notNull(),
    description: text('description'),
    querySpec: jsonb('query_spec').notNull(),   // The full DataExplorerQuery JSON
    createdBy: uuid('created_by').references(() => tenantUsers.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    tenantIdIdx: index('saved_queries_tenant_id_idx').on(t.tenantId),
    tenantNameIdx: uniqueIndex('saved_queries_tenant_name_idx').on(t.tenantId, t.name),
  })
);
