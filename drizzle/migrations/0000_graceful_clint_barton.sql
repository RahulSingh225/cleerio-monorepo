CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"actor_id" uuid,
	"actor_type" varchar(20),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batch_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_run_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"row_index" integer,
	"record_ref" varchar(50),
	"error_code" varchar(50),
	"error_message" text,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batch_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"job_id" uuid,
	"batch_type" varchar(30) NOT NULL,
	"source_ref" uuid,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"total_records" integer DEFAULT 0,
	"processed" integer DEFAULT 0,
	"succeeded" integer DEFAULT 0,
	"failed" integer DEFAULT 0,
	"skipped" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channel_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"provider_name" varchar(50),
	"provider_config" jsonb DEFAULT '{}'::jsonb,
	"daily_cap" integer,
	"hourly_cap" integer,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comm_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid NOT NULL,
	"rule_id" uuid,
	"template_id" uuid,
	"job_id" uuid,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"resolved_body" text,
	"resolved_fields" jsonb DEFAULT '{}'::jsonb,
	"scheduled_at" timestamp with time zone NOT NULL,
	"queued_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"idempotency_key" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comm_events_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "comm_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"dpd_bucket" varchar(50),
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"body" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"media_url" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"approved_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider_name" varchar(50),
	"provider_msg_id" varchar(255),
	"delivery_status" varchar(30),
	"error_code" varchar(50),
	"error_message" text,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"callback_payload" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dpd_bucket_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bucket_name" varchar(50) NOT NULL,
	"dpd_min" integer NOT NULL,
	"dpd_max" integer,
	"display_label" varchar(100),
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"priority" integer DEFAULT 5,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"claimed_by" varchar(100),
	"claimed_at" timestamp with time zone,
	"claim_expires_at" timestamp with time zone,
	"run_after" timestamp with time zone DEFAULT now(),
	"result" jsonb,
	"last_error" text,
	"failed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opt_out_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"mobile" varchar(15) NOT NULL,
	"channel" varchar(20),
	"reason" varchar(100),
	"source" varchar(30),
	"opted_out_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"role" varchar(30) DEFAULT 'platform_admin' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "portfolio_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"name" varchar(255),
	"product" varchar(100),
	"employer_id" varchar(50),
	"current_dpd" integer DEFAULT 0,
	"dpd_bucket" varchar(50),
	"overdue" numeric(14, 2) DEFAULT '0',
	"outstanding" numeric(14, 2) DEFAULT '0',
	"dynamic_fields" jsonb DEFAULT '{}'::jsonb,
	"is_opted_out" boolean DEFAULT false,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"allocation_month" varchar(10) NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"file_url" text,
	"total_records" integer DEFAULT 0,
	"processed_records" integer DEFAULT 0,
	"failed_records" integer DEFAULT 0,
	"uploaded_by" uuid,
	"error_log" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repayment_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"file_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"records_updated" integer DEFAULT 0,
	"uploaded_by" uuid,
	"sync_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"job_id" uuid,
	"requested_by" uuid,
	"report_type" varchar(50) NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"file_url" text,
	"error_message" text,
	"queued_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "scheduled_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"job_type" varchar(50) NOT NULL,
	"cron_expression" varchar(50) NOT NULL,
	"payload_template" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp with time zone,
	"last_run_status" varchar(20),
	"last_job_id" uuid,
	"next_run_at" timestamp with time zone NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_field_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"field_key" varchar(20) NOT NULL,
	"field_index" integer NOT NULL,
	"header_name" varchar(100) NOT NULL,
	"display_label" varchar(100) NOT NULL,
	"data_type" varchar(20) DEFAULT 'string' NOT NULL,
	"is_core" boolean DEFAULT false,
	"is_pii" boolean DEFAULT false,
	"sample_value" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"role" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"invited_by" uuid,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenants_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "workflow_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bucket_id" uuid NOT NULL,
	"template_id" uuid,
	"channel" varchar(20) NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"delay_days" integer DEFAULT 0,
	"repeat_interval_days" integer,
	"schedule_cron" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_errors" ADD CONSTRAINT "batch_errors_batch_run_id_batch_runs_id_fk" FOREIGN KEY ("batch_run_id") REFERENCES "public"."batch_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_errors" ADD CONSTRAINT "batch_errors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_runs" ADD CONSTRAINT "batch_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_runs" ADD CONSTRAINT "batch_runs_job_id_job_queue_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD CONSTRAINT "channel_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD CONSTRAINT "channel_configs_updated_by_tenant_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_rule_id_workflow_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."workflow_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_template_id_comm_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."comm_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_job_id_job_queue_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_templates" ADD CONSTRAINT "comm_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_templates" ADD CONSTRAINT "comm_templates_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_event_id_comm_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."comm_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dpd_bucket_configs" ADD CONSTRAINT "dpd_bucket_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dpd_bucket_configs" ADD CONSTRAINT "dpd_bucket_configs_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opt_out_list" ADD CONSTRAINT "opt_out_list_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_uploaded_by_tenant_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_syncs" ADD CONSTRAINT "repayment_syncs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_syncs" ADD CONSTRAINT "repayment_syncs_uploaded_by_tenant_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_job_id_job_queue_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_requested_by_tenant_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_last_job_id_job_queue_id_fk" FOREIGN KEY ("last_job_id") REFERENCES "public"."job_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ADD CONSTRAINT "tenant_field_registry_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_invited_by_tenant_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_bucket_id_dpd_bucket_configs_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "public"."dpd_bucket_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_template_id_comm_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."comm_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_action_idx" ON "audit_logs" USING btree ("tenant_id","action");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "batch_errors_batch_run_id_idx" ON "batch_errors" USING btree ("batch_run_id");--> statement-breakpoint
CREATE INDEX "batch_errors_tenant_batch_run_id_idx" ON "batch_errors" USING btree ("tenant_id","batch_run_id");--> statement-breakpoint
CREATE INDEX "batch_runs_tenant_batchtype_status_idx" ON "batch_runs" USING btree ("tenant_id","batch_type","status");--> statement-breakpoint
CREATE INDEX "batch_runs_job_id_idx" ON "batch_runs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "batch_runs_source_ref_idx" ON "batch_runs" USING btree ("source_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_configs_tenant_channel_idx" ON "channel_configs" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE INDEX "comm_events_tenant_id_idx" ON "comm_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "comm_events_record_id_idx" ON "comm_events" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "comm_events_tenant_status_idx" ON "comm_events" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "comm_events_tenant_scheduled_at_idx" ON "comm_events" USING btree ("tenant_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "comm_events_job_id_idx" ON "comm_events" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "comm_templates_tenant_id_idx" ON "comm_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "comm_templates_tenant_channel_bucket_idx" ON "comm_templates" USING btree ("tenant_id","channel","dpd_bucket");--> statement-breakpoint
CREATE INDEX "delivery_logs_event_id_idx" ON "delivery_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "delivery_logs_tenant_id_idx" ON "delivery_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "delivery_logs_provider_msg_id_idx" ON "delivery_logs" USING btree ("provider_msg_id");--> statement-breakpoint
CREATE INDEX "dpd_bucket_configs_tenant_id_idx" ON "dpd_bucket_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dpd_bucket_configs_tenant_bucket_name_idx" ON "dpd_bucket_configs" USING btree ("tenant_id","bucket_name");--> statement-breakpoint
CREATE INDEX "job_queue_status_runafter_priority_idx" ON "job_queue" USING btree ("status","run_after","priority");--> statement-breakpoint
CREATE INDEX "job_queue_tenant_jobtype_status_idx" ON "job_queue" USING btree ("tenant_id","job_type","status");--> statement-breakpoint
CREATE INDEX "job_queue_claim_expires_at_idx" ON "job_queue" USING btree ("claim_expires_at");--> statement-breakpoint
CREATE INDEX "opt_out_list_tenant_mobile_idx" ON "opt_out_list" USING btree ("tenant_id","mobile");--> statement-breakpoint
CREATE INDEX "opt_out_list_mobile_idx" ON "opt_out_list" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_id_idx" ON "portfolio_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_user_idx" ON "portfolio_records" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_dpd_idx" ON "portfolio_records" USING btree ("tenant_id","current_dpd");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_bucket_idx" ON "portfolio_records" USING btree ("tenant_id","dpd_bucket");--> statement-breakpoint
CREATE INDEX "portfolio_records_mobile_idx" ON "portfolio_records" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "portfolio_records_portfolio_id_idx" ON "portfolio_records" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_dynamic_fields_gin_idx" ON "portfolio_records" USING gin ("dynamic_fields");--> statement-breakpoint
CREATE INDEX "portfolios_tenant_id_idx" ON "portfolios" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "portfolios_tenant_alloc_month_idx" ON "portfolios" USING btree ("tenant_id","allocation_month");--> statement-breakpoint
CREATE INDEX "portfolios_status_idx" ON "portfolios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repayment_syncs_tenant_date_idx" ON "repayment_syncs" USING btree ("tenant_id","sync_date");--> statement-breakpoint
CREATE INDEX "report_jobs_tenant_id_idx" ON "report_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "report_jobs_tenant_status_idx" ON "report_jobs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "report_jobs_job_id_idx" ON "report_jobs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "scheduled_jobs_isactive_nextrunat_idx" ON "scheduled_jobs" USING btree ("is_active","next_run_at");--> statement-breakpoint
CREATE INDEX "scheduled_jobs_tenant_id_idx" ON "scheduled_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_field_registry_tenant_field_key_idx" ON "tenant_field_registry" USING btree ("tenant_id","field_key");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_field_registry_tenant_header_idx" ON "tenant_field_registry" USING btree ("tenant_id","header_name");--> statement-breakpoint
CREATE INDEX "tenant_field_registry_tenant_id_idx" ON "tenant_field_registry" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_users_tenant_email_idx" ON "tenant_users" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "tenant_users_tenant_id_idx" ON "tenant_users" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_code_idx" ON "tenants" USING btree ("code");--> statement-breakpoint
CREATE INDEX "workflow_rules_tenant_id_idx" ON "workflow_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workflow_rules_tenant_bucket_idx" ON "workflow_rules" USING btree ("tenant_id","bucket_id");--> statement-breakpoint
CREATE INDEX "workflow_rules_tenant_channel_idx" ON "workflow_rules" USING btree ("tenant_id","channel");