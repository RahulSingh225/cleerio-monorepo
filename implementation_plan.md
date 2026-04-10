# Cleerio v2 — Full Platform Implementation Plan

> **Goal**: Migrate from v1's DPD-bucket → workflow-rule model to v2's **Segment → Journey → Journey Steps** architecture with dynamic `criteria_jsonb`, visual builders, feedback loops, and repayment-driven re-segmentation.

---

## Executive Summary

The v2 schema introduces **5 major architectural shifts** from v1:

| Concept | v1 (Current) | v2 (Target) |
|---------|-------------|-------------|
| **Targeting** | `dpd_bucket_configs` → `workflow_rules` | `segments` with `criteria_jsonb` → `journeys` → `journey_steps` |
| **Rule Engine** | Static bucket-to-template mapping | Dynamic JSONB rule evaluator against `dynamic_fields` |
| **Orchestration** | Single `comm_events` generation | Multi-step journey with delays, conditions, channel branching |
| **Feedback** | None | `interaction_events` + `conversation_transcripts` + `call_recordings` → `segments.success_rate` |
| **Repayment** | Missing | `repayment_syncs` → `repayment_records` → re-segmentation via Kafka |

> [!IMPORTANT]
> ### Tables Removed in v2
> - `workflow_rules` → replaced by `journeys` + `journey_steps`
> - `batch_runs` / `batch_errors` → replaced by `segmentation_runs`
> - `scheduled_jobs` → replaced by `journey_steps.schedule_cron`
> 
> ### Tables Added in v2
> - `segments` (with `criteria_jsonb` rule engine)
> - `segmentation_runs` (batch tracking for segment assignment)
> - `journeys` (segment-to-strategy binding)
> - `journey_steps` (ordered multi-channel actions)
> - `interaction_events` (feedback: PTP, dispute, callback)
> - `conversation_transcripts` (IVR/voice bot transcripts)
> - `call_recordings` (audio files with S3 URLs)
> - `repayment_records` (individual payment entries)
> - `ai_insights` (AI-generated recommendations)

---

## User Review Required

> [!WARNING]
> ### Breaking Schema Changes
> The v2 schema **removes** `workflow_rules`, `batch_runs`, `batch_errors`, and `scheduled_jobs` tables entirely. The existing "Strategy Builder" that creates `workflow_rules` will be replaced by a new **Journey Builder** that creates `journeys` + `journey_steps`. Any deployed workflow rules will need migration.

> [!IMPORTANT]
> ### Key Design Decisions
> 1. **Segment Rule Builder**: Will use a visual tree-renderer (nested AND/OR groups) rather than raw JSON editing. Each rule node selects a field from `tenant_field_registry`, an operator, and a value.
> 2. **Journey Builder**: Full React Flow canvas with new node types: **Segment Trigger** → **Wait/Delay** → **Send SMS/WhatsApp/IVR** → **Condition (response check)** → **Branch**. Replaces the current 4-node builder.
> 3. **Repayment Flow**: Upload CSV → match by `user_id` → update `portfolio_records.outstanding` → trigger re-segmentation via Kafka `repayment.sync` topic.
> 4. **`portfolio_records` changes**: Removes `dpdBucket` and `overdue` columns. Adds `segment_id`, `last_segmented_at`, `last_repayment_at`, `total_repaid`. The `outstanding` column remains.

---

## Proposed Changes

### Phase 1 — Schema Migration & Foundation

---

#### [MODIFY] [schema.ts](file:///d:/git%20repo/cleerio-monorepo/libs/drizzle/schema.ts)

**Major rewrite** of the Drizzle schema to match the new v2 SQL. Changes include:

1. **Remove**: `workflowRules`, `batchRuns`, `batchErrors`, `scheduledJobs` tables
2. **Add**: `segments`, `segmentationRuns`, `journeys`, `journeySteps`, `interactionEvents`, `conversationTranscripts`, `callRecordings`, `repaymentRecords`, `aiInsights` tables
3. **Modify `portfolioRecords`**:
   - Remove: `dpdBucket`, `overdue`, `lastSyncedAt`
   - Add: `segmentId` (FK → segments), `lastSegmentedAt`, `lastRepaymentAt`, `totalRepaid`
   - Change `userId` length from 50 → 100
4. **Modify `commEvents`**:
   - Remove: `ruleId`, `templateId`, `jobId`, `queuedAt`
   - Add: `journeyStepId` (FK → journeySteps), `segmentId` (FK → segments), `resolvedFields`
5. **Modify `commTemplates`**:
   - Remove: `dpdBucket`, `version`, `approvedAt`
6. **Modify `jobQueue`**:
   - Remove: `maxAttempts`, `claimedBy`, `claimedAt`, `claimExpiresAt`, `lastError`, `failedAt`, `nextRetryAt`, `updatedAt`
   - Add: `kafkaTopic`, `kafkaKey`
   - Rename: `jobType` → `taskType`
7. **Add `deletedAt`** soft-delete column to `tenants`, `portfolioRecords`

---

#### [NEW] `libs/drizzle/migrations/0001_v2_schema.sql`

Auto-generated migration from Drizzle Kit after schema changes. Will include:
- `ALTER TABLE portfolio_records DROP COLUMN dpd_bucket, ADD COLUMN segment_id uuid...`
- `CREATE TABLE segments ...`
- `CREATE TABLE journeys ...`
- Data migration for existing `portfolio_records` (set `segment_id` to a default "Unassigned" segment)

---

### Phase 2 — Backend: Segments & Segmentation Engine

---

#### [NEW] `libs/domain/src/modules/segments/segments.service.ts`

Full CRUD service for segments:
- `create(data)` — validate `criteria_jsonb` structure, enforce unique `(tenant_id, code)`
- `findAll(tenantId)` — list with record count per segment
- `findById(id)` — with success_rate stats
- `update(id, data)` — update criteria, auto-trigger re-segmentation
- `delete(id)` — soft delete, reassign records to default segment
- `getDefaultSegment(tenantId)` — auto-create "Others" segment if not exists
- `evaluateCriteria(criteria, dynamicFields)` — **JSONB rule evaluator** that supports:
  - Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`, `between`
  - Logical: `AND`, `OR` groups (nested)
  - Field references: `field1`, `field2`, ..., `fieldN` + core fields (`current_dpd`, `outstanding`, etc.)

**criteria_jsonb format:**
```json
{
  "logic": "AND",
  "conditions": [
    { "field": "current_dpd", "operator": "between", "value": [31, 60] },
    { "field": "outstanding", "operator": "gte", "value": 5000 },
    {
      "logic": "OR",
      "conditions": [
        { "field": "field3", "operator": "eq", "value": "personal_loan" },
        { "field": "field3", "operator": "eq", "value": "credit_card" }
      ]
    }
  ]
}
```

---

#### [NEW] `libs/domain/src/modules/segmentation-runs/segmentation-runs.service.ts`

Worker-facing service:
- `startRun(tenantId, portfolioId?, triggeredBy?)` → create `segmentation_runs` row
- `processRun(runId)` — fetch all portfolio records, evaluate each against all active segments (priority-ordered), assign first match + fallback to default
- `updateProgress(runId, processed)` — atomic counter increment

---

#### [NEW] `apps/api/src/modules/segments/segments.controller.ts`

REST endpoints:
- `POST /v1/segments` — create segment with criteria_jsonb
- `GET /v1/segments` — list all segments (with record counts)
- `GET /v1/segments/:id` — segment detail with stats
- `PUT /v1/segments/:id` — update segment
- `DELETE /v1/segments/:id` — soft delete
- `POST /v1/segments/run` — trigger manual segmentation run
- `GET /v1/segmentation-runs` — list past runs with progress

---

### Phase 3 — Backend: Journeys & Journey Steps

---

#### [NEW] `libs/domain/src/modules/journeys/journeys.service.ts`

Journey lifecycle:
- `create({ tenantId, segmentId, name, description })` — create journey bound to a segment
- `findAll(tenantId)` — list with step counts and active status
- `findById(id)` — include all `journey_steps` in order
- `update(id, data)` — update name, toggle `is_active`
- `delete(id)` — cascade delete steps
- `activate(id)` / `deactivate(id)` — toggle with validation

---

#### [NEW] `libs/domain/src/modules/journey-steps/journey-steps.service.ts`

Step management:
- `create({ journeyId, stepOrder, actionType, channel, templateId, delayHours, conditions })` 
- `reorder(journeyId, stepIds[])` — bulk update `step_order`
- `update(stepId, data)` — update conditions, template, delay
- `delete(stepId)` — remove and reorder remaining

**`action_type` values**: `send_sms`, `send_whatsapp`, `send_ivr`, `send_voice_bot`, `wait`, `condition_check`, `manual_review`

---

#### [NEW] `apps/api/src/modules/journeys/journeys.controller.ts`

REST endpoints:
- `POST /v1/journeys` — create journey
- `GET /v1/journeys` — list all
- `GET /v1/journeys/:id` — detail with steps
- `PUT /v1/journeys/:id` — update
- `DELETE /v1/journeys/:id` — delete
- `POST /v1/journeys/:id/steps` — add step
- `PUT /v1/journeys/:id/steps/:stepId` — update step
- `DELETE /v1/journeys/:id/steps/:stepId` — delete step
- `PUT /v1/journeys/:id/steps/reorder` — reorder steps
- `POST /v1/journeys/:id/deploy` — activate journey, validate all steps have templates

---

### Phase 4 — Backend: Communication Dispatch & Feedback

---

#### [MODIFY] `apps/worker/src/job-queue/job-queue.service.ts`

Major rewrite:
- Replace `handlePortfolioIngest` with new handlers:
  - `handleSegmentationRun` — evaluate criteria_jsonb, assign segments
  - `handleCommDispatch` — walk journey steps for a segment, create comm_events
  - `handleFeedbackProcess` — parse webhook payloads → interaction_events
  - `handleRepaymentSync` — match + update portfolio records
- Fix existing bugs (BUG-01 through BUG-04)
- Map `task_type` to handlers: `'segmentation.run'`, `'comm.dispatch'`, `'feedback.process'`, `'repayment.sync'`

---

#### [NEW] `libs/domain/src/modules/interaction-events/interaction-events.service.ts`

Feedback recording:
- `create(data)` — log PTP, dispute, callback, link reply interactions
- `findByRecord(recordId)` — timeline of all interactions for a borrower
- `findBySegment(segmentId)` — aggregate feedback per segment

---

#### [NEW] `libs/domain/src/modules/repayment/repayment.service.ts`

Repayment pipeline:
- `createSync(tenantId, file, uploadedBy)` — create `repayment_syncs` row
- `processSync(syncId)` — parse CSV, match records by `user_id`, insert `repayment_records`, update `portfolio_records.outstanding`, `total_repaid`, `last_repayment_at`
- `triggerReSegmentation(tenantId)` — publish Kafka event `segmentation.run`

---

#### [NEW] `apps/api/src/modules/repayment/repayment.controller.ts`

- `POST /v1/repayment-syncs/upload` — upload CSV
- `GET /v1/repayment-syncs` — list sync history
- `GET /v1/repayment-records/:portfolioRecordId` — payment history for a borrower

---

### Phase 5 — Dashboard: Complete UI Redesign

This is the largest phase. Each page will be visually rich, leveraging React Flow, tree renderers, and data visualization.

---

#### 5.1 — Sidebar & Navigation Restructure

##### [MODIFY] [sidebar.tsx](file:///d:/git%20repo/cleerio-monorepo/apps/dashboard/components/ui/sidebar.tsx)

Restructured navigation groups:

```
OPERATIONS
├── Dashboard         → /insights          (overview metrics + live feed)
├── Portfolio Records → /cases             (borrower search + detail)

STRATEGY
├── Segments          → /segments          (NEW: segment list + rule builder)
├── Journeys          → /journeys          (NEW: replaces /workflows)
├── Templates         → /settings/templates (moved up for visibility)

COMMUNICATIONS
├── Comm Events       → /communications    (existing, enhanced)
├── Delivery Logs     → /delivery-logs     (NEW)
├── Interaction Feed  → /interactions      (NEW: feedback timeline)

ANALYTICS
├── Reports           → /reports           (enhanced)
├── Repayments        → /repayments        (NEW)
├── AI Insights       → /ai-insights       (NEW: future)

CONFIGURATION
├── Settings          → /settings          (field registry, channels, DPD buckets, opt-out)
```

---

#### 5.2 — Segment Management (NEW Pages)

##### [NEW] `apps/dashboard/app/segments/page.tsx`

**Segment List Page** — Premium card grid layout:
- Each segment displayed as a **glassmorphic card** with:
  - Segment name, code, priority badge
  - **Record count** (live from API)
  - **Success rate** as a circular progress ring (animated)
  - `criteria_jsonb` preview as human-readable rule summary (e.g., "DPD 31–60 AND Outstanding ≥ ₹5,000")
  - Active/inactive toggle switch
  - Quick actions: Edit, Clone, Delete
- **Top metrics row**: Total segments, Avg success rate, Records unassigned, Last run time
- "Create Segment" button → opens `/segments/new`

##### [NEW] `apps/dashboard/app/segments/[id]/page.tsx`

**Segment Detail Page**:
- Header with segment stats (record count, success rate trend, linked journeys)
- **Criteria Visualizer**: Tree view of the criteria_jsonb rules (expandable groups)
- **Linked Journeys** section showing active journeys for this segment
- **Records Table**: Paginated list of portfolio records in this segment
- **Performance Chart**: Success rate over time (line chart with CSS gradients)

##### [NEW] `apps/dashboard/app/segments/new/page.tsx` + `apps/dashboard/app/segments/[id]/edit/page.tsx`

**Segment Rule Builder** — The crown jewel visual builder:

**Tree-based rule renderer** (custom component, not React Flow):
- Root node: `AND` / `OR` toggle
- Each condition row: `[Field Dropdown]` `[Operator]` `[Value Input]`
  - Field dropdown populated from `tenant_field_registry` + core fields
  - Operator auto-adjusts based on field `data_type` (string → eq/contains, number → gt/lt/between, etc.)
  - Value input can be text, number, date, or multi-select
- **Nested groups**: "Add Group" button creates child AND/OR groups (indent + left border visual)
- **Live preview panel**: Shows JSON output + simulated match count ("~1,247 records would match")
- **Drag-to-reorder** conditions within a group
- Color-coded by depth level (blue → purple → teal → orange)
- Animated add/remove transitions

##### [NEW] `apps/dashboard/components/builder/SegmentRuleBuilder.tsx`

Core component:
```
<SegmentRuleBuilder
  fieldRegistry={fields}
  initialCriteria={segment?.criteria_jsonb}
  onChange={(criteria) => setCriteria(criteria)}
  showPreview={true}
  tenantId={tenantId}
/>
```

##### [NEW] `apps/dashboard/components/builder/RuleGroup.tsx`

Recursive group renderer:
- AND/OR toggle with animated pill switch
- Condition rows with inline editing
- "Add Condition" / "Add Group" buttons
- Delete button per condition/group
- Depth-based left border colors

##### [NEW] `apps/dashboard/components/builder/RuleCondition.tsx`

Single condition row:
- Field selector (searchable dropdown with field type badges)
- Operator selector (context-aware based on data type)
- Value input (smart: number slider for dpd, currency format for amounts, dropdown for known enums)

---

#### 5.3 — Journey Builder (Complete Redesign of /workflows)

##### [MODIFY → REPLACE] `apps/dashboard/app/workflows/page.tsx` → [NEW] `apps/dashboard/app/journeys/page.tsx`

**Journey List Page**:
- Card grid showing each journey with:
  - Journey name, description
  - Linked segment name (with color badge)
  - Step count, channel badges (SMS 💬, WhatsApp 📱, IVR 📞)
  - Active/inactive status with toggle
  - Success metric display
  - Quick: Edit, Clone, Activate/Deactivate
- Filters: by segment, active/inactive, channel

##### [NEW] `apps/dashboard/app/journeys/[id]/page.tsx`

**Journey Detail + Builder** — Full React Flow canvas:

**New Node Types** (replacing old Bucket/Template/Channel/Delay nodes):

| Node Type | Color | Icon | Function |
|-----------|-------|------|----------|
| `SegmentTrigger` | Emerald | Target | Entry point — displays the linked segment name + record count |
| `WaitDelay` | Amber | Timer | Configurable delay in hours/days + repeat interval |
| `SendMessage` | Blue | Send | Select channel (SMS/WA/IVR) + template from dropdown |
| `ConditionCheck` | Purple | GitBranch | Check response (replied? PTP? no_response?) + branch edges |
| `ManualReview` | Orange | UserCheck | Flag for human agent review |
| `EndSuccess` | Green | CheckCircle | Journey completion marker |
| `EndFailure` | Red | XCircle | Journey failure/escalation marker |

**Canvas Features**:
- **Left Panel**: Draggable node palette (cards you drag onto canvas)
- **Right Panel**: Node configuration (slides out when a node is selected)
  - Template previewer with variable highlighting
  - Condition builder (response_type == 'ptp' → success path)
  - Delay configurator with visual timeline
- **Top Bar**: Journey name (inline editable), Save/Deploy buttons, validation status
- **Bottom Panel**: Mini timeline view showing step sequence linearly
- **Edge labels**: Shows delay duration between nodes ("Wait 24h")
- **Validation**: Highlights incomplete nodes in red, shows error messages
- **Auto-layout**: Button to auto-arrange nodes in a clean flow

**Serialization**: Canvas state (nodes + edges) → `journey_steps` records with proper `step_order`, `action_type`, `channel`, `template_id`, `delay_hours`, `conditions_jsonb`

##### [NEW] `apps/dashboard/components/builder/nodes/SegmentTriggerNode.tsx`
##### [NEW] `apps/dashboard/components/builder/nodes/WaitDelayNode.tsx`
##### [NEW] `apps/dashboard/components/builder/nodes/SendMessageNode.tsx`
##### [NEW] `apps/dashboard/components/builder/nodes/ConditionCheckNode.tsx`
##### [NEW] `apps/dashboard/components/builder/nodes/ManualReviewNode.tsx`
##### [NEW] `apps/dashboard/components/builder/nodes/EndNode.tsx`

Each node component:
- Consistent card design with colored header, icon, status indicator
- Configurable via right-panel (no inline forms cluttering the canvas)
- Handles on correct positions (top/bottom for vertical flow)
- Selection state with glow effect
- Error state with shake animation

##### [NEW] `apps/dashboard/components/builder/JourneyCanvas.tsx`

The React Flow wrapper:
- Manages nodes/edges state
- Handles serialization to/from `journey_steps` API format
- Provides validation logic
- Manages the right-panel slide-out for node configuration

##### [NEW] `apps/dashboard/components/builder/NodeConfigPanel.tsx`

Slide-out configuration panel:
- Appears when a node is clicked
- Dynamically renders config form based on node type
- Template selector with live preview
- Condition builder for branch nodes
- Delay time picker

---

#### 5.4 — Enhanced Dashboard Home (`/insights`)

##### [MODIFY] [page.tsx](file:///d:/git%20repo/cleerio-monorepo/apps/dashboard/app/insights/page.tsx)

Redesign with v2 data model:
- **Top Metrics**: Total Records, Total Outstanding, Active Segments, Active Journeys
- **Segment Performance Grid**: Each segment as a card with success rate ring + trend arrow
- **Journey Health**: Active journeys with step completion funnel (how many records at each step)
- **Communication Heatmap**: 7-day calendar view showing send volumes by channel (CSS grid)
- **Recent Activity Feed**: Real-time log of comm sends, interactions, repayments
- **DPD Distribution**: Now grouped by segment (stacked bar chart)

---

#### 5.5 — Borrower Detail View Enhancement

##### [MODIFY] `apps/dashboard/app/cases/[id]/page.tsx`

**Borrower 360° View** (the record detail page):
- **Header**: Name, mobile, user_id, segment badge, outstanding amount
- **Timeline Tab**: Chronological feed showing:
  - 📤 Communications sent (channel, template, delivery status)
  - 💬 Interactions (PTP, callbacks, disputes)
  - 🎧 Call recordings (playable audio player)
  - 💰 Repayments received
  - 🔄 Segment changes
- **Journey Progress Tab**: Visual journey step indicator showing where this record is in their active journey
- **Financial Tab**: Outstanding trends, repayment history chart, DPD movement
- **Dynamic Fields Tab**: All `dynamic_fields` displayed in a clean key-value grid

---

#### 5.6 — Repayment Management (NEW)

##### [NEW] `apps/dashboard/app/repayments/page.tsx`

- Upload section with drag-and-drop CSV uploader
- Sync history table with status badges (pending/processing/completed/failed)
- Records updated counter, matched vs unmatched stats
- "Trigger Re-segmentation" button after sync

##### [NEW] `apps/dashboard/app/repayments/[syncId]/page.tsx`

- Sync detail: file URL, records matched/updated
- Individual repayment records table
- Before/after outstanding comparison

---

#### 5.7 — Interaction & Feedback Timeline (NEW)

##### [NEW] `apps/dashboard/app/interactions/page.tsx`

- **Live Feed** of all interaction events across the tenant
- Filterable by: interaction_type, channel, segment, date range
- Each entry shows: borrower name, type (PTP/dispute/callback), channel, conversation preview
- Click to expand → full transcript, recording playback, AI sentiment

---

#### 5.8 — Delivery Logs (NEW)

##### [NEW] `apps/dashboard/app/delivery-logs/page.tsx`

- Table view of all delivery logs
- Provider message ID, delivery status, error codes
- Timeline: sent → delivered → read (visual status progression)
- Filter by provider, status, date range

---

#### 5.9 — Reports Enhancement

##### [MODIFY] `apps/dashboard/app/reports/page.tsx`

Add new report types:
- **Segment Performance Report**: Success rates, record counts, journey completion
- **DPD Movement Report**: Records moving between segments over time
- **Communication Log Report**: Full comm event export with delivery status
- **Repayment Report**: Payments received, outstanding reduction
- **Batch Error Report**: From segmentation runs

Each report: configurable filters → async generation via `report_jobs` → download link

---

#### 5.10 — Settings Reorganization

##### [MODIFY] [settings/page.tsx](file:///d:/git%20repo/cleerio-monorepo/apps/dashboard/app/settings/page.tsx)

Add new settings cards:
- **Tenant Users** → `/settings/users` (NEW — full CRUD for tenant users with role assignment)
- **DPD Buckets** → stays (still used for criteria evaluation)
- **Segment Defaults** → global settings for default segment behavior

---

### Phase 6 — Worker: Kafka Consumers & Background Jobs

---

#### [MODIFY] `apps/worker/src/kafka/kafka.service.ts`

New Kafka consumers for v2 topics:
- `portfolio.ingest` → Creates segmentation run after portfolio upload
- `segmentation.run` → Evaluates all segments against records
- `comm.dispatch` → Walks journey steps, creates comm_events per eligible record
- `feedback.process` → Parses provider webhooks → interaction_events
- `repayment.sync` → Processes repayment file → updates records
- `ai.insight` → (Phase 6 future) AI agent suggestions

Each consumer:
1. Receives message
2. Creates `task_queue` entry
3. Worker picks up via polling
4. Processes with proper error handling + retry

---

### Shared Components & Utilities

---

#### [NEW] `apps/dashboard/components/ui/circular-progress.tsx`

Animated SVG circular progress ring for segment success rates.

#### [NEW] `apps/dashboard/components/ui/timeline.tsx`

Vertical timeline component for borrower activity feed.

#### [NEW] `apps/dashboard/components/ui/audio-player.tsx`

Minimal audio player for call recordings.

#### [NEW] `apps/dashboard/components/ui/drag-drop-upload.tsx`

Styled drag-and-drop file upload area with progress bar.

#### [NEW] `apps/dashboard/components/ui/heatmap.tsx`

CSS-grid based heatmap for communication volume visualization.

#### [NEW] `apps/dashboard/components/ui/funnel-chart.tsx`

Step-by-step funnel visualization for journey completion rates.

#### [NEW] `apps/dashboard/components/ui/rule-preview.tsx`

Renders `criteria_jsonb` as human-readable rule text with syntax highlighting.

#### [NEW] `apps/dashboard/components/ui/empty-state.tsx`

Reusable empty state component with icon, title, description, and CTA button.

#### [NEW] `apps/dashboard/lib/criteria-evaluator.ts`

Client-side criteria evaluator for live preview counts during segment creation:
```ts
export function evaluateCriteria(
  criteria: CriteriaGroup, 
  record: Record<string, any>
): boolean
```

---

## Open Questions

> [!IMPORTANT]
> ### Q1: Existing Data Migration
> The current `portfolio_records` has ~1.3M records (from refine.csv). Should we:
> - **(a)** Create a default "Unassigned" segment and assign all existing records to it?
> - **(b)** Run the segmentation engine on existing records after creating initial segments?
> - **(c)** Start fresh with a clean database?

> [!IMPORTANT] 
> ### Q2: Workflow Rules Migration
> Any existing `workflow_rules` will be lost. Should we attempt to auto-convert them to `journeys` + `journey_steps`, or is a clean start fine?

> [!WARNING]
> ### Q3: React Flow Canvas Layout
> The Journey Builder can use either:
> - **(a)** **Top-to-bottom** vertical flow (like Zapier/n8n) — better for linear multi-step journeys
> - **(b)** **Left-to-right** horizontal flow (like current Strategy Builder) — familiar but harder for complex branching
> 
> I recommend **(a) vertical top-to-bottom** for the new Journey Builder since journeys are inherently sequential with branches.

> [!NOTE]
> ### Q4: AI Insights (Phase 6)
> The `ai_insights` table is defined but Phase 6 (AI Layer) is marked as future (4–6 weeks after MVP). Should we:
> - **(a)** Build the UI scaffolding now with placeholder cards?
> - **(b)** Skip entirely until Phase 6?

---

## Verification Plan

### Automated Tests

1. **Schema Migration**:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```
   Verify all 22 tables from v2 SQL are present with correct columns.

2. **Segmentation Engine**:
   ```bash
   # Unit test: criteria evaluator
   npx vitest run libs/domain/src/modules/segments/criteria-evaluator.spec.ts
   ```
   Test cases: AND/OR nesting, all operators, edge cases (null fields, type coercion).

3. **API Endpoints**:
   - POST/GET/PUT/DELETE for segments, journeys, journey-steps, repayment-syncs
   - Test tenant isolation (records cannot leak between tenants)
   - Test role-based access

4. **End-to-End Flow**:
   ```bash
   # 1. Upload portfolio → 2. Create segment → 3. Run segmentation → 
   # 4. Create journey → 5. Deploy → 6. Verify comm_events created
   ```

### Manual Verification / Browser Testing

1. **Segment Rule Builder**: Create a complex 3-level nested rule. Verify JSON output matches expected structure. Verify live preview count is accurate.
2. **Journey Builder**: Build a 5-step journey (Trigger → Delay → SMS → Condition → WhatsApp). Deploy. Verify `journey_steps` rows created correctly.
3. **Borrower Timeline**: Navigate to a portfolio record. Verify chronological display of all events.
4. **Repayment Upload**: Upload a repayment CSV. Verify `outstanding` decreases. Verify re-segmentation moves records to new segments.
5. **Dashboard Home**: Verify all metric cards load real data, segment performance rings animate, heatmap renders.

### Execution Order

| Phase | Scope | Estimated Effort |
|-------|-------|-----------------|
| **Phase 1** | Schema migration, Drizzle rewrite | 1–2 days |
| **Phase 2** | Segments API + segmentation engine | 2–3 days |
| **Phase 3** | Journeys + steps API | 2 days |
| **Phase 4** | Worker rewrite (dispatch, feedback, repayment) | 3 days |
| **Phase 5** | Dashboard UI (all pages + components) | 5–7 days |
| **Phase 6** | Kafka consumers + job handlers | 2 days |

**Total estimated effort: ~17–20 days**

