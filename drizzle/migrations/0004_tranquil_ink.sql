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
ALTER TABLE "channel_configs" ADD COLUMN "dispatch_api_template" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD COLUMN "callback_url" text;--> statement-breakpoint
ALTER TABLE "channel_configs" ADD COLUMN "callback_secret" varchar(255);--> statement-breakpoint
ALTER TABLE "channel_configs" ADD COLUMN "callback_payload_map" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "comm_templates" ADD COLUMN "provider_template_id" varchar(150);--> statement-breakpoint
ALTER TABLE "comm_templates" ADD COLUMN "provider_variables" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD COLUMN "failure_reason" varchar(100);--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD COLUMN "replied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD COLUMN "reply_content" text;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD COLUMN "link_clicked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "delivery_logs" ADD COLUMN "link_clicked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "employer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "loan_number" varchar(100);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "emi_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "language" varchar(20);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "cibil_score" integer;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "salary_date" integer;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "enach_enabled" boolean;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "alternate_numbers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "loan_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_contacted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_contacted_channel" varchar(20);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_delivery_status" varchar(30);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_interaction_type" varchar(50);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "last_interaction_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "ptp_date" date;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "ptp_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "ptp_status" varchar(20);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "contactability_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "preferred_channel" varchar(20);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "total_comm_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "total_comm_delivered" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "total_comm_read" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "total_comm_replied" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "risk_bucket" varchar(20);--> statement-breakpoint
ALTER TABLE "portfolio_records" ADD COLUMN "feedback_summary" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ADD COLUMN "is_strategic" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenant_field_registry" ADD COLUMN "semantic_role" varchar(50);--> statement-breakpoint
ALTER TABLE "portfolio_configs" ADD CONSTRAINT "portfolio_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_configs" ADD CONSTRAINT "portfolio_configs_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_configs_tenant_id_idx" ON "portfolio_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_state_idx" ON "portfolio_records" USING btree ("tenant_id","state");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_cibil_idx" ON "portfolio_records" USING btree ("tenant_id","cibil_score");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_due_date_idx" ON "portfolio_records" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_loan_number_idx" ON "portfolio_records" USING btree ("tenant_id","loan_number");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_email_idx" ON "portfolio_records" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_contactability_idx" ON "portfolio_records" USING btree ("tenant_id","contactability_score");--> statement-breakpoint
ALTER TABLE "portfolio_records" DROP COLUMN "employer_id";