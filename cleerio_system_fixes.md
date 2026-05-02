# Cleerio System Fixes & Architectural Updates

This document summarizes all the debugging, architectural upgrades, and bug fixes implemented to resolve issues spanning the Journey Builder, Drizzle Database Schemas, and the Generic Communication Dispatch Engine.

---

## 1. Journey Builder Edit & Save Crashes (500 Error)
**The Problem:** 
Users were unable to modify, save, or deploy existing journeys. Clicking "Save" resulted in a `500 Internal Server Error`.
* **Root Cause:** The frontend saves journeys by performing a "drop and replace" (deleting all old steps and creating new ones). However, if the journey had already been active, `comm_events` and `interaction_events` were actively referencing those `journey_steps`. Postgres enforced a foreign-key constraint violation (`23503`), preventing the deletion and crashing the server.
* **The Fix:** We updated `libs/drizzle/schema.ts` to append `onDelete('set null')` to the `journeyStepId` in both the `comm_events` and `interaction_events` tables. We then generated and pushed a database migration. This allows journey steps to be safely deleted without destroying the historical communication logs.

## 2. Journey Active/Inactive UI Toggle
**The Problem:** 
Users needed a fast provision to activate or deactivate a journey from the UI to prevent segmentation runs from triggering communication events on draft journeys.
* **Backend Update:** We added a new `@Post(':id/deactivate')` route to the `JourneysController`. We also verified that `JourneyProgressionService.admitToJourney` natively respects the `isActive` flag, guaranteeing that Draft journeys are entirely ignored by the segmentation engine.
* **Frontend Update:** We modified `apps/dashboard/app/journeys/page.tsx` to include an interactive toggle switch directly on the journey cards in the list view, enabling instant state changes without needing to load the builder canvas.

---

## 3. Communication Templates: Variable Stripping Bug
**The Problem:** 
When users mapped custom provider variables in the UI (e.g., mapping `var3` to a hardcoded URL), the variables were mysteriously missing from the database, preventing them from being resolved.
* **Root Cause:** The NestJS `ValidationPipe` is globally configured with `whitelist: true`. Because `providerVariables` was defined in `CreateTemplateDto` as a generic array of objects without nested validation rules, the pipeline aggressively stripped out the unvalidated `vendorVar` and `systemVar` keys for security, saving empty arrays to the database (`[ [], [] ]`).
* **The Fix:** We created a structured `ProviderVariableDto` and applied the `@ValidateNested()` decorator inside `CreateTemplateDto`, instructing the backend to validate and safely preserve the mapping data.

## 4. Communication Templates: Dynamic JSON Payload Injection
**The Problem:** 
Even after fixing the validation bug, custom variables like `var3` were still not being dispatched to third-party APIs (like MSG91).
* **Root Cause:** The Channel Configuration (`dispatch_api_template`) acts as a rigid JSON structural blueprint. The MSG91 configuration explicitly defined `"var1"` and `"var2"`, but lacked `"var3"`. Because the system only interpolated existing strings, it completely ignored any dynamically mapped custom variables that weren't hardcoded in the channel blueprint.
* **The Fix:** 
  1. We upgraded `TemplateRendererService` and `GenericDispatcherService` to support a dynamic injection flag.
  2. We manually executed a script to inject `"__TEMPLATE_VARIABLES__": true` into the `recipients[0]` array of the SMS Channel Configuration in the database.
  3. **Result:** Now, whenever `TemplateRendererService` encounters this flag, it dynamically merges all custom `providerVariables` mapped in the specific Template UI directly into the JSON payload alongside the defaults.

## 5. Communication Templates: Static String Evaluation Bug
**The Problem:** 
When users mapped `var1` to a dynamic field like `field4` using the UI dropdown, the third-party API was receiving the literal text `"field4"` instead of the actual data value for borrowers who had missing CSV data.
* **Root Cause:** The UI dropdown was emitting bare words (`field4`) instead of template strings (`{{field4}}`). When the backend attempted to look up `field4` on a borrower's record, the lookup failed if the borrower's CSV row lacked data for that column. Because the lookup failed and it lacked `{{ }}` brackets, the system assumed the user literally wanted to send the static text `"field4"`.
* **The Fix:**
  1. **UI Update:** Modified the Template UI datalist to automatically wrap dropdown selections in template brackets (e.g., emitting `{{field4}}`).
  2. **Dispatcher Parsing Update:** Upgraded `GenericDispatcherService` to intercept any mapping containing `{{` and route it through the template renderer.
  3. **Empty Value Safety Check:** Modified `TemplateRendererService` so that if a requested dynamic variable (`{{field4}}`) is null/missing for a specific borrower, it strips it out and returns a clean empty string `""` rather than preserving the literal bracketed text.
