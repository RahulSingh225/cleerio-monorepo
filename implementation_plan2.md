# Cleerio v2.1 — Feedback Loop, Data Point Capture & Operational Readiness

> **Goal**: Build the complete feedback infrastructure that captures every data point from every communication channel (SMS delivery reports, WhatsApp read/reply receipts, IVR call recordings & transcripts, payment link clicks), feeds them back into the Journey Progression engine as condition-evaluable fields, and makes both **portfolio data points** and **feedback data points** available inside the Journey Builder for granular configuration. This is the prerequisite for the future agentic AI optimization layer.

---

## What We Have (Completed in Previous Phases)

| Layer | Status | What Exists |
|-------|--------|-------------|
| **Portfolio Ingestion** | ✅ | CSV upload → dynamic field mapping → `portfolio_records.dynamic_fields` |
| **Segmentation Engine** | ✅ | `criteria_jsonb` rule evaluator, `segmentation_runs`, priority-ordered segment assignment |
| **Journey Builder UI** | ✅ | ReactFlow canvas with 8 node types (Trigger, Wait, SMS, WhatsApp, Condition, ManualReview, EndSuccess, EndFailure) |
| **Journey Progression** | ✅ | `JourneyProgressionService` — admission, step scheduling, condition evaluation, next-step advancement |
| **Universal Dispatcher (BYOC)** | ✅ | `GenericDispatcherService` — resolves `dispatchApiTemplate` blueprints, fires HTTP requests to any vendor |
| **Worker Orchestration** | ✅ | `JobQueueService` — cron polling, comm.dispatch handler, wait-step resolution |
| **Schema** | ✅ | All 22 v2 tables including `delivery_logs`, `interaction_events`, `conversation_transcripts`, `call_recordings`, `repayment_records` |

## What's Missing (This Plan)

| Gap | Impact |
|-----|--------|
| **No webhook ingestion** | Delivery statuses (delivered/failed/read) never come back into the system |
| **No feedback-aware conditions** | Journey condition nodes can only check portfolio fields, not "was SMS delivered?" or "was link clicked?" |
| **No PTP tracking** | Promise-to-Pay from WhatsApp replies or IVR conversations isn't captured |
| **No link click tracking** | Payment links and legal notice links have no tracking |
| **No IVR transcript/recording capture** | Bot call outcomes aren't stored |
| **No segment reassignment from feedback** | Records can't move segments based on communication outcomes |
| **No record-level feedback summary** | No aggregated "contactability score" or "last successful channel" on portfolio records |
| **Journey Builder lacks feedback fields** | Condition nodes don't expose delivery/interaction data points for configuration |

---

## User Review Required

> [!IMPORTANT]
> ### Webhook Security
> All webhook endpoints will be tenant-scoped via URL path (`/webhooks/:tenantCode/:channel`). We will validate provider signatures where supported (e.g., MSG91 IP whitelisting, WATI webhook verification). For MVP, we use a shared `WEBHOOK_SECRET` header check.

> [!WARNING]
> ### Schema Migration
> This plan adds **7 new columns** to `portfolio_records` and **5 new columns** to `delivery_logs`. A Drizzle migration is required. Existing data will have the new columns defaulted to `null` / `0`.

> [!IMPORTANT]
> ### Channel Callback Configuration
> Each channel provider (MSG91, WATI, Exotel, etc.) has a different webhook payload format. We will build a **Callback Normalizer** layer that maps vendor-specific JSON shapes into a unified `CallbackEvent` interface. The user must configure the webhook URL in their vendor dashboard.

---

## Proposed Changes

### Phase 5.1 — Schema Enhancements: Record-Level Feedback Columns

These columns turn `portfolio_records` into a **360° borrower profile** that both the Journey Condition Engine and the future AI layer can query.

---

#### [MODIFY] [schema.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/libs/drizzle/schema.ts)

**`portfolio_records` — Add feedback summary columns:**

| Column | Type | Purpose |
|--------|------|---------|
| `lastContactedAt` | `timestamp` | When was the last communication sent to this record? |
| `lastContactedChannel` | `varchar(20)` | Which channel was used? (`sms`, `whatsapp`, `ivr`) |
| `lastDeliveryStatus` | `varchar(30)` | Last known delivery status (`delivered`, `failed`, `read`, `replied`) |
| `lastInteractionType` | `varchar(50)` | Last feedback type (`ptp`, `dispute`, `link_click`, `reply`, `no_response`) |
| `lastInteractionAt` | `timestamp` | When did the last interaction happen? |
| `ptpDate` | `date` | Promise-to-Pay date (from IVR/WhatsApp/manual) |
| `ptpAmount` | `numeric(14,2)` | PTP amount (borrower's committed payment amount) |
| `contactabilityScore` | `integer` | 0–100 score based on delivery success rate across channels |
| `preferredChannel` | `varchar(20)` | Auto-detected best channel based on delivery/read history |
| `totalCommAttempts` | `integer` | Total communication attempts across all channels |
| `totalCommDelivered` | `integer` | Total successfully delivered communications |
| `totalCommRead` | `integer` | Total read/opened communications |
| `totalCommReplied` | `integer` | Total replies received |
| `riskBucket` | `varchar(20)` | `low_risk`, `medium_risk`, `high_risk` (from IVR analysis or AI) |
| `feedbackSummary` | `jsonb` | Flexible bag for any additional feedback data points |

**`delivery_logs` — Enhance for granular tracking:**

| Column | Type | Purpose |
|--------|------|---------|
| `linkClicked` | `boolean` | Did the recipient click a link in the message? |
| `linkClickedAt` | `timestamp` | When was the link clicked? |
| `repliedAt` | `timestamp` | When did the recipient reply? |
| `replyContent` | `text` | Content of the reply (WhatsApp) |
| `failureReason` | `varchar(100)` | Human-readable failure reason (`invalid_number`, `number_not_on_whatsapp`, `template_rejected`, etc.) |

**`channel_configs` — Add callback configuration:**

| Column | Type | Purpose |
|--------|------|---------|
| `callbackUrl` | `text` | The webhook URL that should be registered with the vendor |
| `callbackSecret` | `varchar(255)` | Shared secret for webhook verification |
| `callbackPayloadMap` | `jsonb` | Mapping from vendor payload fields to our normalized fields |

---

### Phase 5.2 — Webhook Ingestion Layer (API)

This is the **ears** of the system — every vendor callback flows through here.

---

#### [NEW] `apps/api/src/webhooks/webhooks.controller.ts`

Public (no auth) webhook receiver endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /webhooks/:tenantCode/sms/delivery` | POST | SMS delivery reports (delivered, failed, link_clicked) |
| `POST /webhooks/:tenantCode/sms/reply` | POST | SMS reply/response (rare but some providers support) |
| `POST /webhooks/:tenantCode/whatsapp/delivery` | POST | WhatsApp delivery status (sent, delivered, read, failed) |
| `POST /webhooks/:tenantCode/whatsapp/reply` | POST | WhatsApp incoming message (reply text, PTP selection, etc.) |
| `POST /webhooks/:tenantCode/ivr/status` | POST | IVR call status (answered, not_answered, busy, failed) |
| `POST /webhooks/:tenantCode/ivr/recording` | POST | IVR call recording URL + duration |
| `POST /webhooks/:tenantCode/ivr/transcript` | POST | IVR call transcript (from provider STT or our own) |
| `POST /webhooks/:tenantCode/payment/status` | POST | Payment link status (clicked, completed, abandoned) |

Each endpoint:
1. Validates the tenant code exists
2. Validates webhook secret header (`X-Webhook-Secret`)
3. Stores raw payload in `delivery_logs.callback_payload` 
4. Passes to `CallbackNormalizerService` → `FeedbackProcessorService`

---

#### [NEW] `apps/api/src/webhooks/webhooks.module.ts`

NestJS module registering the controller and importing domain services.

---

#### [NEW] `libs/domain/src/modules/webhooks/callback-normalizer.service.ts`

**The universal translator** — converts vendor-specific payloads into a standard `NormalizedCallback` shape:

```typescript
interface NormalizedCallback {
  // Identity
  providerMsgId: string;         // maps to delivery_logs.provider_msg_id
  tenantId: string;
  channel: 'sms' | 'whatsapp' | 'ivr' | 'voice_bot';
  
  // Delivery Status
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed' | 'replied';
  deliveredAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
  
  // Failure Details
  failureReason?: string;        // 'invalid_number' | 'number_not_on_whatsapp' | 'template_rejected' | etc.
  errorCode?: string;
  
  // Link Tracking
  linkClicked?: boolean;
  linkClickedAt?: Date;
  linkUrl?: string;
  
  // Reply/Response Content
  replyContent?: string;         // actual reply text from WhatsApp
  
  // IVR Specific
  callDuration?: number;         // seconds
  callStatus?: string;           // 'answered' | 'not_answered' | 'busy'
  recordingUrl?: string;
  transcriptText?: string;
  
  // PTP Detection (from reply parsing or IVR)
  ptpDetected?: boolean;
  ptpDate?: string;              // ISO date
  ptpAmount?: number;
  
  // Raw
  rawPayload: any;
}
```

The normalizer uses `channel_configs.callbackPayloadMap` to map vendor fields. For known providers (MSG91, WATI, Exotel), we ship preset maps. For unknown providers, the user configures the mapping.

**Preset Maps (shipped with system):**

- **MSG91 SMS**: `{ "statusField": "status", "msgIdField": "requestId", "deliveredValue": "1", "failedValue": "2" }`
- **WATI WhatsApp**: `{ "statusField": "eventType", "msgIdField": "id", "readValue": "message_read", "deliveredValue": "message_delivered", "replyField": "text" }`
- **Exotel IVR**: `{ "statusField": "Status", "durationField": "Duration", "recordingField": "RecordingUrl", "callSidField": "CallSid" }`

---

#### [NEW] `libs/domain/src/modules/webhooks/feedback-processor.service.ts`

**The brain of the feedback loop** — takes `NormalizedCallback` and:

1. **Updates `delivery_logs`**: Sets `deliveryStatus`, `deliveredAt`, `readAt`, `repliedAt`, `linkClicked`, `linkClickedAt`, `replyContent`, `failureReason`
2. **Updates `comm_events`**: Sets status to reflect latest delivery state
3. **Updates `portfolio_records`**: Rolls up into the summary columns (`lastDeliveryStatus`, `lastContactedChannel`, `contactabilityScore`, `totalCommDelivered`, etc.)
4. **Creates `interaction_events`**: For meaningful interactions (PTP, reply, link_click, dispute)
5. **Handles IVR data**: Creates `call_recordings` and `conversation_transcripts` entries
6. **PTP Detection**: Parses reply content for PTP intent (regex + keyword matching for MVP, AI for later)
7. **Segment Reassignment Trigger**: If a feedback event matches a reassignment rule, queues a `segmentation.run` job

**PTP Detection Rules (MVP):**
- WhatsApp reply containing keywords: "pay", "will pay", "promise", "haan", "okay", "agreed" + a date pattern
- IVR transcript containing: "promise to pay", "I will pay", "payment on [date]"
- Explicit PTP button selection (if template has interactive buttons)

**Contactability Score Calculation:**
```
score = (delivered / attempts * 40) + (read / delivered * 30) + (replied / read * 30)
```
Recalculated on every delivery callback.

---

### Phase 5.3 — Feedback-Aware Journey Conditions

The condition nodes in the Journey Builder must evaluate **both** portfolio fields and feedback data points.

---

#### [MODIFY] [journey-progression.service.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/libs/domain/src/modules/journeys/journey-progression.service.ts)

**Enhance `evaluateStepCondition` to support feedback fields:**

The condition evaluator currently only checks `record[field]` and `record.dynamicFields[field]`. We need to expand the field resolution to include:

1. **Portfolio fields**: `name`, `mobile`, `outstanding`, `currentDpd`, `product`, etc.
2. **Dynamic fields**: `field1`, `field2`, ..., `fieldN` from CSV upload
3. **Feedback fields (NEW)**: `lastDeliveryStatus`, `lastInteractionType`, `ptpDate`, `contactabilityScore`, `riskBucket`, `totalCommAttempts`, `preferredChannel`
4. **Step-relative fields (NEW)**: Check the delivery status of a *specific previous step* in the current journey:
   - `step[N].deliveryStatus` — was step N's communication delivered?
   - `step[N].linkClicked` — was the link in step N clicked?
   - `step[N].replied` — did the borrower reply to step N?

**New condition operators:**
- `has_ptp` — record has an active PTP date in the future
- `channel_viable` — a specific channel has delivered successfully to this record before
- `no_response_since` — no interaction within N hours of last communication
- `link_not_clicked` — link was not clicked within N hours

#### [MODIFY] [ConditionCheckNode.tsx](file:///Users/spacempact/Desktop/git/cleerio-monorepo/apps/dashboard/components/builder/nodes/ConditionCheckNode.tsx)

**Enhance the UI to expose feedback fields:**

Currently just a text label input. Replace with a proper condition builder:

- **Field selector dropdown** grouped into:
  - 📋 Portfolio Fields (name, mobile, outstanding, dpd, product, dynamic fields)
  - 📨 Delivery Fields (lastDeliveryStatus, lastContactedChannel, totalCommDelivered)
  - 💬 Interaction Fields (lastInteractionType, ptpDate, ptpAmount, riskBucket)
  - 🔗 Link Fields (linkClicked, linkClickedAt)
  - 📊 Score Fields (contactabilityScore, preferredChannel)
  - ⏮️ Previous Step Fields (step[N].deliveryStatus, step[N].replied, step[N].linkClicked)
- **Operator selector** (context-aware based on field type)
- **Value input** (smart: dropdowns for enum fields, date pickers for dates, number inputs for scores)

---

### Phase 5.4 — Segment Reassignment from Feedback

Enable records to automatically move between segments based on communication outcomes.

---

#### [NEW] `libs/domain/src/modules/webhooks/reassignment-rules.service.ts`

**Configurable rules that trigger segment moves based on feedback:**

Example rules (stored per tenant in `segments.criteriaJsonb` or a new `reassignment_rules` table):

| Trigger | Condition | Action |
|---------|-----------|--------|
| SMS delivery failed | `failureReason == 'invalid_number'` | Move to "Invalid Contact" segment |
| WhatsApp link clicked but no repayment | `linkClicked == true && daysSince(linkClickedAt) > 3 && no_repayment` | Move to "Aware But Not Paying" segment |
| PTP detected | `ptpDetected == true` | Move to "PTP Active" segment |
| PTP date passed, no repayment | `ptpDate < today && no_repayment` | Move to "PTP Broken" segment (aggressive journey) |
| IVR: high risk transcript | `riskBucket == 'high_risk'` | Move to "Legal Escalation" segment |
| All channels failed | `contactabilityScore < 10` | Move to "Unreachable" segment |
| Repayment received | `lastRepaymentAt != null` | Move to "Resolved" or reduce segment severity |

These rules are evaluated by `FeedbackProcessorService` after every callback update.

---

### Phase 5.5 — IVR Boilerplate (Future-Ready)

> [!NOTE]
> IVR is **boilerplate only** for now. We focus on SMS and WhatsApp for testing and experimentation. The schema tables (`call_recordings`, `conversation_transcripts`) already exist. We just stub the webhook endpoint and normalizer so it's ready when an IVR provider is configured.

---

#### Boilerplate scope:
- Webhook endpoint `/webhooks/:tenantCode/ivr/status` accepts POST but only stores raw payload in `delivery_logs.callback_payload`
- No transcript parsing, no risk scoring, no recording download
- Can be activated later by implementing the full `IvrFeedbackHandler`

---

### Phase 5.6 — Payment Link Tracking

---

#### [NEW] `libs/domain/src/modules/payment-links/payment-links.service.ts`

**Short link generation and click tracking:**

1. When a template contains `{{payment_link}}`, generate a tracked short URL: `https://cleer.io/p/{shortCode}`
2. The short URL redirects to the actual payment gateway URL
3. On redirect, log a `link_click` interaction event with the record ID
4. After redirect, poll/webhook for payment completion

#### [NEW] `apps/api/src/payment-links/payment-links.controller.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /p/:shortCode` | GET | Redirect endpoint — tracks click, redirects to payment URL |
| `POST /webhooks/:tenantCode/payment/status` | POST | Payment completion callback |

---

### Phase 5.7 — Journey Builder UX Enhancements

Make the condition node and journey flow much more powerful.

---

#### [MODIFY] [journeys/page.tsx](file:///Users/spacempact/Desktop/git/cleerio-monorepo/apps/dashboard/app/journeys/page.tsx)

**Add new palette entries:**

| Node | Icon | Purpose |
|------|------|---------|
| `Send IVR` | Phone | Bot call node with recording/transcript capture |
| `Check Delivery` | MailCheck | Condition specifically checking delivery status of a previous send node |
| `Check PTP` | Calendar | Condition checking if PTP exists and whether it's been honored |
| `Reassign Segment` | ArrowRightLeft | Action node that moves the record to a different segment/journey |
| `Wait For Feedback` | Clock | Like Wait but specifically waits until a delivery callback arrives rather than a fixed time |

#### [NEW] `apps/dashboard/components/builder/nodes/WaitForFeedbackNode.tsx`

A new node type that pauses the journey until:
- A delivery status callback arrives for the previous send step, OR
- A timeout period expires (configurable fallback)

This enables patterns like: **Send SMS → Wait For Delivery Report → If Delivered, Send WhatsApp → If Not Delivered, Try IVR**

#### [NEW] `apps/dashboard/components/builder/nodes/ReassignSegmentNode.tsx`

An action node that:
- Moves the record to a selected target segment
- Optionally triggers admission to the target segment's active journey
- Ends the current journey for this record

#### [NEW] `apps/dashboard/components/builder/ConditionConfigPanel.tsx`

A rich slide-out panel for configuring condition nodes:
- **Grouped field selector** (Portfolio / Delivery / Interaction / Score / Previous Step)
- **Operator selector** (auto-filtered by field type)
- **Value input** (smart — enum dropdowns, date pickers, number sliders)
- **AND/OR toggle** for multi-condition rules
- **Preview** showing human-readable condition text

---

### Phase 5.8 — Worker: Feedback Job Handler

---

#### [MODIFY] [job-queue.service.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/apps/worker/src/job-queue/job-queue.service.ts)

**Add new job type `feedback.process`:**

```typescript
case 'feedback.process':
  await this.handleFeedbackProcess(job.payload);
  break;
```

The handler calls `FeedbackProcessorService.process(normalizedCallback)` which:
1. Updates `delivery_logs` with callback data
2. Updates `portfolio_records` summary columns
3. Creates `interaction_events` if applicable
4. Evaluates reassignment rules
5. If a record is currently paused at a `wait_for_feedback` step, checks if the feedback satisfies the wait condition and triggers `moveToNextStep`

#### [MODIFY] [job-queue.module.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/apps/worker/src/job-queue/job-queue.module.ts)

Import `WebhooksModule` (new) which exports `FeedbackProcessorService` and `CallbackNormalizerService`.

---

### Phase 5.9 — Record 360° View Enhancement

---

#### [MODIFY] `apps/dashboard/app/cases/[id]/page.tsx`

**Add feedback data to Borrower Detail page:**

- **Communication Timeline**: Show delivery statuses inline (✅ Delivered, 👁️ Read, 💬 Replied, ❌ Failed)
- **PTP Section**: Display active PTP date/amount with countdown. Show PTP history (honored/broken).
- **Contactability Card**: Visual gauge showing contactability score, preferred channel badge, attempt vs delivery ratio
- **Call Recordings**: Embedded audio player for IVR recordings with transcript accordion
- **Link Activity**: Payment link click timestamps, payment completion status

---

### Phase 5.10 — Data Point Registry for Journey Builder

Make ALL available data points discoverable in the Journey Builder UI.

---

#### [NEW] `libs/domain/src/modules/data-points/data-points.service.ts`

A registry service that returns all available fields a condition node can reference:

```typescript
async getAvailableDataPoints(tenantId: string): Promise<DataPointGroup[]> {
  return [
    {
      group: 'Portfolio Fields',
      icon: 'clipboard',
      fields: [
        { key: 'name', label: 'Borrower Name', type: 'string' },
        { key: 'mobile', label: 'Mobile Number', type: 'string' },
        { key: 'outstanding', label: 'Outstanding Amount', type: 'number' },
        { key: 'currentDpd', label: 'Current DPD', type: 'number' },
        { key: 'product', label: 'Product', type: 'string' },
        // ... + all tenant_field_registry entries as dynamic fields
      ]
    },
    {
      group: 'Delivery Data Points',
      icon: 'mail-check',
      fields: [
        { key: 'lastDeliveryStatus', label: 'Last Delivery Status', type: 'enum', values: ['sent', 'delivered', 'read', 'failed', 'replied'] },
        { key: 'lastContactedChannel', label: 'Last Channel Used', type: 'enum', values: ['sms', 'whatsapp', 'ivr', 'voice_bot'] },
        { key: 'lastContactedAt', label: 'Last Contacted At', type: 'datetime' },
        { key: 'totalCommAttempts', label: 'Total Attempts', type: 'number' },
        { key: 'totalCommDelivered', label: 'Total Delivered', type: 'number' },
        { key: 'totalCommRead', label: 'Total Read', type: 'number' },
        { key: 'totalCommReplied', label: 'Total Replied', type: 'number' },
      ]
    },
    {
      group: 'Interaction Data Points',
      icon: 'message-circle',
      fields: [
        { key: 'lastInteractionType', label: 'Last Interaction', type: 'enum', values: ['ptp', 'dispute', 'link_click', 'reply', 'callback_request', 'opt_out', 'no_response'] },
        { key: 'lastInteractionAt', label: 'Last Interaction At', type: 'datetime' },
        { key: 'ptpDate', label: 'PTP Date', type: 'date' },
        { key: 'ptpAmount', label: 'PTP Amount', type: 'number' },
        { key: 'riskBucket', label: 'Risk Bucket', type: 'enum', values: ['low_risk', 'medium_risk', 'high_risk'] },
      ]
    },
    {
      group: 'Score & Preference',
      icon: 'bar-chart',
      fields: [
        { key: 'contactabilityScore', label: 'Contactability Score', type: 'number', min: 0, max: 100 },
        { key: 'preferredChannel', label: 'Preferred Channel', type: 'enum', values: ['sms', 'whatsapp', 'ivr'] },
      ]
    },
    {
      group: 'Repayment Data Points',
      icon: 'banknote',
      fields: [
        { key: 'totalRepaid', label: 'Total Repaid', type: 'number' },
        { key: 'lastRepaymentAt', label: 'Last Repayment At', type: 'datetime' },
      ]
    },
    {
      group: 'Previous Step Outcomes',
      icon: 'git-branch',
      fields: [
        // dynamically populated based on the journey's step topology
        { key: 'step[N].deliveryStatus', label: 'Step N Delivery Status', type: 'enum', dynamic: true },
        { key: 'step[N].linkClicked', label: 'Step N Link Clicked', type: 'boolean', dynamic: true },
        { key: 'step[N].replied', label: 'Step N Replied', type: 'boolean', dynamic: true },
      ]
    }
  ];
}
```

#### [NEW] `apps/api/src/data-points/data-points.controller.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /v1/data-points` | GET | Returns all available data point groups for the current tenant |

This endpoint is consumed by the Journey Builder's Condition Node config panel.

---

## Data Flow Diagrams

### Complete Feedback Loop

```
Portfolio Upload → Segmentation → Journey Admission → Step Execution
                                                          │
                                                          ▼
                                               ┌─────────────────┐
                                               │ Generic Dispatch │
                                               │   (BYOC HTTP)   │
                                               └────────┬────────┘
                                                        │
                                          ┌─────────────┼──────────────┐
                                          ▼             ▼              ▼
                                    SMS Provider   WA Provider    IVR Provider
                                          │             │              │
                                          ▼             ▼              ▼
                                    ┌─────────┐  ┌──────────┐  ┌──────────┐
                                    │Delivery │  │Delivery  │  │Call      │
                                    │Report   │  │+ Read    │  │Status + │
                                    │Webhook  │  │+ Reply   │  │Recording│
                                    │         │  │Webhook   │  │+ Trans. │
                                    └────┬────┘  └────┬─────┘  └────┬─────┘
                                         │            │             │
                                         ▼            ▼             ▼
                                    ┌──────────────────────────────────┐
                                    │    Webhook Controller            │
                                    │    /webhooks/:tenant/:channel    │
                                    └──────────────┬───────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   Callback Normalizer Service    │
                                    │   (Vendor → NormalizedCallback)  │
                                    └──────────────┬───────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   Feedback Processor Service     │
                                    │                                  │
                                    │ 1. Update delivery_logs          │
                                    │ 2. Update portfolio_records      │
                                    │    (summary columns)             │
                                    │ 3. Create interaction_events     │
                                    │ 4. PTP Detection                 │
                                    │ 5. IVR → call_recordings +      │
                                    │    conversation_transcripts      │
                                    │ 6. Contactability Score Recalc   │
                                    │ 7. Evaluate Reassignment Rules   │
                                    │ 8. Resume paused journeys        │
                                    └──────────────────────────────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                             Segment Move    Journey Resume   PTP Record
                             (if rules       (if waiting      Created
                              match)          for feedback)
```

### Channel-Specific Data Points Captured

| Channel | Data Point | Source | Storage |
|---------|-----------|--------|---------|
| **SMS** | Delivery status (delivered/failed) | DLR webhook | `delivery_logs.deliveryStatus` → `portfolio_records.lastDeliveryStatus` |
| **SMS** | Failure reason (invalid number, DND, etc.) | DLR webhook | `delivery_logs.failureReason` |
| **SMS** | Link clicked | Redirect tracker | `delivery_logs.linkClicked` → `interaction_events(link_click)` |
| **SMS** | Link clicked timestamp | Redirect tracker | `delivery_logs.linkClickedAt` |
| **WhatsApp** | Delivery status (sent/delivered/read/failed) | Status webhook | `delivery_logs.deliveryStatus` |
| **WhatsApp** | Message read timestamp | Status webhook | `delivery_logs.readAt` |
| **WhatsApp** | Reply text content | Incoming webhook | `delivery_logs.replyContent` → `interaction_events(reply)` |
| **WhatsApp** | PTP from reply | Reply parsing | `portfolio_records.ptpDate/ptpAmount` → `interaction_events(ptp)` |
| **WhatsApp** | Button selection (PTP confirm, dispute, etc.) | Incoming webhook | `interaction_events` with details |
| **WhatsApp** | Failure reason (not on WA, template rejected) | Status webhook | `delivery_logs.failureReason` |
| **IVR** | Call status (answered/not answered/busy) | Status webhook | `interaction_events(call_status)` |
| **IVR** | Call duration | Status webhook | `interaction_events.details.duration` |
| **IVR** | Recording URL | Recording webhook | `call_recordings.s3AudioUrl` |
| **IVR** | Transcript text | Transcript webhook | `conversation_transcripts.transcriptText` |
| **IVR** | Risk classification from transcript | Keyword analysis | `portfolio_records.riskBucket` |
| **IVR** | PTP from conversation | Transcript parsing | `portfolio_records.ptpDate` → `interaction_events(ptp)` |
| **Payment** | Link clicked | Redirect tracker | `interaction_events(link_click)` |
| **Payment** | Payment completed | Payment webhook | `repayment_records` → `portfolio_records.outstanding` update |
| **Payment** | Payment abandoned | Timeout check | `interaction_events(payment_abandoned)` |

---

## Open Questions

> [!NOTE]
> ### Resolved Decisions
> - **Wait-For-Feedback Timeout**: **6 hours**. After 6 hours with no callback, the condition evaluates with `lastDeliveryStatus = 'no_response'`.
> - **Contactability Score**: Recalculated **on every callback** (simple formula, single row update).
> - **PTP Detection**: Auto-detected PTPs are **flagged for manual review** (`ptpStatus: 'pending_review'`). An agent must confirm before it's applied to the record.
> - **IVR**: **Boilerplate only**. Focus on SMS and WhatsApp channels for now.

---

## Verification Plan

### Automated Tests

1. **Callback Normalizer**: Unit test with sample payloads from MSG91, WATI, and Exotel to verify correct normalization
2. **Feedback Processor**: Integration test — send a mock SMS delivery callback → verify `delivery_logs` updated, `portfolio_records.lastDeliveryStatus` updated, `totalCommDelivered` incremented
3. **PTP Detection**: Unit test with sample WhatsApp replies containing PTP intent in English and Hindi
4. **Condition Evaluator**: Unit test with feedback fields — `lastDeliveryStatus == 'failed'` should return true for a record that received a failed DLR
5. **Contactability Score**: Unit test verifying score formula with sample data

### End-to-End Flow Test

```
1. Configure SMS channel with webhook URL pointing to /webhooks/:tenantCode/sms/delivery
2. Create a Journey: Trigger → Send SMS → Wait For Feedback → Condition (delivered?) → Yes: Send WhatsApp / No: Send IVR
3. Admit a record, dispatch the SMS
4. Simulate a delivery webhook callback with status=delivered
5. Verify: delivery_logs updated, portfolio_records.lastDeliveryStatus = 'delivered', journey progresses to WhatsApp step
6. Simulate a failed delivery callback for a different record
7. Verify: journey progresses to IVR step instead
```

### Manual Verification

1. **Webhook.site**: Register a test webhook URL in channel config, dispatch a communication, verify the outbound request arrives
2. **Simulated Callback**: Use cURL to POST a mock delivery report to `/webhooks/:tenantCode/sms/delivery`, verify the entire feedback pipeline executes
3. **Journey Builder UI**: Open condition node config, verify all data point groups appear in the field selector dropdown
4. **Record 360°**: Navigate to a borrower after feedback processing, verify communication timeline shows delivery statuses

### Execution Order

| Phase | Scope | Est. Effort |
|-------|-------|-------------|
| **5.1** | Schema enhancements (migration) | 1 day |
| **5.2** | Webhook controller + normalizer + processor | 2–3 days |
| **5.3** | Feedback-aware condition engine | 1–2 days |
| **5.4** | Segment reassignment rules | 1 day |
| **5.5** | IVR deep integration (recording/transcript) | 1–2 days |
| **5.6** | Payment link tracking | 1 day |
| **5.7** | Journey Builder UX (new nodes + condition panel) | 2–3 days |
| **5.8** | Worker feedback job handler | 1 day |
| **5.9** | Record 360° view enhancement | 1–2 days |
| **5.10** | Data Point Registry API + UI integration | 1 day |

**Total estimated effort: ~13–18 days**
