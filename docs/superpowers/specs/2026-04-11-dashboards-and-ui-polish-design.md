# Role Dashboards & UI Polish — Design Spec

**Date:** 2026-04-11
**Scope:** Frontend only — Vue 3 SPA in `frontend/`
**Status:** Approved

---

## 1. Overview

VARMS currently has a dashboard only for the FIU_ANALYST role. All other roles land on list or form pages. This spec defines lightweight dashboard homepages for the remaining 4 roles (ADMIN, ZIMRA_OFFICER, DEALER, CVR_OFFICER) and a systemic UI polish pass that improves all shared components so current and future pages inherit the improvements.

### Goals
- Every role gets a dashboard landing page showing stats relevant to their job
- Dashboards are launchpads, not replacements for existing pages
- UI polish is systemic — changes to shared components, tokens, and utilities, not per-page overrides
- New shared `VBadge` component replaces all duplicated inline badge styles

### Non-Goals
- No changes to the existing FIU dashboard
- No new backend endpoints (they already exist)
- No charts for roles other than FIU (per DESIGN.md role-specific UX guidance)

---

## 2. Backend Endpoints (Already Exist)

| Endpoint | Role | Response Shape |
|---|---|---|
| `GET /admin/dashboard-stats` | ADMIN | `{total_users, total_dealers, active_dealers, suspended_dealers, total_vehicles, total_sales, recent_audit_count}` |
| `GET /zimra/dashboard-stats` | ZIMRA_OFFICER | `{today_imports, monthly_imports, total_imports, top_dealers: [{id, name, import_count}]}` |
| `GET /dealers/:id/dashboard-stats` | DEALER | `{inventory_count, sold_count, registered_count, total_sales_value, monthly_sales_value, recent_sales: [{id, buyer_full_name, sale_price, sale_date, vehicle_vin}]}` |
| `GET /cvr/dashboard-stats` | CVR_OFFICER | `{today_registrations, monthly_registrations, total_registrations, pending_vehicles}` |

---

## 3. Dashboard Designs

### 3.1 Admin Dashboard

**Route:** `/admin` (new route, becomes the landing page for ADMIN role)
**Redirect update:** Post-login redirect changes from `/admin/dealers` to `/admin`
**Sidebar update:** Add "Dashboard" as the first nav item for ADMIN

**Layout:**
- Header: "System Overview" title + last-refreshed timestamp
- Stats row (4 StatWidget cards):
  - Total Users (default color)
  - Total Dealers — subtitle text: "{active_dealers} active, {suspended_dealers} suspended"
  - Total Vehicles (default color)
  - Total Sales (default color)
- Two-column grid:
  - Left — **Dealer Status Breakdown**: VCard with 3 rows showing active/suspended/revoked counts. Each row is a colored indicator + label + count. Rows link to `/admin/dealers?status={STATUS}`.
  - Right — **Recent Audit Activity**: VCard with mini table of last 10 audit entries (timestamp, user, action, entity type). "View All" link to `/admin/audit-logs`.
- Quick action buttons: "Manage Dealers" and "Manage Users" in the header row

**Data source:** `GET /admin/dashboard-stats` for stats. `GET /audit-logs?limit=10` for recent activity widget.

### 3.2 ZIMRA Dashboard

**Route:** `/zimra` (new route, becomes the landing page for ZIMRA_OFFICER role)
**Redirect update:** Post-login redirect changes from `/zimra/import` to `/zimra`
**Sidebar update:** Add "Dashboard" as the first nav item for ZIMRA_OFFICER

**Layout:**
- Header: "Border Intake" title + prominent "Start Import" primary VButton (navigates to `/zimra/import`)
- Stats row (3 StatWidget cards):
  - Today's Imports (default color)
  - Monthly Imports (default color)
  - Total Imports (default color)
- Single widget: **Top Dealers This Month** — VCard with a ranked list of up to 5 dealers. Each row: rank number, dealer name, import count. Simple flat list, no interactivity.

**Data source:** `GET /zimra/dashboard-stats` provides all data.

**Design rationale:** ZIMRA UX = speed. Dashboard is a brief glance before hitting "Start Import." No charts or dense tables.

### 3.3 Dealer Dashboard

**Route:** `/dealer` (new route, becomes the landing page for DEALER role)
**Redirect update:** Post-login redirect changes from `/dealer/inventory` to `/dealer`
**Sidebar update:** Add "Dashboard" as the first nav item for DEALER

**Layout:**
- Header: "Dashboard" title + "Record New Sale" primary VButton (navigates to `/dealer/sales/new`)
- Stats row (4 StatWidget cards):
  - Vehicles in Inventory (warning color)
  - Vehicles Sold (default color)
  - Vehicles Registered (success color)
  - Monthly Revenue (formatted as US$ with tabular-nums)
- Two-column grid:
  - Left — **Revenue Summary**: VCard showing total_sales_value (lifetime, large text) and monthly_sales_value (current month) as formatted currency values.
  - Right — **Recent Sales**: VCard with mini table of last 5 sales (buyer name, VIN truncated in monospace, sale price, date). Each row links to vehicle detail page. "View Inventory" link at bottom.

**Data source:** `GET /dealers/:dealerId/dashboard-stats` where `dealerId` from `authStore.user.dealershipId`.

### 3.4 CVR Dashboard

**Route:** `/cvr` (new route, becomes the landing page for CVR_OFFICER role)
**Redirect update:** Post-login redirect changes from `/cvr/register` to `/cvr`
**Sidebar update:** Add "Dashboard" as the first nav item for CVR_OFFICER

**Layout:**
- Header: "Vehicle Registration" title
- Stats row (3 StatWidget cards):
  - Today's Registrations (default color)
  - Monthly Registrations (default color)
  - Pending Vehicles (warning color — SOLD vehicles awaiting registration)
- **Search section** below stats: Large centered VIN input + National ID input + Search button. Submitting navigates to `/cvr/register?vin={vin}&national_id={national_id}` so the search executes immediately on arrival.

**Data source:** `GET /cvr/dashboard-stats` for stats. Search itself navigates to the existing register page.

**RegisterPage.vue update:** Read `vin` and `national_id` from query params on mount. If present, pre-fill the inputs and auto-trigger the search.

---

## 4. UI Polish — Systemic Changes

All changes below are made to shared components, global CSS files, or design tokens. No per-page style overrides. Every existing and future page inherits these improvements automatically.

### 4.1 New Shared Component: VBadge.vue

**Location:** `src/components/ui/VBadge.vue`
**Props:** `variant` (success | warning | danger | critical | info | muted), `size` (sm | md, default sm)
**Replaces:** All inline `.badge` styles currently duplicated in AlertsListPage.vue, AlertDetailPage.vue, AuditLogTable.vue, and AlertQueueWidget.vue

Color map:
- `success`: green bg (#DCFCE7), green text (#166534)
- `warning`: amber bg (#FEF3C7), amber text (#B45309)
- `danger`: red bg (#FEE2E2), red text (#991B1B)
- `critical`: dark red bg (#7F1D1D), light text (#FEE2E2)
- `info`: blue bg (#DBEAFE), blue text (#1E40AF)
- `muted`: gray bg (var(--color-bg)), secondary text

### 4.2 Navigation — SideBar.vue

- Replace emoji icons with inline SVG icons:
  - Dashboard: grid/squares icon
  - Dealers/Dealership: building icon
  - Users: people icon
  - Audit Logs: clipboard icon
  - Vehicle Import: truck icon
  - Inventory: car icon
  - New Sale: plus-circle icon
  - Register Vehicle: stamp/checkmark icon
  - STR Alerts: shield-alert icon
- Add left border accent (3px, primary color) on active nav item instead of just background change
- Add subtle separator between nav item groups
- Add "Dashboard" as first nav item for all roles

### 4.3 Navigation — TopBar.vue

- Add subtle bottom border shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`)
- Better spacing for role label badge
- Improve logout button styling (ghost variant with hover state)

### 4.4 tokens.css Updates

- Add `--transition-fast: 0.15s ease` and `--transition-normal: 0.2s ease` tokens
- Add `--color-primary-light: rgba(15, 23, 42, 0.06)` for subtle hover backgrounds
- Add `--focus-ring: 0 0 0 2px var(--color-surface), 0 0 0 4px rgba(15, 23, 42, 0.3)` for consistent focus styling

### 4.5 typography.css Updates

- Ensure `.tabular-nums` utility is available globally
- Add `.font-mono` utility if not already present
- Add `.text-secondary` utility class for muted descriptions

### 4.6 VCard.vue

- Add subtle hover elevation transition on cards that have a click handler: `transition: box-shadow var(--transition-fast)`
- Ensure consistent padding (already `var(--space-5)`)

### 4.7 VInput.vue / VSelect.vue / VTextarea.vue

- Unified focus ring using the `--focus-ring` token
- Subtle border-color transition: `transition: border-color var(--transition-fast)`
- Ensure consistent min-height (40px) across all three

### 4.8 DataTable.vue

- Add subtle alternating row backgrounds: every even row gets `background: var(--color-bg)` at 50% opacity
- Slightly more visible hover state on rows

### 4.9 VButton.vue

- Ensure consistent focus ring using `--focus-ring` token
- Add subtle active/pressed state (slight scale or darken)

### 4.10 Page-Level Cleanup

- Remove all inline `.badge` CSS from AlertsListPage.vue, AlertDetailPage.vue, AuditLogTable.vue, AlertQueueWidget.vue — replace with `<VBadge>` imports
- Ensure every page title uses `<h2>` consistently with `margin-bottom: var(--space-4)`

---

## 5. Route & Navigation Changes Summary

| Role | Current Landing | New Landing | New Sidebar Item |
|---|---|---|---|
| ADMIN | `/admin/dealers` | `/admin` | "Dashboard" (first item) |
| ZIMRA_OFFICER | `/zimra/import` | `/zimra` | "Dashboard" (first item) |
| DEALER | `/dealer/inventory` | `/dealer` | "Dashboard" (first item) |
| CVR_OFFICER | `/cvr/register` | `/cvr` | "Dashboard" (first item) |
| FIU_ANALYST | `/fiu/dashboard` | `/fiu/dashboard` (unchanged) | Already exists |

**Files to update:**
- `src/router/guards.ts` — update `getHomeRoute()` return values
- `src/router/routes/admin.ts` — add `/admin` dashboard route
- `src/router/routes/zimra.ts` — add `/zimra` dashboard route
- `src/router/routes/dealer.ts` — add `/dealer` dashboard route
- `src/router/routes/cvr.ts` — add `/cvr` dashboard route
- `src/components/navigation/SideBar.vue` — add Dashboard items + SVG icons

---

## 6. New Files

```
src/
  components/ui/
    VBadge.vue                          # Shared badge component
  services/
    admin.service.ts                    # getAdminDashboardStats()
    zimra.service.ts                    # getZimraDashboardStats()
    cvr.service.ts                      # getCvrDashboardStats()
    dealer-dashboard.service.ts         # getDealerDashboardStats(dealerId)
  pages/
    admin/DashboardPage.vue             # Admin dashboard
    zimra/DashboardPage.vue             # ZIMRA dashboard
    dealer/DashboardPage.vue            # Dealer dashboard
    cvr/DashboardPage.vue               # CVR dashboard
```

---

## 7. Acceptance Criteria

1. Each role lands on their dashboard after login
2. All stat widgets display real data from the new endpoints
3. Quick action buttons navigate to the correct pages
4. Admin recent audit widget shows last 10 entries
5. Dealer recent sales widget shows last 5 sales with working links
6. ZIMRA top dealers widget shows ranked list
7. CVR search on dashboard navigates to register page with pre-filled params and auto-search
8. VBadge replaces all inline badge styles — no `.badge` CSS remains in page-level scoped styles
9. SVG icons render in sidebar for all roles
10. Focus rings, transitions, and hover states are consistent across all form inputs, buttons, and cards
11. DataTable has alternating row backgrounds
12. All polish changes are in shared components/tokens — no per-page style overrides for polish items
