CREATE TABLE "ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid,
	"segment_id" uuid,
	"insight_type" varchar(50),
	"content" jsonb NOT NULL,
	"confidence" numeric(4, 2),
	"generated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(30) DEFAULT 'ai_agent'
);
--> statement-breakpoint
CREATE TABLE "call_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"interaction_id" uuid,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid,
	"s3_audio_url" text,
	"duration_seconds" integer,
	"transcript_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"interaction_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid,
	"transcript_text" text,
	"confidence" numeric(4, 2),
	"raw_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interaction_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid NOT NULL,
	"comm_event_id" uuid,
	"journey_step_id" uuid,
	"interaction_type" varchar(50) NOT NULL,
	"channel" varchar(20),
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journey_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"step_order" integer NOT NULL,
	"action_type" varchar(30) NOT NULL,
	"channel" varchar(20),
	"template_id" uuid,
	"delay_hours" integer DEFAULT 0,
	"repeat_interval_days" integer,
	"schedule_cron" varchar(50),
	"conditions_jsonb" jsonb DEFAULT '{}'::jsonb,
	"provider_override" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"segment_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"success_metric" varchar(50) DEFAULT 'ptp_rate',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repayment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"portfolio_record_id" uuid NOT NULL,
	"repayment_sync_id" uuid,
	"payment_date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"payment_type" varchar(30),
	"reference" varchar(100),
	"source_raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "segmentation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"portfolio_id" uuid,
	"triggered_by" uuid,
	"status" varchar(20) DEFAULT 'pending',
	"total_records" integer,
	"processed" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 100,
	"criteria_jsonb" jsonb NOT NULL,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid,
	"task_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"payload" jsonb NOT NULL,
	"kafka_topic" varchar(100),
	"kafka_key" varchar(100),
	"priority" integer DEFAULT 5,
	"attempts" integer DEFAULT 0,
	"run_after" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"last_error" text,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "batch_errors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "batch_runs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_queue" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workflow_rules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "batch_errors" CASCADE;--> statement-breakpoint
DROP TABLE "batch_runs" CASCADE;--> statement-breakpoint
DROP TABLE "job_queue" CASCADE;--> statement-breakpoint
DROP TABLE "scheduled_jobs" CASCADE;--> statement-breakpoint
DROP TABLE "workflow_rules" CASCADE;--> statement-breakpoint
ALTER TABLE "comm_events" DROP CONSTRAINT "comm_events_rule_id_workflow_rules_id_fk";
--> statement-breakpoint
ALTER TABLE "comm_events" DROP CONSTRAINT "comm_events_template_id_comm_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "comm_events" DROP CONSTRAINT "comm_events_job_id_job_queue_id_fk";
--> statement-breakpoint
ALTER TABLE "report_jobs" DROP CONSTRAINT "report_jobs_job_id_job_queue_id_fk";
--> statement-breakpoint
DROP INDEX "comm_events_tenant_status_idx";--> statement-breakpoint
DROP INDEX "comm_events_tenant_scheduled_at_idx";--> statement-breakpoint
DROP INDEX "comm_events_job_id_idx";--> statement-breakpoint
DROP INDEX "comm_templates_tenant_id_idx";--> statement-breakpoint
DROP INDEX "comm_templates_tenant_channel_bucket_idx";--> statement-breakpoint
DROP INDEX "portfolio_records_tenant_user_idx";--> statement-breakpoint
DROP INDEX "portfolio_records_tenant_bucket_idx";--> statement-breakpoint
DROP INDEX "portfolio_records_mobile_idx";--> statement-breakpoint
DROP INDEX "portfolios_tenant_id_idx";--> statement-breakpoint
DROP INDEX "portfolios_tenant_alloc_month_idx";--> statement-breakpoint
DROP INDEX "portfolios_status_idx";--> statement-breakpoint
ALTER TABLE "comm_events" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "comm_events" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comm_events" ALTER COLUMN "scheduled_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comm_templates" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "comm_templates" ALTER COLUMN "language" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_records" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "portfolio_records" ALTER COLUMN "user_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "portfolios" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "portfolios" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ALTER COLUMN "data_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "id" SET DEFAULT gen_ulid();--> statement-breakpoint
ALTER TABLE "comm_events" ADD COLUMN "journey_step_id" uuid;--> statement-breakpoint
ALTER TABLE "comm_events" ADD COLUMN "segment_id" uuid;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "segment_id" uuid;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_segmented_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_repayment_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "total_repaid" numeric(14, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_interaction_id_interaction_events_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interaction_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_transcript_id_conversation_transcripts_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."conversation_transcripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_interaction_id_interaction_events_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interaction_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_events" ADD CONSTRAINT "interaction_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_events" ADD CONSTRAINT "interaction_events_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_events" ADD CONSTRAINT "interaction_events_comm_event_id_comm_events_id_fk" FOREIGN KEY ("comm_event_id") REFERENCES "public"."comm_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_events" ADD CONSTRAINT "interaction_events_journey_step_id_journey_steps_id_fk" FOREIGN KEY ("journey_step_id") REFERENCES "public"."journey_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_steps" ADD CONSTRAINT "journey_steps_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_steps" ADD CONSTRAINT "journey_steps_template_id_comm_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."comm_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_steps" ADD CONSTRAINT "journey_steps_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_portfolio_record_id_portfolio_records_id_fk" FOREIGN KEY ("portfolio_record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_repayment_sync_id_repayment_syncs_id_fk" FOREIGN KEY ("repayment_sync_id") REFERENCES "public"."repayment_syncs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_triggered_by_tenant_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_queue" ADD CONSTRAINT "task_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interaction_events_tenant_type_record_idx" ON "interaction_events" USING btree ("tenant_id","interaction_type","record_id","comm_event_id");--> statement-breakpoint
CREATE INDEX "journey_steps_journey_step_order_idx" ON "journey_steps" USING btree ("journey_id","step_order");--> statement-breakpoint
CREATE INDEX "journeys_tenant_segment_idx" ON "journeys" USING btree ("tenant_id","segment_id");--> statement-breakpoint
CREATE INDEX "repayment_records_tenant_date_record_idx" ON "repayment_records" USING btree ("tenant_id","payment_date","portfolio_record_id");--> statement-breakpoint
CREATE INDEX "segmentation_runs_tenant_portfolio_idx" ON "segmentation_runs" USING btree ("tenant_id","portfolio_id");--> statement-breakpoint
CREATE INDEX "segments_tenant_id_idx" ON "segments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "segments_tenant_active_priority_idx" ON "segments" USING btree ("tenant_id","is_active","priority");--> statement-breakpoint
CREATE INDEX "segments_tenant_default_idx" ON "segments" USING btree ("tenant_id","is_default");--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_journey_step_id_journey_steps_id_fk" FOREIGN KEY ("journey_step_id") REFERENCES "public"."journey_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_job_id_task_queue_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."task_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comm_events_tenant_status_scheduled_idx" ON "comm_events" USING btree ("tenant_id","status","scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "comm_events_idempotency_key_idx" ON "comm_events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "comm_events_journey_step_id_idx" ON "comm_events" USING btree ("journey_step_id");--> statement-breakpoint
CREATE INDEX "comm_templates_tenant_channel_idx" ON "comm_templates" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_records_tenant_user_id_idx" ON "portfolio_records" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_mobile_idx" ON "portfolio_records" USING btree ("tenant_id","mobile");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_segment_idx" ON "portfolio_records" USING btree ("tenant_id","segment_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_outstanding_idx" ON "portfolio_records" USING btree ("tenant_id","outstanding");--> statement-breakpoint
CREATE INDEX "portfolios_tenant_month_status_idx" ON "portfolios" USING btree ("tenant_id","allocation_month","status");--> statement-breakpoint
ALTER TABLE "comm_events" DROP COLUMN "rule_id";--> statement-breakpoint
ALTER TABLE "comm_events" DROP COLUMN "template_id";--> statement-breakpoint
ALTER TABLE "comm_events" DROP COLUMN "job_id";--> statement-breakpoint
ALTER TABLE "comm_events" DROP COLUMN "queued_at";--> statement-breakpoint
ALTER TABLE "comm_templates" DROP COLUMN "dpd_bucket";--> statement-breakpoint
ALTER TABLE "comm_templates" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "comm_templates" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "portfolio_records" DROP COLUMN "overdue";--> statement-breakpoint
ALTER TABLE "portfolio_records" DROP COLUMN "last_synced_at";