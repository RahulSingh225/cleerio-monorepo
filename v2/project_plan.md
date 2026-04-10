Key design decisions baked in

Exactly-one-segment guarantee: enforced in the segmentation worker + unique constraint on (tenant_id, user_id, segment_id) if you want to be strict.
Dynamic everything: criteria_jsonb + field registry = unlimited segmentation power.
Feedback loop closed: every interaction, transcript, recording, repayment flows back to portfolio_records and segments.success_rate.
Future AI ready: task_type = 'ai.insight', ai_insights table, and criteria_jsonb can be updated by AI agents.
Kafka-native: task_queue only tracks state; real work is published to Kafka topics (you consume & update DB atomically).
ULID + partitioning ready: all new PKs use gen_ulid(); add PARTITION BY RANGE(tenant_id) on hot tables later.
Soft deletes + RLS ready: every business table has deleted_at.


Implementation Plan & Project Blueprint
Tech Stack (as specified)

DB: Postgres 16+ (Drizzle ORM)
Queue: Kafka (topics: portfolio.ingest, segmentation.run, comm.dispatch, feedback.process, repayment.sync, ai.insight)
Cache: Redis (tenant config, field registry, active segments, rate limits)
Backend: Next.js 15 App Router + Drizzle + Kafka
Frontend: Next.js + 
Storage: S3 (files, audio, reports)

High-level Architecture
textKafka Topics
   ↓
Consumers (Node.js workers)
   ↓ (atomic DB updates via Drizzle)
Postgres (all state)
   ↑
Next.js API Routes + Server Actions → publish to Kafka
   ↑
Redis (cache) + Drizzle (queries)
Phase 1 – Foundation 

Migrate existing schema → new ULID + soft-delete columns (zero-downtime with logical replication).
Implement tenant_field_registry ingestion (CSV/JSON → auto-detect headers → create fields).
Build portfolio ingest → portfolio_records (core fields + dynamic_fields).
Add RLS policies + Drizzle policies.
Kafka setup + first topics (ingest → segmentation).

Phase 2 – Segmentation Engine 

Build segmentation worker (Kafka consumer) that evaluates criteria_jsonb against dynamic_fields.
Create segmentation_runs + atomic UPDATE portfolio_records SET segment_id = ….
Default “Others” segment auto-created per tenant.
UI: drag-and-drop rule builder (field → operator → value) → saved as criteria_jsonb.

Phase 3 – Journeys & Strategies 

CRUD for segments → journeys → journey_steps.
comm_templates now assignable to steps.
comm.dispatch consumer that walks journey_steps and creates comm_events.
Idempotency + daily/hourly caps enforced in Redis.

Phase 4 – Feedback & Intelligence Layer 

Webhook receivers (SMS/Whatsapp/IVR) → publish to feedback.process topic.
Parse callbacks → interaction_events + transcripts + call_recordings.
Daily aggregation job that updates segments.success_rate + portfolio_records.last_repayment_at.
UI dashboards: segment performance, journey heatmaps, feedback trends.

Phase 5 – Repayment & Re-segmentation 

Repayment ingest → repayment_records + update portfolio_records.outstanding.
Trigger re-segmentation (or AI-recommend-new-segment) via Kafka.

Phase 6 – AI Layer (future – 4–6 weeks after MVP)

Add OpenAI/Anthropic agents that read segment performance + feedback.
Agent can propose new criteria_jsonb or new journey_steps → human approval in UI.
Store proposals in ai_insights.

Milestones & Deliverables

Tenant can upload portfolio → see records with dynamic fields.
Segmentation working + records assigned to buckets.
Full journey + multi-channel dispatch working.
Feedback loop closed (PTP, transcripts, audio stored).
Repayment sync + re-segmentation.