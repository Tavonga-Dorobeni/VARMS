# Nominee Buyer Hold — CVR Registration Block

**Date:** 2026-04-16
**Scope:** Frontend (CVR registration flow) + coordinated backend contract
**Status:** Approved for implementation planning

## Problem

When the STR engine flags a buyer with a `NOMINEE_PATTERN` alert (≥3 purchases within the 90-day window), the current system still permits CVR users to register any of that buyer's vehicles, including the purchase that triggered the flag. This undermines the intent of FIU review: by the time an analyst sees the alert, the asset has already entered the registry.

## Requirement

A buyer with an active (not cleared, not dismissed) `NOMINEE_PATTERN` alert must not be able to register **the triggering sale or any later purchase by that buyer**. The block lifts when FIU clears or dismisses the alert. Earlier purchases made before the flag fired remain registrable.

**Source:** Clarified 2026-04-16 — interpretation #1 of three offered. Earlier purchases (already in the system before the flag) are not retroactively blocked.

## Non-Goals

- Does not block or annotate vehicles already registered prior to the flag.
- Does not change the existing registered-vehicles list view (`RegisterPage.vue`); holds are per-pending-transaction, not per-buyer-globally.
- Does not introduce a new page or modal.
- Does not add price-threshold logic to the existing nominee detection rule (today the rule counts purchases regardless of price; the spec's "high-value" framing is implemented as any-purchase count — out of scope here).

## Backend Contract (Coordinated, Not In This Scope)

The backend owner must implement these changes for the frontend work to function. Confirming the contract before frontend implementation begins is required.

### `GET /api/v1/registration/search`

When the buyer associated with the searched VIN has an active `NOMINEE_PATTERN` alert AND the latest sale of the vehicle occurred on or after the date of the sale that triggered that alert, the response MUST include a check with:

```json
{
  "key": "NOMINEE_BUYER_HOLD",
  "passed": false,
  "reason": "<string — the human-readable reason from the STR rule, e.g. 'Buyer appears in 3 purchases within 90 days'>",
  "alert_id": 123
}
```

The top-level `eligible` field becomes `false` and `failure_reason` is set (existing behaviour for any failing check).

An alert is **active** when its status is `OPEN` or `UNDER_REVIEW`. It is not active when `CLEARED` or `DISMISSED`.

### `POST /api/v1/registration/approve`

If the hold condition above is still true at the moment of approval (race with the search call), the endpoint MUST reject with an error referencing the same alert. The frontend already surfaces approval errors generically, so no special code is required beyond the error message being informative.

## Frontend Changes

All changes are contained in the CVR route group.

### 1. Type extension

`frontend/src/services/registration.service.ts` — extend `RegistrationCheck`:

```ts
export interface RegistrationCheck {
  key: string
  passed: boolean
  reason: string
  alert_id?: number   // NEW — present only on NOMINEE_BUYER_HOLD check
}
```

No changes to `RegistrationSearchResult`, `searchRegistration`, `approveRegistration`, or `listRegistrations`.

### 2. `TrafficLightResult.vue` — distinct FIU Hold treatment

Detect whether the checks array contains a failing `NOMINEE_BUYER_HOLD` entry. When present:

- Suppress the standard red "Registration Blocked" header.
- Render an amber banner in its place with the following structure:

  ```
  FIU Hold — Registration Blocked (Alert #<alert_id>)

  Reason: <check.reason>

  Registration cannot proceed until the alert is cleared or dismissed by an FIU analyst.
  ```

- The "Reason" line pulls from `check.reason` — it is not hardcoded, so future STR rule variants produce accurate copy without frontend changes.
- The VIN line still appears beneath the banner for context.
- The approve button remains hidden (already driven by `result.eligible`; no extra logic needed).

Visual treatment:
- Amber accent colour (`--color-warning` or equivalent design token), not red.
- Lock or pause icon in the signal circle (replacing the `✗`) to convey "held, not rejected".
- The checklist below still renders, including the hold row (see next change).

If both a `NOMINEE_BUYER_HOLD` check and other failing checks coexist, the FIU Hold banner takes priority in the header, and all failing checks appear in the checklist.

### 3. `ValidationChecklist.vue` — hold row styling

When rendering a check with `key === 'NOMINEE_BUYER_HOLD'`, style the row with the amber/warning palette and a hold icon (lock/pause) rather than the standard red `✗`. All other rows keep existing styling.

### 4. `RegisterVehicleModal.vue` — no structural change

The existing `approveError` slot continues to handle post-search approval races; no additional state required. The `handleApprove` function already captures `err.response.data.error` which will carry the backend's hold message.

## Accessibility

- The amber banner uses an `role="alert"` region so screen readers announce it when the search result renders.
- Icon-only indicators in the checklist also carry `aria-label` text ("On hold pending FIU review") so the status is not conveyed by colour alone.
- Keyboard focus order is unchanged: VIN → National ID → Search → (result region) → Cancel. Approve button is not in the tab order when hidden.

## Acceptance Criteria

- [ ] A CVR search for a VIN where the buyer has an active `NOMINEE_PATTERN` alert and sale_date ≥ triggering sale date shows the amber FIU Hold banner with alert ID and reason.
- [ ] Approve button is not displayed in that state.
- [ ] A CVR search for an earlier purchase by the same buyer (sale_date before the triggering sale) is unaffected — standard eligibility logic applies.
- [ ] When FIU clears or dismisses the alert, a subsequent search for the same VIN proceeds normally (green light if all other checks pass).
- [ ] The Reason line in the banner matches the `check.reason` string verbatim (no hardcoded copy on the frontend).
- [ ] The checklist renders the hold row with amber styling and a hold icon, distinguishable from red `✗` failures.
- [ ] Approval race (hold added between search and approve) surfaces the backend error in the existing `approveError` panel.
- [ ] Screen reader announces the banner on result render; icons carry `aria-label`.

## Out-of-Scope Follow-ups

- Whether to add a price threshold to the nominee detection rule.
- Whether FIU should see a "pending registrations" count per alert (would require joining sales/registrations with alerts in the FIU UI).
- Whether the CVR UI should surface a "blocked by FIU" badge in the registered-vehicles list for future historical visibility.
