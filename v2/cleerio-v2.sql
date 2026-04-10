CREATE TABLE "tenants" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "name" varchar(255) NOT NULL,
  "code" varchar(50) UNIQUE NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "settings" jsonb DEFAULT '{}',
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "platform_users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar(255) UNIQUE NOT NULL,
  "name" varchar(255),
  "password_hash" varchar(255),
  "role" varchar(30) NOT NULL DEFAULT 'platform_admin',
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "tenant_users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(255),
  "password_hash" varchar(255),
  "role" varchar(30) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "invited_by" uuid,
  "last_login_at" timestamptz,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "tenant_field_registry" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "field_key" varchar(20) NOT NULL,
  "field_index" integer NOT NULL,
  "header_name" varchar(100) NOT NULL,
  "display_label" varchar(100) NOT NULL,
  "data_type" varchar(20) DEFAULT 'string',
  "is_core" boolean DEFAULT false,
  "is_pii" boolean DEFAULT false,
  "sample_value" varchar(255),
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "portfolios" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "allocation_month" varchar(10) NOT NULL,
  "source_type" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'pending',
  "file_url" text,
  "total_records" integer DEFAULT 0,
  "processed_records" integer DEFAULT 0,
  "failed_records" integer DEFAULT 0,
  "uploaded_by" uuid,
  "error_log" jsonb DEFAULT '[]',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "portfolio_records" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "portfolio_id" uuid NOT NULL,
  "tenant_id" uuid NOT NULL,
  "user_id" varchar(100) NOT NULL,
  "mobile" varchar(15) NOT NULL,
  "name" varchar(255),
  "product" varchar(100),
  "employer_id" varchar(50),
  "outstanding" numeric(14,2) DEFAULT 0,
  "current_dpd" integer DEFAULT 0,
  "dpd_bucket" varchar(50),
  "dynamic_fields" jsonb DEFAULT '{}',
  "segment_id" uuid,
  "last_segmented_at" timestamptz,
  "is_opted_out" boolean DEFAULT false,
  "last_repayment_at" timestamptz,
  "total_repaid" numeric(14,2) DEFAULT 0,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "segments" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "code" varchar(50) NOT NULL,
  "description" text,
  "is_default" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "priority" integer DEFAULT 100,
  "criteria_jsonb" jsonb NOT NULL,
  "success_rate" numeric(5,2) DEFAULT 0,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "segmentation_runs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "portfolio_id" uuid,
  "triggered_by" uuid,
  "status" varchar(20) DEFAULT 'pending',
  "total_records" integer,
  "processed" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT (now()),
  "completed_at" timestamptz
);

CREATE TABLE "journeys" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "segment_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "success_metric" varchar(50) DEFAULT 'ptp_rate',
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "journey_steps" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "journey_id" uuid NOT NULL,
  "step_order" integer NOT NULL,
  "action_type" varchar(30) NOT NULL,
  "channel" varchar(20),
  "template_id" uuid,
  "delay_hours" integer DEFAULT 0,
  "repeat_interval_days" integer,
  "schedule_cron" varchar(50),
  "conditions_jsonb" jsonb DEFAULT '{}',
  "provider_override" jsonb DEFAULT '{}',
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "channel_configs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid NOT NULL,
  "channel" varchar(20) NOT NULL,
  "is_enabled" boolean DEFAULT false,
  "provider_name" varchar(50),
  "provider_config" jsonb DEFAULT '{}',
  "daily_cap" integer,
  "hourly_cap" integer,
  "updated_by" uuid,
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "comm_templates" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "channel" varchar(20) NOT NULL,
  "language" varchar(10) DEFAULT 'en',
  "body" text NOT NULL,
  "variables" jsonb DEFAULT '[]',
  "media_url" text,
  "is_active" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "comm_events" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "record_id" uuid NOT NULL,
  "journey_step_id" uuid,
  "segment_id" uuid,
  "channel" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'scheduled',
  "resolved_body" text,
  "resolved_fields" jsonb DEFAULT '{}',
  "scheduled_at" timestamptz,
  "sent_at" timestamptz,
  "idempotency_key" varchar(150) UNIQUE NOT NULL,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "delivery_logs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "event_id" uuid NOT NULL,
  "tenant_id" uuid NOT NULL,
  "provider_name" varchar(50),
  "provider_msg_id" varchar(255),
  "delivery_status" varchar(30),
  "error_code" varchar(50),
  "error_message" text,
  "delivered_at" timestamptz,
  "read_at" timestamptz,
  "callback_payload" jsonb DEFAULT '{}',
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "interaction_events" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "record_id" uuid NOT NULL,
  "comm_event_id" uuid,
  "journey_step_id" uuid,
  "interaction_type" varchar(50) NOT NULL,
  "channel" varchar(20),
  "details" jsonb DEFAULT '{}',
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "conversation_transcripts" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "interaction_id" uuid NOT NULL,
  "tenant_id" uuid NOT NULL,
  "record_id" uuid,
  "transcript_text" text,
  "confidence" numeric(4,2),
  "raw_json" jsonb,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "call_recordings" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "interaction_id" uuid,
  "tenant_id" uuid NOT NULL,
  "record_id" uuid,
  "s3_audio_url" text,
  "duration_seconds" integer,
  "transcript_id" uuid,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "repayment_syncs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid NOT NULL,
  "source_type" varchar(20) NOT NULL,
  "file_url" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "records_updated" integer DEFAULT 0,
  "uploaded_by" uuid,
  "sync_date" date NOT NULL,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "repayment_records" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "portfolio_record_id" uuid NOT NULL,
  "repayment_sync_id" uuid,
  "payment_date" date NOT NULL,
  "amount" numeric(14,2) NOT NULL,
  "payment_type" varchar(30),
  "reference" varchar(100),
  "source_raw" jsonb,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "dpd_bucket_configs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid NOT NULL,
  "bucket_name" varchar(50) NOT NULL,
  "dpd_min" integer NOT NULL,
  "dpd_max" integer,
  "display_label" varchar(100),
  "priority" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "task_queue" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid,
  "task_type" varchar(50) NOT NULL,
  "status" varchar(20) DEFAULT 'pending',
  "payload" jsonb NOT NULL,
  "kafka_topic" varchar(100),
  "kafka_key" varchar(100),
  "priority" integer DEFAULT 5,
  "attempts" integer DEFAULT 0,
  "run_after" timestamptz DEFAULT (now()),
  "completed_at" timestamptz,
  "result" jsonb,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "report_jobs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid NOT NULL,
  "job_id" uuid,
  "requested_by" uuid,
  "report_type" varchar(50) NOT NULL,
  "filters" jsonb DEFAULT '{}',
  "status" varchar(20) NOT NULL DEFAULT 'queued',
  "file_url" text,
  "error_message" text,
  "queued_at" timestamptz DEFAULT (now()),
  "completed_at" timestamptz
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid,
  "actor_id" uuid,
  "actor_type" varchar(20),
  "action" varchar(100) NOT NULL,
  "entity_type" varchar(50),
  "entity_id" uuid,
  "old_value" jsonb,
  "new_value" jsonb,
  "ip_address" inet,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "opt_out_list" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "tenant_id" uuid,
  "mobile" varchar(15) NOT NULL,
  "channel" varchar(20),
  "reason" varchar(100),
  "source" varchar(30),
  "opted_out_at" timestamptz DEFAULT (now())
);

CREATE TABLE "ai_insights" (
  "id" uuid PRIMARY KEY DEFAULT (gen_ulid()),
  "tenant_id" uuid NOT NULL,
  "record_id" uuid,
  "segment_id" uuid,
  "insight_type" varchar(50),
  "content" jsonb NOT NULL,
  "confidence" numeric(4,2),
  "generated_at" timestamptz DEFAULT (now()),
  "created_by" varchar(30) DEFAULT 'ai_agent'
);

CREATE UNIQUE INDEX ON "tenants" ("code");

CREATE UNIQUE INDEX ON "tenant_users" ("tenant_id", "email");

CREATE INDEX ON "tenant_users" ("tenant_id");

CREATE UNIQUE INDEX ON "tenant_field_registry" ("tenant_id", "field_key");

CREATE UNIQUE INDEX ON "tenant_field_registry" ("tenant_id", "header_name");

CREATE INDEX ON "tenant_field_registry" ("tenant_id");

CREATE INDEX ON "portfolios" ("tenant_id", "allocation_month", "status");

CREATE INDEX ON "portfolio_records" ("tenant_id");

CREATE UNIQUE INDEX ON "portfolio_records" ("tenant_id", "user_id");

CREATE INDEX ON "portfolio_records" ("tenant_id", "mobile");

CREATE INDEX ON "portfolio_records" ("tenant_id", "segment_id");

CREATE INDEX ON "portfolio_records" ("tenant_id", "current_dpd");

CREATE INDEX ON "portfolio_records" ("tenant_id", "outstanding");

CREATE INDEX ON "portfolio_records" ("portfolio_id");

CREATE INDEX ON "portfolio_records" USING GIN ("dynamic_fields");

CREATE INDEX ON "segments" ("tenant_id");

CREATE INDEX ON "segments" ("tenant_id", "is_active", "priority");

CREATE INDEX ON "segments" ("tenant_id", "is_default");

CREATE INDEX ON "segmentation_runs" ("tenant_id", "portfolio_id");

CREATE INDEX ON "journeys" ("tenant_id", "segment_id");

CREATE INDEX ON "journey_steps" ("journey_id", "step_order");

CREATE UNIQUE INDEX ON "channel_configs" ("tenant_id", "channel");

CREATE INDEX ON "comm_templates" ("tenant_id", "channel");

CREATE INDEX ON "comm_events" ("tenant_id");

CREATE INDEX ON "comm_events" ("record_id");

CREATE INDEX ON "comm_events" ("tenant_id", "status", "scheduled_at");

CREATE UNIQUE INDEX ON "comm_events" ("idempotency_key");

CREATE INDEX ON "comm_events" ("journey_step_id");

CREATE INDEX ON "delivery_logs" ("event_id");

CREATE INDEX ON "delivery_logs" ("tenant_id");

CREATE INDEX ON "delivery_logs" ("provider_msg_id");

CREATE INDEX ON "interaction_events" ("tenant_id", "interaction_type", "record_id", "comm_event_id");

CREATE INDEX ON "repayment_syncs" ("tenant_id", "sync_date");

CREATE INDEX ON "repayment_records" ("tenant_id", "payment_date", "portfolio_record_id");

CREATE INDEX ON "dpd_bucket_configs" ("tenant_id");

CREATE UNIQUE INDEX ON "dpd_bucket_configs" ("tenant_id", "bucket_name");

CREATE INDEX ON "report_jobs" ("tenant_id");

CREATE INDEX ON "report_jobs" ("tenant_id", "status");

CREATE INDEX ON "report_jobs" ("job_id");

CREATE INDEX ON "audit_logs" ("tenant_id");

CREATE INDEX ON "audit_logs" ("tenant_id", "action");

CREATE INDEX ON "audit_logs" ("entity_type", "entity_id");

CREATE INDEX ON "audit_logs" ("created_at");

CREATE INDEX ON "opt_out_list" ("tenant_id", "mobile");

CREATE INDEX ON "opt_out_list" ("mobile");

COMMENT ON COLUMN "platform_users"."role" IS 'platform_admin | platform_ops';

COMMENT ON COLUMN "tenant_users"."role" IS 'tenant_admin | analyst | ops | viewer';

COMMENT ON COLUMN "tenant_users"."status" IS 'active | inactive | invited';

COMMENT ON COLUMN "channel_configs"."channel" IS 'sms | whatsapp | ivr | voice_bot';

COMMENT ON COLUMN "channel_configs"."provider_name" IS 'e.g. twilio, gupshup, exotel';

COMMENT ON COLUMN "channel_configs"."provider_config" IS 'encrypted — API keys, sender IDs, WABA ID';

COMMENT ON COLUMN "channel_configs"."daily_cap" IS 'max sends per day across all records for this tenant+channel';

COMMENT ON COLUMN "delivery_logs"."provider_msg_id" IS 'message ID returned by SMS/WA/IVR provider';

COMMENT ON COLUMN "delivery_logs"."delivery_status" IS 'sent | delivered | read | failed | bounced';

COMMENT ON COLUMN "delivery_logs"."callback_payload" IS 'raw webhook body received from provider';

COMMENT ON COLUMN "repayment_syncs"."source_type" IS 'csv | xlsx | api';

COMMENT ON COLUMN "dpd_bucket_configs"."bucket_name" IS 'e.g. high_risk, bucket_30_60';

COMMENT ON COLUMN "dpd_bucket_configs"."dpd_max" IS 'null = open-ended i.e. > dpd_min';

COMMENT ON COLUMN "dpd_bucket_configs"."display_label" IS 'e.g. Bucket 31-60 days';

COMMENT ON COLUMN "dpd_bucket_configs"."priority" IS 'lower = evaluated first when ranges overlap';

COMMENT ON COLUMN "report_jobs"."job_id" IS 'the job_queue entry driving this report';

COMMENT ON COLUMN "report_jobs"."report_type" IS 'delivery_summary | dpd_movement | comm_log | repayment_report | batch_error_report';

COMMENT ON COLUMN "report_jobs"."filters" IS 'date range, dpd_bucket, channel, fieldN filters';

COMMENT ON COLUMN "report_jobs"."status" IS 'queued | processing | completed | failed';

COMMENT ON COLUMN "report_jobs"."file_url" IS 'S3 path once report is generated';

COMMENT ON COLUMN "audit_logs"."tenant_id" IS 'null for platform-level events';

COMMENT ON COLUMN "audit_logs"."actor_id" IS 'tenant_user or platform_user id';

COMMENT ON COLUMN "audit_logs"."actor_type" IS 'tenant_user | platform_user | system | worker';

COMMENT ON COLUMN "audit_logs"."action" IS 'portfolio.uploaded | template.updated | field.mapped | channel.enabled | job.failed | job.dead';

COMMENT ON COLUMN "audit_logs"."entity_type" IS 'portfolio | template | workflow_rule | field_registry | job_queue | tenant';

COMMENT ON COLUMN "opt_out_list"."tenant_id" IS 'null = global platform-level DNC';

COMMENT ON COLUMN "opt_out_list"."channel" IS 'null = opted out of all channels';

COMMENT ON COLUMN "opt_out_list"."source" IS 'customer_request | regulator | manual | ivr_keypress | voice_bot';

ALTER TABLE "tenants" ADD FOREIGN KEY ("created_by") REFERENCES "platform_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_users" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_users" ADD FOREIGN KEY ("invited_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_field_registry" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "portfolios" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "portfolios" ADD FOREIGN KEY ("uploaded_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "portfolio_records" ADD FOREIGN KEY ("portfolio_id") REFERENCES "portfolios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "portfolio_records" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "portfolio_records" ADD FOREIGN KEY ("segment_id") REFERENCES "segments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "segments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "segments" ADD FOREIGN KEY ("created_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "segmentation_runs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "segmentation_runs" ADD FOREIGN KEY ("portfolio_id") REFERENCES "portfolios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "segmentation_runs" ADD FOREIGN KEY ("triggered_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journeys" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journeys" ADD FOREIGN KEY ("segment_id") REFERENCES "segments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journeys" ADD FOREIGN KEY ("created_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journey_steps" ADD FOREIGN KEY ("journey_id") REFERENCES "journeys" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journey_steps" ADD FOREIGN KEY ("template_id") REFERENCES "comm_templates" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "journey_steps" ADD FOREIGN KEY ("created_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "channel_configs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "channel_configs" ADD FOREIGN KEY ("updated_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_templates" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_templates" ADD FOREIGN KEY ("created_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_events" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_events" ADD FOREIGN KEY ("record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_events" ADD FOREIGN KEY ("journey_step_id") REFERENCES "journey_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comm_events" ADD FOREIGN KEY ("segment_id") REFERENCES "segments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "delivery_logs" ADD FOREIGN KEY ("event_id") REFERENCES "comm_events" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "delivery_logs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interaction_events" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interaction_events" ADD FOREIGN KEY ("record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interaction_events" ADD FOREIGN KEY ("comm_event_id") REFERENCES "comm_events" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interaction_events" ADD FOREIGN KEY ("journey_step_id") REFERENCES "journey_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversation_transcripts" ADD FOREIGN KEY ("interaction_id") REFERENCES "interaction_events" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversation_transcripts" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversation_transcripts" ADD FOREIGN KEY ("record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "call_recordings" ADD FOREIGN KEY ("interaction_id") REFERENCES "interaction_events" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "call_recordings" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "call_recordings" ADD FOREIGN KEY ("record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "call_recordings" ADD FOREIGN KEY ("transcript_id") REFERENCES "conversation_transcripts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "repayment_syncs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "repayment_syncs" ADD FOREIGN KEY ("uploaded_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "repayment_records" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "repayment_records" ADD FOREIGN KEY ("portfolio_record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "repayment_records" ADD FOREIGN KEY ("repayment_sync_id") REFERENCES "repayment_syncs" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "dpd_bucket_configs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "dpd_bucket_configs" ADD FOREIGN KEY ("created_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "task_queue" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "report_jobs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "report_jobs" ADD FOREIGN KEY ("job_id") REFERENCES "task_queue" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "report_jobs" ADD FOREIGN KEY ("requested_by") REFERENCES "tenant_users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "opt_out_list" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ai_insights" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ai_insights" ADD FOREIGN KEY ("record_id") REFERENCES "portfolio_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ai_insights" ADD FOREIGN KEY ("segment_id") REFERENCES "segments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
