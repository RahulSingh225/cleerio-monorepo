CREATE TABLE "saved_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_ulid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"query_spec" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "saved_queries" ADD CONSTRAINT "saved_queries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_queries" ADD CONSTRAINT "saved_queries_created_by_tenant_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."tenant_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_queries_tenant_id_idx" ON "saved_queries" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_queries_tenant_name_idx" ON "saved_queries" USING btree ("tenant_id","name");