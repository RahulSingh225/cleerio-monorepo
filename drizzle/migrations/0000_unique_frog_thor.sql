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
CREATE TABLE "channel_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"provider_name" varchar(50),
	"provider_config" jsonb DEFAULT '{}'::jsonb,
	"dispatch_api_template" jsonb DEFAULT '{}'::jsonb,
	"daily_cap" integer,
	"hourly_cap" integer,
	"callback_url" text,
	"callback_secret" varchar(255),
	"callback_payload_map" jsonb DEFAULT '{}'::jsonb,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comm_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_id" uuid NOT NULL,
	"journey_step_id" uuid,
	"segment_id" uuid,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled',
	"resolved_body" text,
	"resolved_fields" jsonb DEFAULT '{}'::jsonb,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"idempotency_key" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comm_events_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "comm_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"language" varchar(10) DEFAULT 'en',
	"body" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"provider_template_id" varchar(150),
	"provider_variables" jsonb DEFAULT '[]'::jsonb,
	"media_url" text,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
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
CREATE TABLE "delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider_name" varchar(50),
	"provider_msg_id" varchar(255),
	"delivery_status" varchar(30),
	"error_code" varchar(50),
	"error_message" text,
	"failure_reason" varchar(100),
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"replied_at" timestamp with time zone,
	"reply_content" text,
	"link_clicked" boolean DEFAULT false,
	"link_clicked_at" timestamp with time zone,
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
CREATE TABLE "portfolio_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"portfolio_id" uuid,
	"lender_name" varchar(255),
	"total_book_size" numeric(14, 2),
	"secured_unsecured_split" varchar(20),
	"primary_products" jsonb DEFAULT '[]'::jsonb,
	"monthly_inflow" numeric(14, 2),
	"current_dpd_stock" numeric(14, 2),
	"current_efficiency" numeric(5, 2),
	"target_efficiency" numeric(5, 2),
	"target_ror" numeric(5, 2),
	"current_contactability" numeric(5, 2),
	"approved_channels" jsonb DEFAULT '[]'::jsonb,
	"allocation_start_date" date,
	"allocation_end_date" date,
	"paid_file_frequency" varchar(20),
	"waiver_grid" jsonb DEFAULT '{}'::jsonb,
	"current_acr" numeric(8, 2),
	"commercials_model" varchar(50),
	"reporting_frequency" varchar(20),
	"expected_region_split" jsonb DEFAULT '{}'::jsonb,
	"stakeholder_goals" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolio_mapping_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"mappings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"headers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"field_count" integer DEFAULT 0,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolio_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"name" varchar(255),
	"product" varchar(100),
	"employer_name" varchar(255),
	"outstanding" numeric(14, 2) DEFAULT '0',
	"current_dpd" integer DEFAULT 0,
	"loan_number" varchar(100),
	"email" varchar(255),
	"due_date" date,
	"emi_amount" numeric(14, 2),
	"language" varchar(20),
	"state" varchar(100),
	"city" varchar(100),
	"cibil_score" integer,
	"salary_date" integer,
	"enach_enabled" boolean,
	"alternate_numbers" jsonb DEFAULT '[]'::jsonb,
	"loan_amount" numeric(14, 2),
	"dynamic_fields" jsonb DEFAULT '{}'::jsonb,
	"segment_id" uuid,
	"last_segmented_at" timestamp with time zone,
	"last_contacted_at" timestamp with time zone,
	"last_contacted_channel" varchar(20),
	"last_delivery_status" varchar(30),
	"last_interaction_type" varchar(50),
	"last_interaction_at" timestamp with time zone,
	"ptp_date" date,
	"ptp_amount" numeric(14, 2),
	"ptp_status" varchar(20),
	"contactability_score" integer DEFAULT 0,
	"preferred_channel" varchar(20),
	"total_comm_attempts" integer DEFAULT 0,
	"total_comm_delivered" integer DEFAULT 0,
	"total_comm_read" integer DEFAULT 0,
	"total_comm_replied" integer DEFAULT 0,
	"risk_bucket" varchar(20),
	"feedback_summary" jsonb DEFAULT '{}'::jsonb,
	"is_opted_out" boolean DEFAULT false,
	"last_repayment_at" timestamp with time zone,
	"total_repaid" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mapping_profile_id" uuid,
	"allocation_month" varchar(10) NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"file_url" text,
	"total_records" integer DEFAULT 0,
	"processed_records" integer DEFAULT 0,
	"failed_records" integer DEFAULT 0,
	"uploaded_by" uuid,
	"error_log" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
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
CREATE TABLE "tenant_field_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"field_key" varchar(20) NOT NULL,
	"field_index" integer NOT NULL,
	"header_name" varchar(100) NOT NULL,
	"display_label" varchar(100) NOT NULL,
	"data_type" varchar(20) DEFAULT 'string',
	"is_core" boolean DEFAULT false,
	"is_pii" boolean DEFAULT false,
	"is_strategic" boolean DEFAULT false,
	"semantic_role" varchar(50),
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
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tenants_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_interaction_id_interaction_events_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interaction_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_transcript_id_conversation_transcripts_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."conversation_transcripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD CONSTRAINT "channel_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD CONSTRAINT "channel_configs_updated_by_tenant_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_journey_step_id_journey_steps_id_fk" FOREIGN KEY ("journey_step_id") REFERENCES "public"."journey_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_templates" ADD CONSTRAINT "comm_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_templates" ADD CONSTRAINT "comm_templates_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_interaction_id_interaction_events_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interaction_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_transcripts" ADD CONSTRAINT "conversation_transcripts_record_id_portfolio_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_event_id_comm_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."comm_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dpd_bucket_configs" ADD CONSTRAINT "dpd_bucket_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dpd_bucket_configs" ADD CONSTRAINT "dpd_bucket_configs_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "opt_out_list" ADD CONSTRAINT "opt_out_list_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_configs" ADD CONSTRAINT "portfolio_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_configs" ADD CONSTRAINT "portfolio_configs_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_mapping_profiles" ADD CONSTRAINT "portfolio_mapping_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD CONSTRAINT "portfolio_records_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_mapping_profile_id_portfolio_mapping_profiles_id_fk" FOREIGN KEY ("mapping_profile_id") REFERENCES "public"."portfolio_mapping_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_uploaded_by_tenant_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_portfolio_record_id_portfolio_records_id_fk" FOREIGN KEY ("portfolio_record_id") REFERENCES "public"."portfolio_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_records" ADD CONSTRAINT "repayment_records_repayment_sync_id_repayment_syncs_id_fk" FOREIGN KEY ("repayment_sync_id") REFERENCES "public"."repayment_syncs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_syncs" ADD CONSTRAINT "repayment_syncs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayment_syncs" ADD CONSTRAINT "repayment_syncs_uploaded_by_tenant_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_job_id_task_queue_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."task_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_requested_by_tenant_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmentation_runs" ADD CONSTRAINT "segmentation_runs_triggered_by_tenant_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_queue" ADD CONSTRAINT "task_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ADD CONSTRAINT "tenant_field_registry_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_invited_by_tenant_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_action_idx" ON "audit_logs" USING btree ("tenant_id","action");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_configs_tenant_channel_idx" ON "channel_configs" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE INDEX "comm_events_tenant_id_idx" ON "comm_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "comm_events_record_id_idx" ON "comm_events" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "comm_events_tenant_status_scheduled_idx" ON "comm_events" USING btree ("tenant_id","status","scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "comm_events_idempotency_key_idx" ON "comm_events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "comm_events_journey_step_id_idx" ON "comm_events" USING btree ("journey_step_id");--> statement-breakpoint
CREATE INDEX "comm_templates_tenant_channel_idx" ON "comm_templates" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE INDEX "delivery_logs_event_id_idx" ON "delivery_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "delivery_logs_tenant_id_idx" ON "delivery_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "delivery_logs_provider_msg_id_idx" ON "delivery_logs" USING btree ("provider_msg_id");--> statement-breakpoint
CREATE INDEX "dpd_bucket_configs_tenant_id_idx" ON "dpd_bucket_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dpd_bucket_configs_tenant_bucket_name_idx" ON "dpd_bucket_configs" USING btree ("tenant_id","bucket_name");--> statement-breakpoint
CREATE INDEX "interaction_events_tenant_type_record_idx" ON "interaction_events" USING btree ("tenant_id","interaction_type","record_id","comm_event_id");--> statement-breakpoint
CREATE INDEX "journey_steps_journey_step_order_idx" ON "journey_steps" USING btree ("journey_id","step_order");--> statement-breakpoint
CREATE INDEX "journeys_tenant_segment_idx" ON "journeys" USING btree ("tenant_id","segment_id");--> statement-breakpoint
CREATE INDEX "opt_out_list_tenant_mobile_idx" ON "opt_out_list" USING btree ("tenant_id","mobile");--> statement-breakpoint
CREATE INDEX "opt_out_list_mobile_idx" ON "opt_out_list" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "portfolio_configs_tenant_id_idx" ON "portfolio_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "portfolio_mapping_profiles_tenant_id_idx" ON "portfolio_mapping_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_mapping_profiles_tenant_name_idx" ON "portfolio_mapping_profiles" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_id_idx" ON "portfolio_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_user_id_idx" ON "portfolio_records" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_mobile_idx" ON "portfolio_records" USING btree ("tenant_id","mobile");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_segment_idx" ON "portfolio_records" USING btree ("tenant_id","segment_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_dpd_idx" ON "portfolio_records" USING btree ("tenant_id","current_dpd");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_outstanding_idx" ON "portfolio_records" USING btree ("tenant_id","outstanding");--> statement-breakpoint
CREATE INDEX "portfolio_records_portfolio_id_idx" ON "portfolio_records" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_dynamic_fields_gin_idx" ON "portfolio_records" USING gin ("dynamic_fields");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_state_idx" ON "portfolio_records" USING btree ("tenant_id","state");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_cibil_idx" ON "portfolio_records" USING btree ("tenant_id","cibil_score");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_due_date_idx" ON "portfolio_records" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_loan_number_idx" ON "portfolio_records" USING btree ("tenant_id","loan_number");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_email_idx" ON "portfolio_records" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_contactability_idx" ON "portfolio_records" USING btree ("tenant_id","contactability_score");--> statement-breakpoint
CREATE INDEX "portfolios_tenant_month_status_idx" ON "portfolios" USING btree ("tenant_id","allocation_month","status");--> statement-breakpoint
CREATE INDEX "repayment_records_tenant_date_record_idx" ON "repayment_records" USING btree ("tenant_id","payment_date","portfolio_record_id");--> statement-breakpoint
CREATE INDEX "repayment_syncs_tenant_date_idx" ON "repayment_syncs" USING btree ("tenant_id","sync_date");--> statement-breakpoint
CREATE INDEX "report_jobs_tenant_id_idx" ON "report_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "report_jobs_tenant_status_idx" ON "report_jobs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "report_jobs_job_id_idx" ON "report_jobs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "segmentation_runs_tenant_portfolio_idx" ON "segmentation_runs" USING btree ("tenant_id","portfolio_id");--> statement-breakpoint
CREATE INDEX "segments_tenant_id_idx" ON "segments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "segments_tenant_active_priority_idx" ON "segments" USING btree ("tenant_id","is_active","priority");--> statement-breakpoint
CREATE INDEX "segments_tenant_default_idx" ON "segments" USING btree ("tenant_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_field_registry_tenant_field_key_idx" ON "tenant_field_registry" USING btree ("tenant_id","field_key");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_field_registry_tenant_header_idx" ON "tenant_field_registry" USING btree ("tenant_id","header_name");--> statement-breakpoint
CREATE INDEX "tenant_field_registry_tenant_id_idx" ON "tenant_field_registry" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_users_tenant_email_idx" ON "tenant_users" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "tenant_users_tenant_id_idx" ON "tenant_users" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_code_idx" ON "tenants" USING btree ("code");