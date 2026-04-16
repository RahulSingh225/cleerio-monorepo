# Phase 5 — Feedback Loop & Data Point Capture

## 5.0 — Portfolio Data Foundation
- [x] Add 12 core columns to `portfolio_records` in schema.ts
- [x] Add `isStrategic` + `semanticRole` to `tenant_field_registry`
- [x] Create `portfolio_configs` table
- [x] Rename `employerId` → `employerName`
- [x] Add new indexes
- [x] Create migration endpoint
- [x] Update ingestion pipeline for semantic field mapping

## 5.1 — Feedback Columns
- [x] Add 16 feedback columns to `portfolio_records`
- [x] Add 5 columns to `delivery_logs`
- [x] Add 3 columns to `channel_configs`
- [x] Run migration *(in endpoint)*

## 5.2 — Webhook Ingestion Layer
- [x] Create `CallbackNormalizerService`
- [x] Create `FeedbackProcessorService`
- [x] Create `WebhooksController` (SMS/WA/IVR/Payment endpoints)
- [x] Create `WebhooksModule` + register in API
- [x] Export new services from `@platform/domain`

## 5.3 — Feedback-Aware Journey Conditions
- [x] Enhance `evaluateStepCondition` for feedback fields
- [x] Add step-relative field resolution
- [x] Add new operators (has_ptp, channel_viable, due_date_within, salary_date_is)

## 5.4 — Segment Reassignment Rules
- [x] Create `ReassignmentRulesService`
- [x] Integrate into `FeedbackProcessorService`

## 5.5 — IVR Boilerplate
- [x] Stub IVR webhook endpoint (raw payload storage only)

## 5.6 — Payment Link Tracking
- [x] Create `PaymentLinksService`
- [x] Create redirect endpoint `GET /p/:shortCode`

## 5.7 — Journey Builder UX
- [x] Add WaitForFeedback node
- [x] Add ReassignSegment node
- [x] Build ConditionConfigPanel with ALL data point groups
- [x] Update palette

## 5.8 — Worker Feedback Job
- [x] Add `feedback.process` job type
- [x] Import WebhooksModule into worker

## 5.9 — Record 360° View
- [x] Communication timeline with delivery statuses
- [x] PTP section with manual review controls
- [x] Contactability score gauge
- [x] All core + dynamic fields display *(Updated in cases page)*

## 5.10 — Data Point Registry API
- [x] Create `DataPointsService`
- [x] Create `DataPointsController`
- [x] Wire into ConditionConfigPanel
