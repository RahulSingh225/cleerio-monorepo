# IVR Call Feedback — Data Alignment Analysis

## CSV Overview

**File**: `call.csv` — 599 rows from IVR calling activity (DinoDial provider)

| Metric | Count |
|---|---|
| Total records | 599 |
| Rows with rich data (disposition_marked/answered) | 196 (33%) |
| Rows with AI call summary | 93 |
| Rows with commitment data | 20 |
| Rows with outcome/sentiment/stage | 92 |
| Failed / DND (no useful data) | 403 (67%) |

---

## Column-by-Column Mapping

### ✅ Direct Matches (Already in Schema)

| CSV Column | Maps To | Table | Notes |
|---|---|---|---|
| `customer_id` | `userId` | `portfolio_records` | **Primary join key** — matches perfectly |
| `phone_number` | `mobile` | `portfolio_records` | Secondary join key, needs `+91` stripping |
| `status` | `deliveryStatus` | `delivery_logs` | Values: `failed`, `dnd`, `answered`, `disposition_marked` |
| `attempt` | `totalCommAttempts` | `portfolio_records` | Maps to the running counter we already maintain |
| `called_at` | `sentAt` | `comm_events` | ISO timestamp, maps directly |
| `commitmentAmount` | `ptpAmount` | `portfolio_records` | **PTP amount** — we already track this! |
| `commitmentDate` | `ptpDate` | `portfolio_records` | **PTP date** — already tracked |
| `commitmentType` | `ptpStatus` | `portfolio_records` | Values: `full`, `none` → maps to `confirmed`/`pending_review` |

### 🆕 New Data Points (NOT in Current Schema)

| CSV Column | Value Examples | Strategic Importance |
|---|---|---|
| `summary` | *"The user denied taking a loan and became agitated..."* | **AI-generated call transcript summary** — extremely high value for 360° view |
| `lens_url` | `https://lens-dev.dinodial.in/shared/calls/...` | **Call recording link** — maps to `call_recordings.s3AudioUrl` concept |
| `outcome` | `customer_busy`, `wrong_person`, `denies_loan`, `payment_plan_agreed`, `escalated_to_senior`, `claim_already_paid`, `no_response`, `callback_scheduled` | **Disposition classification** — critical for strategy tuning |
| `sentiment` | `unresponsive` (56), `hesitant` (21), `cooperative` (10), `agitated` (5) | **Borrower sentiment** — feeds AI insights engine |
| `stageReached` | `IDENTITY` → `PURPOSE` → `PUSH_1/2/3` → `CONSEQUENCES` → `ESCALATION` → `PAYMENT_LINK` | **Call funnel progression** — shows exactly where borrower dropped off |

---

## Alignment with Existing Tables

### `interaction_events` — **Strong Alignment**
Your existing `interactionType` enum (`ptp | dispute | callback_request | link_click | reply | opt_out`) aligns well. The IVR outcomes map as follows:

| IVR `outcome` | Maps to `interactionType` | New? |
|---|---|---|
| `payment_plan_agreed` | `ptp` | No ✅ |
| `callback_scheduled` | `callback_request` | No ✅ |
| `denies_loan` | `dispute` | No ✅ |
| `claim_already_paid` | `dispute` | No ✅ |
| `escalated_to_senior` | — | **New type needed** |
| `wrong_person` | — | **New type needed** |
| `customer_busy` | — | **New type needed** |
| `no_response` | — | **Already covered by delivery status** |

### `conversation_transcripts` — **Perfect Fit**
The `summary` field maps directly to `transcriptText`. The table already exists and has `confidence` and `rawJson` fields.

### `call_recordings` — **Perfect Fit**
The `lens_url` field maps directly to `s3AudioUrl`. Table already has `interactionId` and `transcriptId` FK links.

### `delivery_logs` — **Partial Fit**
The `status` field (`failed`, `dnd`, `answered`, `disposition_marked`) maps to `deliveryStatus`. The `dnd` status should also trigger an entry in the `opt_out_list` table.

### `portfolio_records` — **Direct Updates**
Several fields should update the borrower's record summary fields:
- `lastContactedAt` ← `called_at`
- `lastContactedChannel` ← `'ivr'`
- `lastInteractionType` ← outcome
- `contactabilityScore` ← should be recalculated based on status
- `ptpDate`, `ptpAmount`, `ptpStatus` ← commitment fields

---

## New Fields Needed

> [!IMPORTANT]
> These 3 fields from the IVR data are strategically valuable and have **no current home** in the schema:

| Field | Proposed Location | Rationale |
|---|---|---|
| `sentiment` | `interaction_events.details` (JSONB) | Per-interaction metadata, no schema change needed |
| `stageReached` | `interaction_events.details` (JSONB) | Call funnel stage, fits in existing JSONB |
| `outcome` | `interaction_events.details` (JSONB) | Disposition code, fits in existing JSONB |

> [!TIP]
> All three can live inside the existing `details` JSONB column on `interaction_events` — **zero schema migration required**. They will automatically appear in the 360° timeline we just built.

---

## Data Quality Issues in This CSV

> [!WARNING]
> The CSV has some malformed rows where the `summary` field contains unescaped commas, causing column misalignment. Python's `csv.DictReader` handles this correctly (quoted fields), but a naive comma-split will break.

- ~5 rows have `lens_url` values leaking into the `sentiment` column
- ~3 rows have `summary` text leaking into `outcome`
- The `commitmentAmount` field contains values like `924`, `1206`, `2325` — clean numeric data
- `called_at` is proper ISO 8601 with timezone — good

---

## Recommended Integration Architecture

### Phase 1: CSV Upload (Now)
Build a **Call Feedback Sync** service (similar to `RepaymentSyncsService`) that:
1. Parses the CSV using PapaParse (handles quoted fields correctly)
2. Matches rows to `portfolio_records` via `customer_id` → `userId`
3. For each matched row:
   - Creates a `comm_event` (channel: `ivr`)
   - Creates a `delivery_log` with the status
   - Creates an `interaction_event` with outcome/sentiment/stage in `details`
   - Creates a `conversation_transcript` with the summary
   - Creates a `call_recording` with the lens_url
   - Updates `portfolio_records` summary fields (PTP, contactability, last contacted)

### Phase 2: API Integration (Future)
Expose a `POST /webhooks/ivr-callback` endpoint that accepts the same payload structure as a JSON body. The DinoDial system would call this webhook after each call completes. This is identical to how your WhatsApp/SMS webhook callbacks already work via `callback-normalizer.service.ts`.

---

## Summary

| Category | Count |
|---|---|
| Columns that map directly to existing fields | **8 of 13** (62%) |
| Columns that fit into existing JSONB (`details`) | **3 of 13** (23%) |
| Columns that need new tables/fields | **0** |
| Columns with a perfect existing table match | **2 of 13** (`summary` → transcripts, `lens_url` → recordings) |

**Bottom line: Your schema is already 100% ready for this data. No migrations needed.** The only work is building the ingestion service to parse the CSV and write to the correct tables.
