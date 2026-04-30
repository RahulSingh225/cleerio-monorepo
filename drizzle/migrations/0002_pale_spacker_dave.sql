ALTER TABLE "comm_events" DROP CONSTRAINT "comm_events_journey_step_id_journey_steps_id_fk";
--> statement-breakpoint
ALTER TABLE "interaction_events" DROP CONSTRAINT "interaction_events_journey_step_id_journey_steps_id_fk";
--> statement-breakpoint
ALTER TABLE "comm_events" ADD CONSTRAINT "comm_events_journey_step_id_journey_steps_id_fk" FOREIGN KEY ("journey_step_id") REFERENCES "public"."journey_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_events" ADD CONSTRAINT "interaction_events_journey_step_id_journey_steps_id_fk" FOREIGN KEY ("journey_step_id") REFERENCES "public"."journey_steps"("id") ON DELETE set null ON UPDATE no action;