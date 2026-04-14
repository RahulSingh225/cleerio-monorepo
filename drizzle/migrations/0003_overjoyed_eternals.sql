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
DROP INDEX "portfolio_records_tenant_user_id_idx";--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "mapping_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "portfolio_mapping_profiles" ADD CONSTRAINT "portfolio_mapping_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_mapping_profiles_tenant_id_idx" ON "portfolio_mapping_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_mapping_profiles_tenant_name_idx" ON "portfolio_mapping_profiles" USING btree ("tenant_id","name");--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_mapping_profile_id_portfolio_mapping_profiles_id_fk" FOREIGN KEY ("mapping_profile_id") REFERENCES "public"."portfolio_mapping_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_records_tenant_user_id_idx" ON "portfolio_records" USING btree ("tenant_id","user_id");