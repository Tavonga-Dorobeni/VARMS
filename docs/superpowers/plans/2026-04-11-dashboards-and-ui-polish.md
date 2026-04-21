# Role Dashboards & UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dashboard landing pages for ADMIN, ZIMRA, DEALER, and CVR roles, plus a systemic UI polish pass across all shared components.

**Architecture:** Each dashboard is a standalone page component consuming a role-specific service. The StatWidget component (already exists in `src/components/fiu/`) is moved to `src/components/ui/` so all dashboards share it. UI polish is done entirely in shared components and global CSS — no per-page overrides.

**Tech Stack:** Vue 3 + Composition API + TypeScript, Pinia, Axios, CSS custom properties

---

### Task 1: Design Tokens & Typography Polish

**Files:**
- Modify: `frontend/src/assets/styles/tokens.css`
- Modify: `frontend/src/assets/styles/typography.css`

- [ ] **Step 1: Add transition and focus tokens to tokens.css**

Add these tokens at the end of the `:root` block in `frontend/src/assets/styles/tokens.css`, before the closing `}`:

```css
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-surface), 0 0 0 4px rgba(15, 23, 42, 0.3);
```

- [ ] **Step 2: Add `.text-secondary` utility to typography.css**

Add at the end of `frontend/src/assets/styles/typography.css`:

```css
.text-secondary {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/assets/styles/tokens.css frontend/src/assets/styles/typography.css
git commit -m "feat: add transition, focus tokens and text-secondary utility"
```

---

### Task 2: VBadge Shared Component

**Files:**
- Create: `frontend/src/components/ui/VBadge.vue`

- [ ] **Step 1: Create VBadge.vue**

Create `frontend/src/components/ui/VBadge.vue`:

```vue
<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'critical' | 'info' | 'muted'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span :class="['v-badge', `v-badge--${variant ?? 'muted'}`, `v-badge--${size ?? 'sm'}`]">
    <slot />
  </span>
</template>

<style scoped>
.v-badge {
  display: inline-block;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.v-badge--sm {
  padding: 2px 8px;
  font-size: 0.6875rem;
}

.v-badge--md {
  padding: 3px 10px;
  font-size: 0.75rem;
}

.v-badge--success {
  background: #DCFCE7;
  color: #166534;
}

.v-badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.v-badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.v-badge--critical {
  background: #7F1D1D;
  color: #FEE2E2;
}

.v-badge--info {
  background: #DBEAFE;
  color: #1E40AF;
}

.v-badge--muted {
  background: var(--color-bg);
  color: var(--color-text-secondary);
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/VBadge.vue
git commit -m "feat: add VBadge shared component"
```

---

### Task 3: Polish Shared UI Components

**Files:**
- Modify: `frontend/src/components/ui/VButton.vue`
- Modify: `frontend/src/components/ui/VCard.vue`
- Modify: `frontend/src/components/ui/VInput.vue`
- Modify: `frontend/src/components/ui/VSelect.vue`
- Modify: `frontend/src/components/ui/VTextarea.vue`
- Modify: `frontend/src/components/shared/DataTable.vue`

- [ ] **Step 1: Add focus ring and active state to VButton.vue**

In `frontend/src/components/ui/VButton.vue`, replace the `.v-btn` base rule (lines 22-35):

```css
.v-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 36px;
  transition: background-color var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast);
  white-space: nowrap;
}

.v-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.v-btn:active:not(:disabled) {
  transform: translateY(1px);
}
```

- [ ] **Step 2: Add hover elevation to VCard.vue**

Replace the entire `<style scoped>` in `frontend/src/components/ui/VCard.vue`:

```css
.v-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.v-card--padded {
  padding: var(--space-6);
}
```

- [ ] **Step 3: Improve focus ring on VInput.vue**

In `frontend/src/components/ui/VInput.vue`, replace the `.v-input__field` and `.v-input__field:focus` rules (lines 50-64):

```css
.v-input__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  min-height: 40px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.v-input__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}
```

- [ ] **Step 4: Improve focus ring on VSelect.vue**

In `frontend/src/components/ui/VSelect.vue`, replace `.v-select__field` transition and `.v-select__field:focus` rules (lines 53-70):

```css
.v-select__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  min-height: 40px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.v-select__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}
```

- [ ] **Step 5: Improve focus ring on VTextarea.vue**

In `frontend/src/components/ui/VTextarea.vue`, replace `.v-textarea__field` transition and `.v-textarea__field:focus` rules (lines 50-61):

```css
.v-textarea__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.v-textarea__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}
```

- [ ] **Step 6: Add alternating rows and better hover to DataTable.vue**

In `frontend/src/components/shared/DataTable.vue`, replace the `.data-table__row` rule (lines 169-176):

```css
.data-table__row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.data-table__row:nth-child(even) {
  background: rgba(248, 250, 252, 0.5);
}

.data-table__row:hover {
  background: rgba(15, 23, 42, 0.04);
}
```

- [ ] **Step 7: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ui/VButton.vue frontend/src/components/ui/VCard.vue frontend/src/components/ui/VInput.vue frontend/src/components/ui/VSelect.vue frontend/src/components/ui/VTextarea.vue frontend/src/components/shared/DataTable.vue
git commit -m "feat: polish shared UI components with focus rings, transitions, and table stripes"
```

---

### Task 4: Polish TopBar and SideBar Navigation

**Files:**
- Modify: `frontend/src/components/navigation/TopBar.vue`
- Modify: `frontend/src/components/navigation/SideBar.vue`

- [ ] **Step 1: Polish TopBar.vue**

In `frontend/src/components/navigation/TopBar.vue`, replace the `.topbar` style rule (lines 37-49):

```css
.topbar {
  display: flex;
  align-items: center;
  height: var(--topbar-height);
  padding: 0 var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
```

Also replace `.topbar__role` (line 68-71):

```css
.topbar__role {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 10px;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Replace SideBar.vue with SVG icons and dashboard items**

Replace the entire content of `frontend/src/components/navigation/SideBar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/enums'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: string
}

const navItems = computed<NavItem[]>(() => {
  const role = auth.user?.role
  switch (role) {
    case UserRole.ADMIN:
      return [
        { label: 'Dashboard', to: '/admin', icon: 'grid' },
        { label: 'Dealers', to: '/admin/dealers', icon: 'building' },
        { label: 'Users', to: '/admin/users', icon: 'users' },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: 'clipboard' },
      ]
    case UserRole.ZIMRA_OFFICER:
      return [
        { label: 'Dashboard', to: '/zimra', icon: 'grid' },
        { label: 'Vehicle Import', to: '/zimra/import', icon: 'truck' },
      ]
    case UserRole.DEALER:
      return [
        { label: 'Dashboard', to: '/dealer', icon: 'grid' },
        { label: 'Inventory', to: '/dealer/inventory', icon: 'car' },
        { label: 'New Sale', to: '/dealer/sales/new', icon: 'plus-circle' },
      ]
    case UserRole.CVR_OFFICER:
      return [
        { label: 'Dashboard', to: '/cvr', icon: 'grid' },
        { label: 'Register Vehicle', to: '/cvr/register', icon: 'check-circle' },
      ]
    case UserRole.FIU_ANALYST:
      return [
        { label: 'Dashboard', to: '/fiu/dashboard', icon: 'grid' },
        { label: 'STR Alerts', to: '/fiu/alerts', icon: 'shield' },
        { label: 'Audit Logs', to: '/fiu/audit-logs', icon: 'clipboard' },
      ]
    default:
      return []
  }
})

const svgIcons: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  building: '<path d="M6 2L3 7v13h18V7l-3-5H6z"/><rect x="8" y="10" width="3" height="3"/><rect x="13" y="10" width="3" height="3"/><rect x="8" y="16" width="3" height="5"/><rect x="13" y="16" width="3" height="5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  car: '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a1 1 0 0 0-.8.4L1.74 11 .84 11.86a1 1 0 0 0-.84.99V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  'plus-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
}

function isActive(item: NavItem): boolean {
  if (item.to === '/admin' || item.to === '/zimra' || item.to === '/dealer' || item.to === '/cvr') {
    return route.path === item.to
  }
  return route.path.startsWith(item.to)
}
</script>

<template>
  <nav class="sidebar">
    <ul class="sidebar__nav">
      <li v-for="(item, index) in navItems" :key="item.to">
        <div v-if="index === 1" class="sidebar__separator" />
        <RouterLink
          :to="item.to"
          :class="['sidebar__link', { 'sidebar__link--active': isActive(item) }]"
        >
          <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="svgIcons[item.icon] ?? ''" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--color-primary);
  padding: var(--space-4) 0;
  overflow-y: auto;
  z-index: 90;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar__separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: var(--space-2) var(--space-6);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  border-left: 3px solid transparent;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
}

.sidebar__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/navigation/TopBar.vue frontend/src/components/navigation/SideBar.vue
git commit -m "feat: polish navigation with SVG icons, active border accent, and topbar shadow"
```

---

### Task 5: Replace Inline Badge Styles with VBadge

**Files:**
- Modify: `frontend/src/pages/fiu/AlertsListPage.vue`
- Modify: `frontend/src/pages/fiu/AlertDetailPage.vue`
- Modify: `frontend/src/components/audit/AuditLogTable.vue`
- Modify: `frontend/src/components/fiu/AlertQueueWidget.vue`

- [ ] **Step 1: Update AlertsListPage.vue**

In `frontend/src/pages/fiu/AlertsListPage.vue`:

Add import at top of `<script setup>`:
```ts
import VBadge from '@/components/ui/VBadge.vue'
```

Replace the severity cell template slot:
```html
<template #cell-severity="{ value }">
  <VBadge :variant="severityVariant[value as string] ?? 'muted'">{{ value }}</VBadge>
</template>
```

Replace the status cell template slot:
```html
<template #cell-status="{ value }">
  <VBadge :variant="statusVariant[value as string] ?? 'muted'">{{ statusLabels[value as string] ?? value }}</VBadge>
</template>
```

Replace the `severityClass` and `statusClass` maps with variant maps (remove the old `Class` versions):
```ts
const severityVariant: Record<string, string> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}

const statusVariant: Record<string, string> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  DISMISSED: 'muted',
  ESCALATED: 'danger',
}
```

Remove the entire `.badge` CSS block from `<style scoped>` (the `.badge`, `.badge--info`, `.badge--warning`, `.badge--danger`, `.badge--critical`, `.badge--muted` rules).

- [ ] **Step 2: Update AlertDetailPage.vue**

In `frontend/src/pages/fiu/AlertDetailPage.vue`:

Add import:
```ts
import VBadge from '@/components/ui/VBadge.vue'
```

Replace the header badges template:
```html
<div class="detail-header__badges">
  <VBadge :variant="severityVariant[alert.severity] ?? 'muted'">{{ alert.severity }}</VBadge>
  <VBadge :variant="statusVariant[alert.status] ?? 'muted'">{{ alert.status.replace('_', ' ') }}</VBadge>
</div>
```

Rename `severityClass` to `severityVariant` and `statusClass` to `statusVariant`, changing values from `'badge--info'` to `'info'`, etc.:
```ts
const severityVariant: Record<string, string> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}

const statusVariant: Record<string, string> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  DISMISSED: 'muted',
  ESCALATED: 'danger',
}
```

Remove all `.badge` CSS rules from `<style scoped>`.

- [ ] **Step 3: Update AuditLogTable.vue**

In `frontend/src/components/audit/AuditLogTable.vue`:

Add import:
```ts
import VBadge from '@/components/ui/VBadge.vue'
```

Replace the action cell template:
```html
<template #cell-action="{ value }">
  <VBadge :variant="actionVariant[value as string] ?? 'muted'">{{ value }}</VBadge>
</template>
```

Rename `actionClass` to `actionVariant`, changing values:
```ts
const actionVariant: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
}
```

Remove all `.badge` CSS rules from `<style scoped>`.

- [ ] **Step 4: Update AlertQueueWidget.vue**

In `frontend/src/components/fiu/AlertQueueWidget.vue`:

Add import:
```ts
import VBadge from '@/components/ui/VBadge.vue'
```

Replace the severity badge in the table template:
```html
<td>
  <VBadge :variant="severityVariant[a.severity] ?? 'muted'">{{ a.severity }}</VBadge>
</td>
```

Rename `severityClass` to `severityVariant`:
```ts
const severityVariant: Record<string, string> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}
```

Remove all `.badge` CSS rules from `<style scoped>`.

- [ ] **Step 5: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/fiu/AlertsListPage.vue frontend/src/pages/fiu/AlertDetailPage.vue frontend/src/components/audit/AuditLogTable.vue frontend/src/components/fiu/AlertQueueWidget.vue
git commit -m "refactor: replace inline badge styles with VBadge component"
```

---

### Task 6: Move StatWidget to Shared UI + Update Imports

**Files:**
- Move: `frontend/src/components/fiu/StatWidget.vue` → `frontend/src/components/ui/StatWidget.vue`
- Modify: `frontend/src/components/fiu/StatsRow.vue` (update import path)

- [ ] **Step 1: Move StatWidget.vue**

```bash
cd frontend
cp src/components/fiu/StatWidget.vue src/components/ui/StatWidget.vue
rm src/components/fiu/StatWidget.vue
```

- [ ] **Step 2: Update StatsRow.vue import**

In `frontend/src/components/fiu/StatsRow.vue`, change:
```ts
import StatWidget from './StatWidget.vue'
```
to:
```ts
import StatWidget from '@/components/ui/StatWidget.vue'
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/StatWidget.vue frontend/src/components/fiu/StatsRow.vue
git rm frontend/src/components/fiu/StatWidget.vue
git commit -m "refactor: move StatWidget to shared ui components"
```

---

### Task 7: Route and Guard Updates

**Files:**
- Modify: `frontend/src/router/guards.ts`
- Modify: `frontend/src/router/routes/admin.ts`
- Modify: `frontend/src/router/routes/zimra.ts`
- Modify: `frontend/src/router/routes/dealer.ts`
- Modify: `frontend/src/router/routes/cvr.ts`

- [ ] **Step 1: Update getHomeRoute in guards.ts**

In `frontend/src/router/guards.ts`, replace the `routeMap` object in `getHomeRoute` (lines 46-53):

```ts
export function getHomeRoute(role: UserRole): string {
  const routeMap: Record<string, string> = {
    ADMIN: '/admin',
    ZIMRA_OFFICER: '/zimra',
    DEALER: '/dealer',
    CVR_OFFICER: '/cvr',
    FIU_ANALYST: '/fiu/dashboard',
  }
  return routeMap[role] || '/login'
}
```

- [ ] **Step 2: Add admin dashboard route**

In `frontend/src/router/routes/admin.ts`, add the dashboard route as the first child:

```ts
{
  path: '',
  name: 'admin-dashboard',
  component: () => import('@/pages/admin/DashboardPage.vue'),
},
```

- [ ] **Step 3: Add zimra dashboard route**

In `frontend/src/router/routes/zimra.ts`, add the dashboard route as the first child:

```ts
{
  path: '',
  name: 'zimra-dashboard',
  component: () => import('@/pages/zimra/DashboardPage.vue'),
},
```

- [ ] **Step 4: Add dealer dashboard route**

In `frontend/src/router/routes/dealer.ts`, add the dashboard route as the first child:

```ts
{
  path: '',
  name: 'dealer-dashboard',
  component: () => import('@/pages/dealer/DashboardPage.vue'),
},
```

- [ ] **Step 5: Add cvr dashboard route**

In `frontend/src/router/routes/cvr.ts`, add the dashboard route as the first child:

```ts
{
  path: '',
  name: 'cvr-dashboard',
  component: () => import('@/pages/cvr/DashboardPage.vue'),
},
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/router/guards.ts frontend/src/router/routes/admin.ts frontend/src/router/routes/zimra.ts frontend/src/router/routes/dealer.ts frontend/src/router/routes/cvr.ts
git commit -m "feat: add dashboard routes and update post-login redirects for all roles"
```

---

### Task 8: Dashboard Services

**Files:**
- Create: `frontend/src/services/admin.service.ts`
- Create: `frontend/src/services/zimra.service.ts`
- Create: `frontend/src/services/dealer-dashboard.service.ts`
- Create: `frontend/src/services/cvr.service.ts`

- [ ] **Step 1: Create admin.service.ts**

Create `frontend/src/services/admin.service.ts`:

```ts
import api from './api'

export interface AdminDashboardStats {
  total_users: number
  total_dealers: number
  active_dealers: number
  suspended_dealers: number
  total_vehicles: number
  total_sales: number
  recent_audit_count: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get('/admin/dashboard-stats')
  return response.data as AdminDashboardStats
}
```

- [ ] **Step 2: Create zimra.service.ts**

Create `frontend/src/services/zimra.service.ts`:

```ts
import api from './api'

export interface ZimraDashboardStats {
  today_imports: number
  monthly_imports: number
  total_imports: number
  top_dealers: { id: number; name: string; import_count: number }[]
}

export async function getZimraDashboardStats(): Promise<ZimraDashboardStats> {
  const response = await api.get('/zimra/dashboard-stats')
  return response.data as ZimraDashboardStats
}
```

- [ ] **Step 3: Create dealer-dashboard.service.ts**

Create `frontend/src/services/dealer-dashboard.service.ts`:

```ts
import api from './api'

export interface DealerDashboardStats {
  inventory_count: number
  sold_count: number
  registered_count: number
  total_sales_value: number
  monthly_sales_value: number
  recent_sales: {
    id: number
    buyer_full_name: string
    sale_price: number
    sale_date: string
    vehicle_vin: string
  }[]
}

export async function getDealerDashboardStats(dealerId: number): Promise<DealerDashboardStats> {
  const response = await api.get(`/dealers/${dealerId}/dashboard-stats`)
  return response.data as DealerDashboardStats
}
```

- [ ] **Step 4: Create cvr.service.ts**

Create `frontend/src/services/cvr.service.ts`:

```ts
import api from './api'

export interface CvrDashboardStats {
  today_registrations: number
  monthly_registrations: number
  total_registrations: number
  pending_vehicles: number
}

export async function getCvrDashboardStats(): Promise<CvrDashboardStats> {
  const response = await api.get('/cvr/dashboard-stats')
  return response.data as CvrDashboardStats
}
```

- [ ] **Step 5: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/services/admin.service.ts frontend/src/services/zimra.service.ts frontend/src/services/dealer-dashboard.service.ts frontend/src/services/cvr.service.ts
git commit -m "feat: add dashboard service files for all roles"
```

---

### Task 9: Admin Dashboard Page

**Files:**
- Create: `frontend/src/pages/admin/DashboardPage.vue`

- [ ] **Step 1: Create the admin dashboard page**

Create `frontend/src/pages/admin/DashboardPage.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import VBadge from '@/components/ui/VBadge.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getAdminDashboardStats, type AdminDashboardStats } from '@/services/admin.service'
import { useQuery } from '@/composables/useApi'
import type { PaginatedData } from '@/types/api'
import type { AuditLog } from '@/types/models'

const router = useRouter()
const stats = ref<AdminDashboardStats | null>(null)
const loading = ref(true)
const lastRefreshed = ref('')

const { data: auditData, loading: auditLoading } = useQuery<PaginatedData<AuditLog>>(
  '/audit-logs',
  { limit: 10, sort_order: 'desc' },
)

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  loading.value = true
  try {
    stats.value = await getAdminDashboardStats()
    lastRefreshed.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const actionVariant: Record<string, 'success' | 'info' | 'danger'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
}
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <div>
          <h2>System Overview</h2>
          <span v-if="lastRefreshed" class="text-secondary" style="font-size: 0.75rem">
            Last refreshed {{ lastRefreshed }}
          </span>
        </div>
        <div class="dashboard__actions">
          <VButton variant="secondary" @click="router.push('/admin/dealers')">Manage Dealers</VButton>
          <VButton variant="secondary" @click="router.push('/admin/users')">Manage Users</VButton>
        </div>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Total Users" :value="stats.total_users" />
          <StatWidget label="Total Dealers" :value="stats.total_dealers" />
          <StatWidget label="Total Vehicles" :value="stats.total_vehicles" />
          <StatWidget label="Total Sales" :value="stats.total_sales" />
        </template>
      </div>

      <div class="dashboard__grid">
        <VCard>
          <h3 style="margin-bottom: var(--space-3)">Dealer Status</h3>
          <div v-if="stats" class="status-rows">
            <RouterLink to="/admin/dealers?status=ACTIVE" class="status-row">
              <VBadge variant="success">Active</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.active_dealers }}</span>
            </RouterLink>
            <RouterLink to="/admin/dealers?status=SUSPENDED" class="status-row">
              <VBadge variant="warning">Suspended</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.suspended_dealers }}</span>
            </RouterLink>
            <RouterLink to="/admin/dealers?status=REVOKED" class="status-row">
              <VBadge variant="danger">Revoked</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.total_dealers - stats.active_dealers - stats.suspended_dealers }}</span>
            </RouterLink>
          </div>
        </VCard>

        <VCard>
          <div class="widget-header">
            <h3>Recent Audit Activity</h3>
            <VButton variant="ghost" @click="router.push('/admin/audit-logs')">View All</VButton>
          </div>
          <table v-if="!auditLoading && auditData?.items?.length" class="mini-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditData.items" :key="log.id">
                <td>{{ formatTimestamp(log.timestamp) }}</td>
                <td>{{ (log as any).user ?? '—' }}</td>
                <td><VBadge :variant="actionVariant[log.action] ?? 'muted'">{{ log.action }}</VBadge></td>
                <td>{{ log.entity_type }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else-if="auditLoading" class="text-secondary" style="padding: var(--space-4); text-align: center">Loading...</p>
          <p v-else class="text-secondary" style="padding: var(--space-4); text-align: center">No recent activity</p>
        </VCard>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.dashboard__actions {
  display: flex;
  gap: var(--space-2);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.stats-row__skeleton {
  height: 88px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 860px) {
  .dashboard__grid { grid-template-columns: 1fr; }
}

.status-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.status-row:hover {
  background: var(--color-bg);
}

.status-row__count {
  font-weight: 600;
  font-size: 1.125rem;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
}

.mini-table th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.mini-table td {
  padding: var(--space-2);
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/admin/DashboardPage.vue
git commit -m "feat: add admin dashboard page"
```

---

### Task 10: ZIMRA Dashboard Page

**Files:**
- Create: `frontend/src/pages/zimra/DashboardPage.vue`

- [ ] **Step 1: Create the ZIMRA dashboard page**

Create `frontend/src/pages/zimra/DashboardPage.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getZimraDashboardStats, type ZimraDashboardStats } from '@/services/zimra.service'

const router = useRouter()
const stats = ref<ZimraDashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await getZimraDashboardStats()
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <h2>Border Intake</h2>
        <VButton @click="router.push('/zimra/import')">Start Import</VButton>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Today's Imports" :value="stats.today_imports" />
          <StatWidget label="Monthly Imports" :value="stats.monthly_imports" />
          <StatWidget label="Total Imports" :value="stats.total_imports" />
        </template>
      </div>

      <VCard v-if="!loading && stats?.top_dealers?.length">
        <h3 style="margin-bottom: var(--space-3)">Top Dealers This Month</h3>
        <ol class="top-dealers">
          <li v-for="(dealer, index) in stats.top_dealers" :key="dealer.id" class="top-dealers__row">
            <span class="top-dealers__rank">{{ index + 1 }}</span>
            <span class="top-dealers__name">{{ dealer.name }}</span>
            <span class="top-dealers__count tabular-nums">{{ dealer.import_count }}</span>
          </li>
        </ol>
      </VCard>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.stats-row__skeleton {
  height: 88px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.top-dealers {
  list-style: none;
  padding: 0;
  margin: 0;
}

.top-dealers__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.top-dealers__row:last-child {
  border-bottom: none;
}

.top-dealers__rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.top-dealers__name {
  flex: 1;
  font-weight: 500;
}

.top-dealers__count {
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/zimra/DashboardPage.vue
git commit -m "feat: add ZIMRA dashboard page"
```

---

### Task 11: Dealer Dashboard Page

**Files:**
- Create: `frontend/src/pages/dealer/DashboardPage.vue`

- [ ] **Step 1: Create the dealer dashboard page**

Create `frontend/src/pages/dealer/DashboardPage.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { useAuthStore } from '@/stores/auth'
import { getDealerDashboardStats, type DealerDashboardStats } from '@/services/dealer-dashboard.service'

const router = useRouter()
const auth = useAuthStore()
const stats = ref<DealerDashboardStats | null>(null)
const loading = ref(true)

function formatCurrency(value: number): string {
  return `US$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  if (!auth.user?.dealershipId) return
  try {
    stats.value = await getDealerDashboardStats(auth.user.dealershipId)
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <h2>Dashboard</h2>
        <VButton @click="router.push('/dealer/sales/new')">Record New Sale</VButton>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Vehicles in Inventory" :value="stats.inventory_count" variant="warning" />
          <StatWidget label="Vehicles Sold" :value="stats.sold_count" />
          <StatWidget label="Vehicles Registered" :value="stats.registered_count" variant="success" />
          <StatWidget label="Monthly Revenue" :value="formatCurrency(stats.monthly_sales_value)" />
        </template>
      </div>

      <div v-if="!loading && stats" class="dashboard__grid">
        <VCard>
          <h3 style="margin-bottom: var(--space-4)">Revenue Summary</h3>
          <div class="revenue">
            <div class="revenue__item">
              <span class="revenue__label text-secondary">Lifetime Revenue</span>
              <span class="revenue__value tabular-nums">{{ formatCurrency(stats.total_sales_value) }}</span>
            </div>
            <div class="revenue__item">
              <span class="revenue__label text-secondary">This Month</span>
              <span class="revenue__value revenue__value--highlight tabular-nums">{{ formatCurrency(stats.monthly_sales_value) }}</span>
            </div>
          </div>
        </VCard>

        <VCard>
          <div class="widget-header">
            <h3>Recent Sales</h3>
            <VButton variant="ghost" @click="router.push('/dealer/inventory')">View Inventory</VButton>
          </div>
          <table v-if="stats.recent_sales.length" class="mini-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>VIN</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in stats.recent_sales"
                :key="sale.id"
                class="mini-table__row--clickable"
                @click="router.push(`/dealer/inventory/${sale.id}`)"
              >
                <td>{{ sale.buyer_full_name }}</td>
                <td class="font-mono">{{ sale.vehicle_vin.slice(0, 11) }}...</td>
                <td class="tabular-nums">{{ formatCurrency(sale.sale_price) }}</td>
                <td>{{ formatDate(sale.sale_date) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-secondary" style="padding: var(--space-4); text-align: center">No recent sales</p>
        </VCard>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.stats-row__skeleton {
  height: 88px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 860px) {
  .dashboard__grid { grid-template-columns: 1fr; }
}

.revenue {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.revenue__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.revenue__label {
  font-size: 0.8125rem;
}

.revenue__value {
  font-size: 1.5rem;
  font-weight: 700;
}

.revenue__value--highlight {
  color: var(--color-success);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
}

.mini-table th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.mini-table td {
  padding: var(--space-2);
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.mini-table__row--clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.mini-table__row--clickable:hover {
  background: var(--color-bg);
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/dealer/DashboardPage.vue
git commit -m "feat: add dealer dashboard page"
```

---

### Task 12: CVR Dashboard Page + RegisterPage Query Param Support

**Files:**
- Create: `frontend/src/pages/cvr/DashboardPage.vue`
- Modify: `frontend/src/pages/cvr/RegisterPage.vue`

- [ ] **Step 1: Create the CVR dashboard page**

Create `frontend/src/pages/cvr/DashboardPage.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VInput from '@/components/ui/VInput.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getCvrDashboardStats, type CvrDashboardStats } from '@/services/cvr.service'

const router = useRouter()
const stats = ref<CvrDashboardStats | null>(null)
const loading = ref(true)
const searchVin = ref('')
const searchNationalId = ref('')

onMounted(async () => {
  try {
    stats.value = await getCvrDashboardStats()
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
})

function handleSearch() {
  if (!searchVin.value.trim() || !searchNationalId.value.trim()) return
  router.push({
    name: 'cvr-register',
    query: {
      vin: searchVin.value.trim().toUpperCase(),
      national_id: searchNationalId.value.trim(),
    },
  })
}
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <h2 style="margin-bottom: var(--space-4)">Vehicle Registration</h2>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Today's Registrations" :value="stats.today_registrations" />
          <StatWidget label="Monthly Registrations" :value="stats.monthly_registrations" />
          <StatWidget label="Pending Vehicles" :value="stats.pending_vehicles" variant="warning" />
        </template>
      </div>

      <VCard class="search-section">
        <h3 style="margin-bottom: var(--space-4)">Search Vehicle</h3>
        <div class="search-form">
          <VInput
            v-model="searchVin"
            label="VIN"
            placeholder="Enter 17-character VIN"
            required
            @keydown.enter="handleSearch"
          />
          <VInput
            v-model="searchNationalId"
            label="Requester National ID"
            placeholder="Enter national ID"
            required
            @keydown.enter="handleSearch"
          />
          <VButton
            :disabled="!searchVin.trim() || !searchNationalId.trim()"
            @click="handleSearch"
          >
            Search
          </VButton>
        </div>
      </VCard>
    </div>
  </AppShell>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.stats-row__skeleton {
  height: 88px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.search-section {
  max-width: 520px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
```

- [ ] **Step 2: Add query param support to RegisterPage.vue**

In `frontend/src/pages/cvr/RegisterPage.vue`, add `useRoute` import and `onMounted` logic to read query params and auto-search.

Add `useRoute` to the imports (line 2):
```ts
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
```

Add after line 3 (`import AppShell...`):
```ts
const route = useRoute()
```

Wait — `useRoute` is not imported yet. Replace the first two lines of `<script setup>`:

```ts
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
```

Add `const route = useRoute()` after the existing ref declarations (after line 21, `const approved = ref(false)`):

```ts
const route = useRoute()
```

Add an `onMounted` hook after the `reset()` function definition:

```ts
onMounted(() => {
  const queryVin = route.query.vin as string | undefined
  const queryNid = route.query.national_id as string | undefined
  if (queryVin && queryNid) {
    vin.value = queryVin
    nationalId.value = queryNid
    handleSearch()
  }
})
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/cvr/DashboardPage.vue frontend/src/pages/cvr/RegisterPage.vue
git commit -m "feat: add CVR dashboard page with search + RegisterPage query param support"
```

---

### Task 13: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build check**

Run: `cd frontend && npx vite build`
Expected: Build succeeds with all new dashboard chunks in the output.

- [ ] **Step 2: Verify no inline badge CSS remains**

Search for leftover `.badge` scoped styles:
```bash
cd frontend && grep -rn "\.badge--" src/pages/ src/components/fiu/ src/components/audit/ --include="*.vue"
```

Expected: No results (all badge styles are now in VBadge.vue).

- [ ] **Step 3: Verify all route files have dashboard routes**

```bash
cd frontend && grep -n "dashboard" src/router/routes/*.ts
```

Expected: Each file (admin.ts, zimra.ts, dealer.ts, cvr.ts) shows a dashboard route. fiu.ts already has one.

- [ ] **Step 4: Verify getHomeRoute points to dashboards**

```bash
cd frontend && grep -A6 "getHomeRoute" src/router/guards.ts
```

Expected: ADMIN -> '/admin', ZIMRA_OFFICER -> '/zimra', DEALER -> '/dealer', CVR_OFFICER -> '/cvr'.

- [ ] **Step 5: Commit all remaining changes**

If any files were missed:
```bash
git add -A
git commit -m "chore: final verification pass"
```
