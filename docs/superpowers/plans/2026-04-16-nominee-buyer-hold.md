# Nominee Buyer Hold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface a distinct "FIU Hold" state in the CVR registration flow when the backend reports that a buyer's pending registration is blocked by an active `NOMINEE_PATTERN` alert, so CVR users understand the block is regulatory (only FIU can clear it) rather than a fixable data issue.

**Architecture:** The existing `GET /registration/search` already returns a `checks[]` array with `eligible` + `failure_reason`. The backend will add a new check `NOMINEE_BUYER_HOLD` (with an `alert_id` field) when the buyer has an active alert. Three frontend files change: the shared type, the checklist row rendering, and the traffic-light header. No new routes, stores, or composables.

**Tech Stack:** Vue 3 (`<script setup>`), TypeScript, CSS custom properties (design tokens already include `--color-warning` and `--color-warning-bg`). The project has no unit-test framework installed; verification is via `vue-tsc` type-check and manual browser verification with a response override.

**Scope boundary:** This plan covers frontend work only. The backend contract (adding `NOMINEE_BUYER_HOLD` to the search response and enforcing the hold at `/registration/approve`) is out of scope and must be delivered by the backend owner. Tasks below assume the contract from the spec at `docs/superpowers/specs/2026-04-16-nominee-buyer-hold-design.md`.

**Commits:** The repository is not currently under git. Each task ends with a "Checkpoint" step describing the end state instead of a commit command. If git is initialised later, the checkpoints map 1:1 to commits.

---

## File Structure

Files touched:

- `frontend/src/services/registration.service.ts` — extend `RegistrationCheck` interface with optional `alert_id`. Single responsibility unchanged: API surface for the CVR registration flow.
- `frontend/src/components/cvr/ValidationChecklist.vue` — add label for the new key, add amber "hold" row variant alongside existing pass/fail variants.
- `frontend/src/components/cvr/TrafficLightResult.vue` — detect a failing `NOMINEE_BUYER_HOLD` check; when present, suppress the standard red "Registration Blocked" header and render an amber FIU Hold banner carrying the alert ID and the check's `reason` string. Approve button is already driven by `result.eligible`; no change there.

No new files. No changes to routes, stores, services beyond the interface addition, or `RegisterVehicleModal.vue`.

---

## Task 1: Extend `RegistrationCheck` type

**Files:**
- Modify: `frontend/src/services/registration.service.ts:5-9`

- [ ] **Step 1: Open the file and locate the interface**

Current code at `frontend/src/services/registration.service.ts:5-9`:

```ts
export interface RegistrationCheck {
  key: string
  passed: boolean
  reason: string
}
```

- [ ] **Step 2: Add the optional `alert_id` field**

Replace the block above with:

```ts
export interface RegistrationCheck {
  key: string
  passed: boolean
  reason: string
  /** Present only when `key === 'NOMINEE_BUYER_HOLD'`: the STR alert that is blocking registration. */
  alert_id?: number
}
```

Rationale for the one-line JSDoc: `alert_id` is conditionally populated based on the `key` value. That coupling is not obvious from the type shape, so it earns a comment. No other comments are added.

- [ ] **Step 3: Type-check**

Run from `frontend/`:

```bash
npx vue-tsc --noEmit
```

Expected: exits 0 with no errors. The change is additive and optional, so no downstream callers break.

- [ ] **Step 4: Checkpoint**

End state: `RegistrationCheck` has an optional `alert_id: number` field. No behaviour change yet. No other files modified. `vue-tsc --noEmit` is clean.

---

## Task 2: Add hold row styling to `ValidationChecklist.vue`

**Files:**
- Modify: `frontend/src/components/cvr/ValidationChecklist.vue` (full file — script section, template, styles)

- [ ] **Step 1: Add the label for the new key**

In the `<script setup>` block, locate the `checkLabels` map (currently at line 8):

```ts
const checkLabels: Record<string, string> = {
  import_log: 'ZIMRA Import Log',
  dealer_trail: 'Dealer Trail',
  sale_record: 'Valid Sale Record',
  buyer_match: 'Buyer Match',
}
```

The backend returns the key as the uppercase snake-case `NOMINEE_BUYER_HOLD`, whereas existing keys in the map are lowercase (`import_log`). Match what the backend actually emits. Update the map to:

```ts
const checkLabels: Record<string, string> = {
  import_log: 'ZIMRA Import Log',
  dealer_trail: 'Dealer Trail',
  sale_record: 'Valid Sale Record',
  buyer_match: 'Buyer Match',
  NOMINEE_BUYER_HOLD: 'FIU Hold',
}
```

- [ ] **Step 2: Add a computed that classifies each row as pass / fail / hold**

Immediately after the `checkLabels` declaration, add:

```ts
function rowVariant(check: { key: string; passed: boolean }): 'pass' | 'fail' | 'hold' {
  if (check.passed) return 'pass'
  if (check.key === 'NOMINEE_BUYER_HOLD') return 'hold'
  return 'fail'
}
```

- [ ] **Step 3: Update the template to use the three-way variant**

Replace the existing `<li>` element in the template:

```vue
<li
  v-for="check in checks"
  :key="check.key"
  :class="['checklist__item', check.passed ? 'checklist__item--pass' : 'checklist__item--fail']"
>
  <span class="checklist__icon">{{ check.passed ? '✓' : '✗' }}</span>
```

with:

```vue
<li
  v-for="check in checks"
  :key="check.key"
  :class="['checklist__item', `checklist__item--${rowVariant(check)}`]"
>
  <span
    class="checklist__icon"
    :aria-label="rowVariant(check) === 'hold' ? 'On hold pending FIU review' : rowVariant(check) === 'pass' ? 'Passed' : 'Failed'"
  >{{ rowVariant(check) === 'hold' ? '⏸' : check.passed ? '✓' : '✗' }}</span>
```

The `aria-label` ensures status is conveyed to screen readers, not just via colour/glyph. `⏸` (U+23F8, pause symbol) conveys "held, not rejected" and renders in all modern system fonts.

- [ ] **Step 4: Add the hold row styles**

In the `<style scoped>` block, after `.checklist__item--fail`, add:

```css
.checklist__item--hold {
  background: var(--color-warning-bg);
}

.checklist__item--hold .checklist__icon {
  background: var(--color-warning);
  color: #fff;
}

.checklist__item--hold .checklist__label {
  color: var(--color-warning);
}
```

Keep existing `.checklist__item--pass` and `.checklist__item--fail` blocks untouched.

- [ ] **Step 5: Type-check**

Run from `frontend/`:

```bash
npx vue-tsc --noEmit
```

Expected: exits 0 with no errors.

- [ ] **Step 6: Checkpoint**

End state: `ValidationChecklist.vue` renders three visual states — pass (green), fail (red), hold (amber). An `aria-label` announces each. No other files touched. Type-check clean. Because `TrafficLightResult.vue` still uses the old binary green/red classes, the standalone checklist preview will show the amber row but the parent card still reads as "Registration Blocked" (red) — that is resolved in Task 3.

---

## Task 3: Add FIU Hold banner to `TrafficLightResult.vue`

**Files:**
- Modify: `frontend/src/components/cvr/TrafficLightResult.vue` (full file — script, template, styles)

- [ ] **Step 1: Add a computed for the hold check**

In `<script setup lang="ts">`, after the existing `defineProps` / `defineEmits` calls, add:

```ts
import { computed } from 'vue'

const holdCheck = computed(() =>
  props.result.checks.find(c => c.key === 'NOMINEE_BUYER_HOLD' && !c.passed) ?? null,
)
```

Note: the script must be rewritten to use `const props = defineProps<...>()` so `props` is available inside the computed. Replace the current:

```ts
defineProps<{
  result: RegistrationSearchResult
  approving?: boolean
}>()

defineEmits<{
  approve: []
}>()
```

with:

```ts
const props = defineProps<{
  result: RegistrationSearchResult
  approving?: boolean
}>()

defineEmits<{
  approve: []
}>()

const holdCheck = computed(() =>
  props.result.checks.find(c => c.key === 'NOMINEE_BUYER_HOLD' && !c.passed) ?? null,
)
```

And add the `computed` import at the top of the script. The final `<script setup>` block imports are:

```ts
import { computed } from 'vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import ValidationChecklist from './ValidationChecklist.vue'
import type { RegistrationSearchResult } from '@/services/registration.service'
```

- [ ] **Step 2: Update the root `<VCard>` class binding**

Replace:

```vue
<VCard :class="['traffic-light', result.eligible ? 'traffic-light--green' : 'traffic-light--red']">
```

with:

```vue
<VCard :class="[
  'traffic-light',
  holdCheck ? 'traffic-light--amber' : result.eligible ? 'traffic-light--green' : 'traffic-light--red',
]">
```

The hold state wins over the generic red "blocked" state so a simultaneous hold + other failure still presents as FIU Hold in the header.

- [ ] **Step 3: Replace the header block with hold-aware markup**

Replace the existing header + `traffic-light__blocked` block:

```vue
<div class="traffic-light__header">
  <div class="traffic-light__signal">
    {{ result.eligible ? '✓' : '✗' }}
  </div>
  <div>
    <h3>{{ result.eligible ? 'Eligible for Registration' : 'Registration Blocked' }}</h3>
    <p class="traffic-light__vin">
      VIN: <span class="font-mono">{{ result.vehicle.vin }}</span>
    </p>
  </div>
</div>

<div v-if="!result.eligible && result.failure_reason" class="traffic-light__blocked">
  {{ result.failure_reason }}
</div>
```

with:

```vue
<div class="traffic-light__header">
  <div class="traffic-light__signal" aria-hidden="true">
    {{ holdCheck ? '⏸' : result.eligible ? '✓' : '✗' }}
  </div>
  <div>
    <h3>
      {{ holdCheck
        ? 'FIU Hold — Registration Blocked'
        : result.eligible
          ? 'Eligible for Registration'
          : 'Registration Blocked' }}
    </h3>
    <p class="traffic-light__vin">
      VIN: <span class="font-mono">{{ result.vehicle.vin }}</span>
    </p>
  </div>
</div>

<div v-if="holdCheck" role="alert" class="traffic-light__hold">
  <p class="traffic-light__hold-meta">
    Alert <span class="font-mono">#{{ holdCheck.alert_id ?? '—' }}</span>
  </p>
  <p class="traffic-light__hold-reason">
    <strong>Reason:</strong> {{ holdCheck.reason }}
  </p>
  <p class="traffic-light__hold-note">
    Registration cannot proceed until the alert is cleared or dismissed by an FIU analyst.
  </p>
</div>
<div
  v-else-if="!result.eligible && result.failure_reason"
  class="traffic-light__blocked"
>
  {{ result.failure_reason }}
</div>
```

The `role="alert"` makes the hold banner announced by screen readers when it appears. The `aria-hidden="true"` on the signal glyph prevents duplicate reads (the heading already conveys the state textually).

- [ ] **Step 4: Add amber header styling and hold banner styles**

In `<style scoped>`, after the existing `.traffic-light--red` block, add:

```css
.traffic-light--amber {
  border-color: var(--color-warning);
}

.traffic-light--amber .traffic-light__signal {
  background: var(--color-warning);
  color: #fff;
}

.traffic-light--amber .traffic-light__header h3 {
  color: var(--color-warning);
}

.traffic-light__hold {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-left: 3px solid var(--color-warning);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.traffic-light__hold p {
  margin: 0;
}

.traffic-light__hold p + p {
  margin-top: var(--space-2);
}

.traffic-light__hold-meta {
  font-weight: 600;
}

.traffic-light__hold-note {
  color: var(--color-text-secondary);
}

.font-mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
```

Note: `.font-mono` already exists in other files (e.g. `RegisterVehicleModal.vue`) but not in this component's scoped styles. Adding it locally keeps the VIN/alert-id rendering in a monospaced face inside this card. If Vue's scoped-CSS compilation already exposes it (it does not, since scoped styles don't inherit class selectors from siblings), this local definition is required.

- [ ] **Step 5: Type-check**

Run from `frontend/`:

```bash
npx vue-tsc --noEmit
```

Expected: exits 0 with no errors.

- [ ] **Step 6: Checkpoint**

End state: when a `NOMINEE_BUYER_HOLD` check is present and failing, the card displays amber border + amber signal (⏸), heading reads "FIU Hold — Registration Blocked", and a dedicated `role="alert"` banner shows the alert number, reason text, and the "only FIU can clear" note. The existing red "Registration Blocked" rendering is unchanged for any other eligibility failure. The approve button stays hidden because `result.eligible` is still `false`.

---

## Task 4: Manual visual verification

**Files:** None modified. This task verifies the integrated behaviour.

The project has no unit-test framework, so visual verification is the final gate. The backend `NOMINEE_BUYER_HOLD` check is expected to land separately; until it does, use a temporary response override.

- [ ] **Step 1: Start the dev server**

From `frontend/`:

```bash
npm run dev
```

Expected: Vite prints `http://localhost:5173/` (or next free port). Leave running.

- [ ] **Step 2: Open the CVR register page in the browser**

Navigate to `/cvr/register` and log in as a CVR user. Click "Register Vehicle" to open the modal.

- [ ] **Step 3: Override the search response using Chrome DevTools**

Open DevTools → Network → enable "Local Overrides" (or use the "Override response" right-click on a matched request) and set the response body for `GET /api/v1/registration/search` to:

```json
{
  "eligible": false,
  "failure_reason": "Buyer is subject to an active FIU hold.",
  "checks": [
    { "key": "import_log", "passed": true, "reason": "Import record verified" },
    { "key": "dealer_trail", "passed": true, "reason": "Dealer chain intact" },
    { "key": "sale_record", "passed": true, "reason": "Sale recorded on 2026-03-14" },
    { "key": "buyer_match", "passed": true, "reason": "National ID matches buyer on sale" },
    {
      "key": "NOMINEE_BUYER_HOLD",
      "passed": false,
      "reason": "Buyer appears in 3 purchases within 90 days",
      "alert_id": 142
    }
  ],
  "vehicle": { "id": 1, "vin": "1HGBH41JXMN109186", "status": "SOLD" }
}
```

- [ ] **Step 4: Trigger a search**

Enter any 17-character VIN and any national ID, click "Search".

Expected UI:
- Card border is amber.
- Signal circle is amber with ⏸ glyph.
- Heading reads "FIU Hold — Registration Blocked".
- Amber banner below the header shows, in order:
  - `Alert #142` (monospace)
  - `Reason: Buyer appears in 3 purchases within 90 days`
  - `Registration cannot proceed until the alert is cleared or dismissed by an FIU analyst.`
- Below the banner, the checklist shows the first four rows in green and the fifth row ("FIU Hold") in amber with ⏸.
- No "Approve Registration" button is visible.

- [ ] **Step 5: Verify screen reader announcement**

With VoiceOver (macOS), NVDA (Windows), or Chrome's built-in "Read page" feature, trigger the search again. The hold banner should be announced automatically because of `role="alert"`. The checklist icons should be announced with their `aria-label` ("Passed", "On hold pending FIU review") rather than silently skipped.

- [ ] **Step 6: Verify regression path**

Remove the override. Enter a VIN and national ID for an ineligible case that does NOT include `NOMINEE_BUYER_HOLD` (a real backend response with, e.g., `buyer_match: passed=false`). Expected: card is still red, heading reads "Registration Blocked", `failure_reason` shows below the header, no amber styling. This confirms the hold logic is isolated to the new check and does not affect existing failure paths.

- [ ] **Step 7: Verify the eligible path**

Override the response with `eligible: true` and all checks passing. Expected: green card, "Eligible for Registration" heading, Approve button visible. Confirms the green path is also untouched.

- [ ] **Step 8: Checkpoint**

End state: all three states (green / red / amber) render correctly; screen readers announce the hold banner; approve button hidden in the hold state; type-check is clean.

---

## Self-Review

**Spec coverage:**
- Backend contract — out of plan scope; clearly flagged in the Scope boundary. ✓
- Type extension (`alert_id`) — Task 1. ✓
- `TrafficLightResult.vue` amber banner with alert ID and dynamic `reason` — Task 3. ✓
- `ValidationChecklist.vue` hold row styling with icon — Task 2. ✓
- `RegisterVehicleModal.vue` — spec says no structural change; plan touches no other files. ✓
- Accessibility (`role="alert"`, `aria-label` on icons) — Task 2 step 3, Task 3 step 3. ✓
- Acceptance criteria verified — Task 4 covers all of them (override-based manual tests map to each AC). ✓

**Placeholder scan:** No TBDs, no "implement later", no "add appropriate handling". Every code change is shown in full. ✓

**Type consistency:**
- `RegistrationCheck` — added `alert_id?: number` in Task 1, consumed as `holdCheck.alert_id ?? '—'` in Task 3. ✓
- Backend key `NOMINEE_BUYER_HOLD` — used verbatim in Task 2 label map, Task 2 variant function, Task 3 computed filter. ✓
- CSS class `traffic-light--amber` — defined and used in Task 3 only; no earlier reference. ✓
- Variant values `'pass' | 'fail' | 'hold'` — defined in Task 2 step 2, consumed via template interpolation in Task 2 step 3. ✓
- `checklist__item--hold` — defined in Task 2 step 4, referenced by the template in step 3 via the interpolated class. ✓

No inconsistencies found.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-16-nominee-buyer-hold.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
