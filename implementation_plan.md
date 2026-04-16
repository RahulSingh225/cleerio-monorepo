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

---

## Analysis: Stakeholder Document vs Current Schema

### Document 1: Incoming Allocation Checklist

This is a **lender onboarding questionnaire** — portfolio-level metadata about a new client. It contains configuration data, not per-record data.

**Current gap**: Our `tenants` table only stores `name`, `code`, `status`, and a generic `settings` JSONB. The allocation checklist has **25+ structured fields** (book size, secured/unsecured split, products, target ROR, approved channels, contactability %, allocation dates, reporting cadence, etc.) that should be stored and queryable.

### Document 2: Data Required for Effective Collections

This is the **per-borrower data list** — 70 fields that lenders provide in their portfolio CSV. Here's the critical mapping:

| # | Field | Current Storage | Status | Notes |
|---|-------|----------------|--------|-------|
| 1 | Name | `portfolio_records.name` | ✅ Core | |
| 2 | Loan Number | `dynamic_fields` | ⚠️ **Should be core** | Primary identifier for lenders, used in template variables |
| 3 | Amount Pending | `portfolio_records.outstanding` | ✅ Core | |
| 4 | Due Date | `dynamic_fields` | ⚠️ **Should be core** | Critical for timing communications — send reminders 3 days before due date |
| 5 | State | `dynamic_fields` | ⚠️ **Should be core** | Regional compliance, communication timing, language selection |
| 6 | Customer Language | `dynamic_fields` | ⚠️ **Should be core** | Determines which template language variant to use |
| 7 | Mobile | `portfolio_records.mobile` | ✅ Core | |
| 8 | Tenure | `dynamic_fields` | ✅ Dynamic | |
| 9 | EMI | `dynamic_fields` | ⚠️ **Should be core** | Used in every template and segmentation rule |
| 10 | E-NACH Enabled | `dynamic_fields` | ⚠️ **Should be core** | Mandate-based vs manual payment — fundamentally different journey flows |
| 11 | Occupation | `dynamic_fields` | ✅ Dynamic | |
| 12 | Gender | `dynamic_fields` | ✅ Dynamic | |
| 13 | City | `dynamic_fields` | ⚠️ **Should be core** | Regional grouping |
| 14 | Pin Code | `dynamic_fields` | ✅ Dynamic | |
| 15 | CIBIL Score | `dynamic_fields` | ⚠️ **Should be core** | Risk segmentation |
| 16 | CIBIL Range | `dynamic_fields` | ✅ Dynamic | Derived from CIBIL Score |
| 17 | Income | `dynamic_fields` | ✅ Dynamic | |
| 18 | Marital State | `dynamic_fields` | ✅ Dynamic | |
| 19-22 | Reference/Alternate Numbers | `dynamic_fields` | ⚠️ **Critical** | Skip tracing — try alternate numbers when primary fails |
| 23 | Address | `dynamic_fields` | ✅ Dynamic | PII |
| 24 | Age Bucket | `dynamic_fields` | ✅ Dynamic | |
| 25 | Last Repayment Mode | `dynamic_fields` | ✅ Dynamic | UPI/NetBanking/Cash |
| 26 | Product Type | `portfolio_records.product` | ✅ Core | |
| 27 | Stab | `dynamic_fields` | ✅ Dynamic | Internal lender label |
| 28 | Region | `dynamic_fields` | ✅ Dynamic | |
| 29 | Loan Category | `dynamic_fields` | ✅ Dynamic | Sub-type (Express, Flexi) |
| 30 | Payment Link | `dynamic_fields` | ⚠️ **Should be core** | Template variable + click tracking |
| 31 | Delinquency String | `dynamic_fields` | ⚠️ **Strategic** | DPD pattern ("0,1,0,0,01,1") for behavioral segmentation |
| 32 | Reference Relation 1 | `dynamic_fields` | ✅ Dynamic | |
| 33 | POS Category | `dynamic_fields` | ✅ Dynamic | |
| 34 | Delinquency Tag | `dynamic_fields` | ✅ Dynamic | (e.g. "L2M Bounce") |
| 35 | Overdue EMIs | `dynamic_fields` | ⚠️ **Strategic** | Count of missed — affects urgency |
| 36 | Penalty | `dynamic_fields` | ✅ Dynamic | Template variable |
| 37 | Cashback | `dynamic_fields` | ✅ Dynamic | Incentive amount |
| 38 | Half EMI Link | `dynamic_fields` | ⚠️ **Trackable link** | Payment tracking |
| 39 | Employer Name | `portfolio_records.employerId` | ⚠️ Mismatch | We have `employerId` but doc says `employerName` |
| 40 | Foreclosure Link | `dynamic_fields` | ⚠️ **Trackable link** | Payment tracking |
| 41 | Penalty Waiver Link | `dynamic_fields` | ⚠️ **Trackable link** | Payment tracking |
| 42 | Repeat/Fresh | `dynamic_fields` | ✅ Dynamic | |
| 43 | Loan EMI Main | `dynamic_fields` | ✅ Dynamic | Original EMI without penalties |
| 44 | Loan Amount | `dynamic_fields` | ⚠️ **Should be core** | Principal disbursed — used in risk calcs |
| 45 | Age | `dynamic_fields` | ✅ Dynamic | |
| 46 | EMIs Pending | `dynamic_fields` | ✅ Dynamic | |
| 47 | EMIs Paid | `dynamic_fields` | ✅ Dynamic | |
| 48 | POS | `dynamic_fields` | ✅ Dynamic | Principal Outstanding |
| 49 | TOS | `dynamic_fields` | ✅ Dynamic | Total Outstanding |
| 50 | Total Penalties | `dynamic_fields` | ✅ Dynamic | |
| 51 | Last Repayment Amount | `dynamic_fields` | ✅ Dynamic | |
| 52 | Total EMIs Paid Amount | `dynamic_fields` | ✅ Dynamic | |
| 53 | Salary Date | `dynamic_fields` | ⚠️ **Should be core** | Schedule comms around payday |
| 54 | Disbursal Date | `dynamic_fields` | ✅ Dynamic | |
| 55 | Last Repayment Date | `portfolio_records.lastRepaymentAt` | ✅ Core | |
| 56 | First EMI Date | `dynamic_fields` | ✅ Dynamic | |
| 57 | Failed Transaction Date | `dynamic_fields` | ⚠️ **Strategic** | Mandate bounce detection |
| 58 | Principal | `dynamic_fields` | ✅ Dynamic | |
| 59 | Email | `dynamic_fields` | ⚠️ **Should be core** | Omni-channel outreach |
| 60 | Last Interaction Date | System-generated | ✅ System | Maps to our `lastInteractionAt` (Phase 5.1) |
| 61 | Last Disposition | System-generated | ✅ System | Maps to our `lastInteractionType` (Phase 5.1) |
| 62 | Internal Risk Score | `dynamic_fields` | ⚠️ **Strategic** | Lender's own risk rating |
| 63 | Repayment History | `dynamic_fields` | ✅ Dynamic | % on-time |
| 64 | Relationship Tenure | `dynamic_fields` | ✅ Dynamic | |
| 65 | Customer Source | `dynamic_fields` | ✅ Dynamic | Acquisition channel |
| 66 | Device Type | `dynamic_fields` | ⚠️ **Strategic** | Tailor message format |
| 67 | On-Time Pay Rate | `dynamic_fields` | ✅ Dynamic | |
| 68 | Bounce Count | `dynamic_fields` | ⚠️ **Strategic** | Failed auto-debits count |
| 69 | Credit Utilization | `dynamic_fields` | ✅ Dynamic | |
| 70 | Last Repayment Mode | `dynamic_fields` | ✅ Dynamic | |

### Summary of Gaps

| Category | Count | Action Required |
|----------|-------|-----------------|
| **Already core columns** | 7 | No change needed |
| **Should be promoted to core** | 12 | New columns on `portfolio_records` |
| **Strategic (affect journey logic)** | 7 | Field registry enhancement + condition engine |
| **Trackable links** | 4 | Payment link tracking system |
| **System-generated (feedback)** | 2 | Already planned in Phase 5.1 |
| **Fine as dynamic_fields** | 38 | Already works — just need template + condition access |
| **Portfolio-level (allocation checklist)** | 25+ | New `portfolio_configs` table |

---

## Proposed Changes

### Phase 5.0 — Portfolio Data Foundation (NEW — Before Feedback)

This phase ensures the system can properly ingest, store, and leverage all 70 stakeholder data points.

---

#### [MODIFY] [schema.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/libs/drizzle/schema.ts) — `portfolio_records`

**Promote 12 strategic fields to first-class core columns:**

```typescript
// NEW core columns on portfolio_records
loanNumber: varchar('loan_number', { length: 100 }),     // #2 - Primary lender reference
email: varchar('email', { length: 255 }),                 // #59 - Omni-channel outreach
dueDate: date('due_date'),                                // #4 - Next EMI due date
emiAmount: numeric('emi_amount', { precision: 14, scale: 2 }),  // #9 - Fixed instalment amount
language: varchar('language', { length: 20 }),             // #6 - Preferred language for templates
state: varchar('state', { length: 100 }),                  // #5 - Regional compliance + timing
city: varchar('city', { length: 100 }),                   // #13 - Regional grouping
cibilScore: integer('cibil_score'),                       // #15 - Risk segmentation
salaryDate: integer('salary_date'),                       // #53 - Day of month (1-31) for smart scheduling
enachEnabled: boolean('enach_enabled'),                   // #10 - Mandate vs manual payment
alternateNumbers: jsonb('alternate_numbers').default([]),  // #19-22 - Skip tracing array
loanAmount: numeric('loan_amount', { precision: 14, scale: 2 }), // #44 - Principal for risk calcs
```

**Why core columns instead of dynamic_fields?**
1. **Indexed queries**: Segmentation rules like `WHERE cibil_score < 600 AND state = 'Karnataka'` need column-level indexing
2. **Template resolution**: `{{loan_number}}`, `{{emi_amount}}`, `{{due_date}}` are used in virtually every template
3. **Smart scheduling**: `salary_date` and `due_date` determine optimal communication timing
4. **Journey conditions**: `enach_enabled` fundamentally changes the journey flow (mandate bounce handling vs manual reminder)
5. **Skip tracing**: `alternate_numbers` array enables fallback when primary mobile fails

**Also rename**: `employerId` → `employerName` (varchar 255) to match stakeholder data format.

**New indexes:**
```typescript
tenantStateIdx: index('portfolio_records_tenant_state_idx').on(t.tenantId, t.state),
tenantCibilIdx: index('portfolio_records_tenant_cibil_idx').on(t.tenantId, t.cibilScore),
tenantDueDateIdx: index('portfolio_records_tenant_due_date_idx').on(t.tenantId, t.dueDate),
tenantLoanNumberIdx: index('portfolio_records_tenant_loan_number_idx').on(t.tenantId, t.loanNumber),
tenantEmailIdx: index('portfolio_records_tenant_email_idx').on(t.tenantId, t.email),
```

---

#### [MODIFY] [schema.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/libs/drizzle/schema.ts) — `tenant_field_registry`

**Add semantic classification to the field registry:**

```typescript
// NEW columns on tenant_field_registry
isStrategic: boolean('is_strategic').default(false),    // Fields that affect journey logic
semanticRole: varchar('semantic_role', { length: 50 }), // 'loan_id' | 'due_date' | 'emi' | 'language' | 'contact_alt' | 'payment_link' | 'risk_score' | null
```

**Why?** When a lender uploads a CSV with header "Loan Account Number", the system needs to know this maps to the `loan_number` core column. The `semanticRole` tag enables auto-mapping during ingestion and ensures the field is routed to the correct core column.

**Known semantic roles:**

| Semantic Role | Maps To | Purpose |
|--------------|---------|---------|
| `borrower_name` | `portfolio_records.name` | Identity |
| `primary_mobile` | `portfolio_records.mobile` | Primary contact |
| `loan_id` | `portfolio_records.loanNumber` | Lender reference |
| `outstanding` | `portfolio_records.outstanding` | Amount due |
| `dpd` | `portfolio_records.currentDpd` | Days past due |
| `emi` | `portfolio_records.emiAmount` | Instalment amount |
| `due_date` | `portfolio_records.dueDate` | Next EMI date |
| `language` | `portfolio_records.language` | Template language |
| `state` | `portfolio_records.state` | Region |
| `city` | `portfolio_records.city` | Region |
| `cibil_score` | `portfolio_records.cibilScore` | Risk |
| `salary_date` | `portfolio_records.salaryDate` | Scheduling |
| `enach` | `portfolio_records.enachEnabled` | Mandate status |
| `email` | `portfolio_records.email` | Omni-channel |
| `product` | `portfolio_records.product` | Product type |
| `employer` | `portfolio_records.employerName` | Employer |
| `loan_amount` | `portfolio_records.loanAmount` | Principal |
| `alt_number_1` | `portfolio_records.alternateNumbers[0]` | Skip tracing |
| `alt_number_2` | `portfolio_records.alternateNumbers[1]` | Skip tracing |
| `ref_number_1` | `portfolio_records.alternateNumbers[2]` | Skip tracing |
| `ref_number_2` | `portfolio_records.alternateNumbers[3]` | Skip tracing |
| `payment_link` | `dynamic_fields.paymentLink` (+ tracked) | Click tracking |
| `half_emi_link` | `dynamic_fields.halfEmiLink` (+ tracked) | Click tracking |
| `foreclosure_link` | `dynamic_fields.foreclosureLink` (+ tracked) | Click tracking |
| `penalty_waiver_link` | `dynamic_fields.penaltyWaiverLink` (+ tracked) | Click tracking |

---

#### [NEW] `libs/drizzle/schema.ts` — `portfolio_configs` table

**Allocation checklist data stored per portfolio:**

```typescript
export const portfolioConfigs = pgTable('portfolio_configs', {
  id: uuid('id').primaryKey().default(sql`gen_ulid()`),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id),
  
  // From Allocation Checklist
  lenderName: varchar('lender_name', { length: 255 }),
  totalBookSize: numeric('total_book_size', { precision: 14, scale: 2 }),
  securedUnsecuredSplit: varchar('secured_unsecured_split', { length: 20 }),
  primaryProducts: jsonb('primary_products').default([]),      // ['STPL', 'HTPL', 'Business Loan']
  monthlyInflow: numeric('monthly_inflow', { precision: 14, scale: 2 }),
  currentDpdStock: numeric('current_dpd_stock', { precision: 14, scale: 2 }),
  currentEfficiency: numeric('current_efficiency', { precision: 5, scale: 2 }),
  targetEfficiency: numeric('target_efficiency', { precision: 5, scale: 2 }),
  targetRor: numeric('target_ror', { precision: 5, scale: 2 }),
  currentContactability: numeric('current_contactability', { precision: 5, scale: 2 }),
  approvedChannels: jsonb('approved_channels').default([]),     // ['sms', 'whatsapp', 'ivr']
  allocationStartDate: date('allocation_start_date'),
  allocationEndDate: date('allocation_end_date'),
  paidFileFrequency: varchar('paid_file_frequency', { length: 20 }), // 'daily' | 'weekly'
  waiverGrid: jsonb('waiver_grid').default({}),
  currentAcr: numeric('current_acr', { precision: 8, scale: 2 }),
  commercialsModel: varchar('commercials_model', { length: 50 }),
  reportingFrequency: varchar('reporting_frequency', { length: 20 }),
  expectedRegionSplit: jsonb('expected_region_split').default({}), // { south: 50, north: 30, east: 10, west: 10 }
  stakeholderGoals: jsonb('stakeholder_goals').default({}),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

#### [MODIFY] `libs/domain/src/modules/portfolios/portfolios.service.ts`

**Enhance the ingestion pipeline to auto-map semantic roles:**

During CSV upload, when mapping columns to `tenant_field_registry`, the system should:
1. Auto-detect known headers (fuzzy match "Loan Number" → `loanNumber`, "Amount Pending" → `outstanding`, etc.)
2. Route fields with `semanticRole` to the correct core column during record insertion
3. Store all remaining fields in `dynamic_fields` as before

**Header Fuzzy Match Table (built-in):**

| CSV Header Variations | Semantic Role |
|-----------------------|---------------|
| `Name`, `Borrower Name`, `Customer Name`, `Full Name` | `borrower_name` |
| `Loan Number`, `Loan No`, `Account Number`, `Loan Account`, `Loan ID` | `loan_id` |
| `Mobile`, `Phone`, `Contact Number`, `Mobile Number`, `Phone Number` | `primary_mobile` |
| `Amount Pending`, `Outstanding`, `Balance`, `Total Due`, `POS`, `TOS` | `outstanding` |
| `DPD`, `Days Past Due`, `Current DPD` | `dpd` |
| `EMI`, `Instalment`, `EMI Amount`, `Monthly Instalment` | `emi` |
| `Due Date`, `EMI Due Date`, `Next Due Date`, `Payment Due Date` | `due_date` |
| `Language`, `Customer Language`, `Preferred Language` | `language` |
| `State`, `State Of Residence` | `state` |
| `City`, `City Of Residence` | `city` |
| `CIBIL Score`, `Credit Score`, `CIBIL`, `Bureau Score` | `cibil_score` |
| `Salary Date`, `Salary Credit Date`, `Pay Day` | `salary_date` |
| `E-Nach Enabled`, `NACH`, `Auto Debit`, `Mandate`, `eNACH` | `enach` |
| `Email`, `Email ID`, `Email Address` | `email` |
| `Product`, `Product Type`, `Loan Product` | `product` |
| `Employer`, `Employer Name`, `Company`, `Organisation` | `employer` |
| `Loan Amount`, `Disbursed Amount`, `Principal`, `Sanctioned Amount` | `loan_amount` |
| `Payment Link`, `Pay Link`, `UPI Link` | `payment_link` |
| `Alt Number`, `Alternate Number`, `Secondary Mobile` | `alt_number_1` |
| `Reference Number`, `Ref Number`, `Emergency Contact` | `ref_number_1` |

---

#### [MODIFY] `apps/dashboard/app/cases/upload/page.tsx`

**Enhance the field mapping step to show semantic role suggestions:**

When the user maps CSV columns, the UI should:
- Auto-suggest semantic roles based on fuzzy header matching
- Show a badge next to auto-detected fields: "🔗 Auto-mapped to `Loan Number`"
- Allow override if the suggestion is wrong
- Highlight unmapped strategic fields in amber: "⚠️ `Due Date` not mapped — this field enables smart scheduling"

---

### Phase 5.0.1 — Paid File (Daily Repayment) Pipeline

The allocation checklist specifies **"Paid File Frequency: Daily"**. The system needs automated daily repayment ingestion.

---

#### [MODIFY] `libs/domain/src/modules/repayment/repayment.service.ts`

**Enhance to support:**
1. **Scheduled upload**: SFTP/API pull or manual CSV drop
2. **Match by `loanNumber`** (from Doc 2 field #2), not just `userId`
3. **Track repayment source**: Map field #25 "Last Repayment Mode" (UPI, Net Banking, Cash)
4. **Auto re-segmentation**: After daily paid file processing, automatically trigger segmentation run
5. **Outstanding delta**: Track `previousOutstanding` - `currentOutstanding` = daily collection amount

---

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
| `ptpStatus` | `varchar(20)` | `pending_review`, `confirmed`, `honored`, `broken` |
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
| `POST /webhooks/:tenantCode/ivr/status` | POST | **Boilerplate** — stores raw payload only |
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
  providerMsgId: string;
  tenantId: string;
  channel: 'sms' | 'whatsapp' | 'ivr' | 'voice_bot';
  
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed' | 'replied';
  deliveredAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
  
  failureReason?: string;    // 'invalid_number' | 'number_not_on_whatsapp' | 'template_rejected'
  errorCode?: string;
  
  linkClicked?: boolean;
  linkClickedAt?: Date;
  
  replyContent?: string;     // actual reply text from WhatsApp
  
  // IVR specific (boilerplate)
  callDuration?: number;
  callStatus?: string;
  recordingUrl?: string;
  
  // PTP Detection
  ptpDetected?: boolean;
  ptpDate?: string;
  ptpAmount?: number;
  
  rawPayload: any;
}
```

**Preset Vendor Maps (shipped with system):**

- **MSG91 SMS**: `{ "statusField": "status", "msgIdField": "requestId", "deliveredValue": "1", "failedValue": "2" }`
- **WATI WhatsApp**: `{ "statusField": "eventType", "msgIdField": "id", "readValue": "message_read", "deliveredValue": "message_delivered", "replyField": "text" }`

---

#### [NEW] `libs/domain/src/modules/webhooks/feedback-processor.service.ts`

**The brain of the feedback loop** — takes `NormalizedCallback` and:

1. **Updates `delivery_logs`**: Sets `deliveryStatus`, `deliveredAt`, `readAt`, `repliedAt`, `linkClicked`, `linkClickedAt`, `replyContent`, `failureReason`
2. **Updates `comm_events`**: Sets status to reflect latest delivery state
3. **Updates `portfolio_records`**: Rolls up into the summary columns (`lastDeliveryStatus`, `lastContactedChannel`, `contactabilityScore`, `totalCommDelivered`, etc.)
4. **Creates `interaction_events`**: For meaningful interactions (PTP, reply, link_click, dispute)
5. **PTP Detection**: Parses reply content for PTP intent (keyword matching). Detected PTPs are **flagged for manual review** (`ptpStatus: 'pending_review'`). An agent must confirm before it's applied.
6. **Segment Reassignment Trigger**: If a feedback event matches a reassignment rule, queues a `segmentation.run` job

**Contactability Score Calculation (recalculated on every callback):**
```
score = (delivered / attempts * 40) + (read / delivered * 30) + (replied / read * 30)
```

---

### Phase 5.3 — Feedback-Aware Journey Conditions

The condition nodes in the Journey Builder must evaluate **both** portfolio fields (all 70 from Doc 2) and feedback data points.

---

#### [MODIFY] [journey-progression.service.ts](file:///Users/spacempact/Desktop/git/cleerio-monorepo/libs/domain/src/modules/journeys/journey-progression.service.ts)

**Enhance `evaluateStepCondition` to support:**

1. **All core columns**: `name`, `mobile`, `outstanding`, `currentDpd`, `product`, `loanNumber`, `emiAmount`, `dueDate`, `language`, `state`, `city`, `cibilScore`, `salaryDate`, `enachEnabled`, `loanAmount`, `email`
2. **All dynamic fields**: `field1`–`fieldN` (the remaining ~50 CSV fields like tenure, occupation, gender, etc.)
3. **All feedback fields**: `lastDeliveryStatus`, `lastInteractionType`, `ptpDate`, `ptpStatus`, `contactabilityScore`, `riskBucket`, `totalCommAttempts`, `preferredChannel`
4. **Step-relative fields**: `step[N].deliveryStatus`, `step[N].linkClicked`, `step[N].replied`

**New condition operators:**
- `has_ptp` — record has an active PTP date in the future
- `channel_viable` — a specific channel has delivered successfully before
- `no_response_since` — no interaction within N hours of last communication
- `due_date_within` — due date is within N days (for pre-due-date reminders)
- `salary_date_is` — salary date matches (for post-salary outreach)

---

### Phase 5.4 — Segment Reassignment from Feedback

---

#### [NEW] `libs/domain/src/modules/webhooks/reassignment-rules.service.ts`

| Trigger | Condition | Action |
|---------|-----------|--------|
| SMS delivery failed | `failureReason == 'invalid_number'` | Move to "Invalid Contact" segment |
| All channels failed | `contactabilityScore < 10` | Move to "Unreachable" segment |
| PTP confirmed | `ptpStatus == 'confirmed'` | Move to "PTP Active" segment |
| PTP date passed, no repayment | `ptpDate < today && no_repayment` | Move to "PTP Broken" segment |
| WA link clicked, no repayment | `linkClicked && daysSince(linkClickedAt) > 3` | Move to "Aware But Not Paying" |
| Repayment received | `lastRepaymentAt != null` | Move to "Resolved" or reduce severity |
| E-NACH bounce detected | `enachEnabled && failedTransactionDate recent` | Move to "Mandate Failure" segment |

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

The stakeholder data includes **4 different link types**: Payment Link (#30), Half EMI Link (#38), Foreclosure Link (#40), Penalty Waiver Link (#41). All must be trackable.

---

#### [NEW] `libs/domain/src/modules/payment-links/payment-links.service.ts`

1. When a template contains `{{payment_link}}`, `{{half_emi_link}}`, `{{foreclosure_link}}`, or `{{penalty_waiver_link}}`, wrap with a tracked redirect URL: `https://cleer.io/p/{shortCode}`
2. On redirect, log a `link_click` interaction event with the record ID and link type
3. After redirect, poll/webhook for payment completion

#### [NEW] `apps/api/src/payment-links/payment-links.controller.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /p/:shortCode` | GET | Redirect — tracks click, logs interaction, redirects to actual URL |
| `POST /webhooks/:tenantCode/payment/status` | POST | Payment completion callback |

---

### Phase 5.7 — Journey Builder UX Enhancements

---

#### [MODIFY] [journeys/page.tsx](file:///Users/spacempact/Desktop/git/cleerio-monorepo/apps/dashboard/app/journeys/page.tsx)

**Add new palette entries:**

| Node | Icon | Purpose |
|------|------|---------|
| `Send IVR` | Phone | Bot call node (boilerplate — ready for future) |
| `Check Delivery` | MailCheck | Condition checking delivery status of a previous send |
| `Check PTP` | Calendar | Condition checking PTP existence + status |
| `Reassign Segment` | ArrowRightLeft | Moves record to a different segment/journey |
| `Wait For Feedback` | Clock | Waits for delivery callback (6 hour timeout) |

#### [NEW] `apps/dashboard/components/builder/nodes/WaitForFeedbackNode.tsx`

Pauses journey until delivery callback arrives or **6 hour timeout** expires.

#### [NEW] `apps/dashboard/components/builder/nodes/ReassignSegmentNode.tsx`

Moves record to a target segment, optionally triggers new journey admission.

#### [NEW] `apps/dashboard/components/builder/ConditionConfigPanel.tsx`

Rich condition builder with **ALL data points grouped**:

- 📋 **Portfolio Fields** — name, mobile, outstanding, dpd, product, loanNumber, emiAmount, dueDate, enachEnabled, cibilScore, salaryDate, state, city, language, loanAmount, email + all dynamic fields from tenant_field_registry
- 📨 **Delivery Data Points** — lastDeliveryStatus, lastContactedChannel, totalCommDelivered, totalCommRead
- 💬 **Interaction Data Points** — lastInteractionType, ptpDate, ptpStatus, ptpAmount, riskBucket
- 🔗 **Link Data Points** — linkClicked, linkClickedAt, linkType
- 📊 **Score & Preference** — contactabilityScore, preferredChannel
- 💰 **Repayment Data Points** — totalRepaid, lastRepaymentAt
- ⏮️ **Previous Step Outcomes** — step[N].deliveryStatus, step[N].replied, step[N].linkClicked

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

The handler processes normalized callbacks and:
1. Updates `delivery_logs` with callback data
2. Updates `portfolio_records` summary columns
3. Creates `interaction_events` if applicable
4. Evaluates reassignment rules
5. If record is paused at `wait_for_feedback` step, checks if feedback satisfies wait condition and triggers `moveToNextStep`

---

### Phase 5.9 — Record 360° View Enhancement

---

#### [MODIFY] `apps/dashboard/app/cases/[id]/page.tsx`

**Full borrower profile using all data points:**

- **Identity Card**: Name, loan number, mobile, email, state/city, language, product, employer
- **Financial Card**: Outstanding, EMI amount, loan amount, due date, E-NACH status, penalty, cashback
- **Communication Timeline**: All comm events with delivery statuses (✅ Delivered, 👁️ Read, 💬 Replied, ❌ Failed)
- **PTP Section**: Active PTP with status badge (`pending_review` / `confirmed` / `honored` / `broken`), manual review controls
- **Contactability Card**: Score gauge, preferred channel badge, attempts vs delivery ratio
- **Link Activity**: Click timestamps for payment/half-EMI/foreclosure/penalty-waiver links
- **Dynamic Fields**: All remaining CSV fields in a clean key-value grid with display labels from field registry
- **Alternate Contacts**: Reference and alternate numbers for skip tracing

---

### Phase 5.10 — Data Point Registry API

---

#### [NEW] `libs/domain/src/modules/data-points/data-points.service.ts`

Returns all available fields grouped for the condition node, including:
- All 12 new core columns from Phase 5.0
- All dynamic fields from `tenant_field_registry` for the current tenant
- All 16 feedback columns from Phase 5.1
- Previous step outcomes (dynamic based on journey topology)

#### [NEW] `apps/api/src/data-points/data-points.controller.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /v1/data-points` | GET | Returns all available data point groups for the current tenant |

---

## What Stakeholders Provide vs What System Generates

| Source | Data Points | Count |
|--------|-------------|-------|
| **Stakeholder provides (CSV upload)** | All 70 fields from Doc 2 — borrower identity, financial details, loan details, contact info | 70 |
| **Stakeholder provides (Onboarding)** | Allocation checklist — portfolio metadata, targets, channels, reporting cadence | 25+ |
| **Stakeholder provides (Daily)** | Paid file — repayment records, payment dates, amounts, modes | 5-8 per record |
| **System generates (Feedback)** | Delivery statuses, read receipts, contactability score, PTP detection, link clicks | 16+ per record |
| **System generates (Analytics)** | Segment assignments, journey progression, communication timeline, risk bucket | 10+ per record |

**Total data points per borrower record: ~120+** (70 portfolio + 25 feedback + 25 system-generated)

---

## Resolved Decisions

> [!NOTE]
> - **Wait-For-Feedback Timeout**: **6 hours**. After 6 hours with no callback, the condition evaluates with `lastDeliveryStatus = 'no_response'`.
> - **Contactability Score**: Recalculated **on every callback** (simple formula, single row update).
> - **PTP Detection**: Auto-detected PTPs are **flagged for manual review** (`ptpStatus: 'pending_review'`). An agent must confirm before it's applied to the record.
> - **IVR**: **Boilerplate only**. Focus on SMS and WhatsApp channels for now.

---

## Verification Plan

### Automated Tests

1. **Schema Migration**: Verify all new columns exist via `ALTER TABLE IF NOT EXISTS` migration endpoint
2. **Callback Normalizer**: Unit test with MSG91 and WATI sample payloads
3. **Feedback Processor**: Integration test — mock SMS delivery callback → verify `delivery_logs` + `portfolio_records` + `interaction_events` updated
4. **PTP Detection**: Unit test with sample WhatsApp replies containing PTP keywords in English/Hindi
5. **Condition Evaluator**: Unit test with new core fields — `cibilScore < 600 AND enachEnabled == true` should match correctly
6. **Field Auto-Mapper**: Unit test fuzzy matching — "Loan Account Number" → `loan_id`, "Amount Pending" → `outstanding`
7. **Contactability Score**: Unit test formula with sample data

### End-to-End Flow Test

```
1. Upload portfolio CSV with all 70 fields from Doc 2
2. Verify: core fields map to columns, remaining → dynamic_fields
3. Create segment: cibilScore < 600 AND outstanding > 5000 AND enachEnabled == false
4. Run segmentation → verify records assigned
5. Create journey: Trigger → Send SMS → Wait For Feedback (6h) → Condition (delivered?) → Yes: Send WA / No: Try Alternate Number
6. Dispatch SMS → simulate DLR callback → verify progression
7. Simulate WA reply "I will pay on 20th" → verify PTP created with status: 'pending_review'
```

### Execution Order

| Phase | Scope | Est. Effort |
|-------|-------|-------------|
| **5.0** | Portfolio data foundation (schema + auto-mapper + portfolio_configs) | 2–3 days |
| **5.0.1** | Paid file daily pipeline enhancement | 1 day |
| **5.1** | Feedback columns schema migration | 1 day |
| **5.2** | Webhook controller + normalizer + processor | 2–3 days |
| **5.3** | Feedback-aware condition engine | 1–2 days |
| **5.4** | Segment reassignment rules | 1 day |
| **5.5** | IVR boilerplate | 0.5 day |
| **5.6** | Payment link tracking (4 link types) | 1 day |
| **5.7** | Journey Builder UX (new nodes + condition panel) | 2–3 days |
| **5.8** | Worker feedback job handler | 1 day |
| **5.9** | Record 360° view with all data points | 1–2 days |
| **5.10** | Data Point Registry API + UI integration | 1 day |

**Total estimated effort: ~15–20 days**
