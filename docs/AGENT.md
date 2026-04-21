# AGENT.md — VARMS Implementation Guide for AI Coding Agents

## 1. Purpose

This document is the primary implementation guide for building the **Vehicle Asset Registry and Monitoring System (VARMS)** — a centralized government platform that creates full traceability for every vehicle imported into or sold within Zimbabwe. It is written for any AI coding agent (Claude Code, Copilot, Cursor, Codex, or equivalent) tasked with implementing part or all of the system.

**Stack:**
- Backend: Node.js with MySQL database
- Frontend: Vue.js single-page application

The agent should choose appropriate libraries within this stack. This guide defines the architecture, module boundaries, data models, API contracts, and key technical decisions — but does not prescribe specific npm packages or exact file organization.

**Reference Documents:**
- `SPEC.md` — Full functional and non-functional requirements
- `DESIGN.md` — UI/UX design direction, color palette, typography, role-specific UX strategies

**How to Use This Guide:**
1. Read Section 2 (Architecture Overview) and Section 3 (Cross-Cutting Concerns) first — they apply to everything.
2. Then read the module section(s) relevant to the work you are implementing.
3. Each module section is self-contained: it defines backend endpoints, database entities, business rules, frontend views, and acceptance criteria.
4. The dependency graph in Section 2 tells you what order to build in.

---

## 2. Architecture Overview

### Monorepo Structure

The project is a single repository with two top-level directories:

```
VARMS/
  backend/        # Node.js REST API + MySQL
  frontend/       # Vue.js SPA
  docs/           # Specification and design documents
```

### Backend Architecture

- REST API serving JSON over HTTP
- Resource-oriented URL pattern: `/api/v1/{resource}`
- MySQL relational database with foreign key constraints enforcing data integrity
- Role-based middleware that validates JWT claims before granting access to endpoints
- Audit logging middleware that automatically records every create, update, and soft-delete operation

### Frontend Architecture

- Vue.js single-page application
- Role-based route groups with lazy-loaded boundaries:
  - `/zimra/*` — ZIMRA Border Intake
  - `/dealer/*` — Dealership views
  - `/cvr/*` — CVR Registration Control
  - `/fiu/*` — FIU Oversight & Monitoring
  - `/admin/*` — System Administration
- Route guards enforce role-based access — unauthorized roles are redirected to an "Access Denied" page

### Authentication Flow

- Login endpoint accepts credentials, returns a JWT containing `user_id`, `role`, and `agency`
- Every API request carries the JWT in the `Authorization` header
- Backend middleware validates the token and checks the role against a route-permission map
- Frontend stores tokens securely and handles `401` (force logout) and `403` (access denied redirect) globally

### Module Dependency Graph (Build Order)

```
1. Database schema + Auth system
2. Dealer Registry            (needed before any vehicle operations)
3. ZIMRA Border Intake         (needs dealers to exist)
4. Dealership Inventory        (auto-populated by border intake)
5. Sales Recording             (needs inventory; creates buyer records)
6. Beneficial Ownership & STR  (triggered by sales)
7. CVR Registration            (needs full chain: import -> inventory -> sale)
8. FIU Dashboard               (read-only overlay on all above)
9. Audit & Compliance          (cross-cutting; can be built incrementally alongside each module)
```

Build from the bottom up. Each module assumes the ones above it are functional.

---

## 3. Cross-Cutting Concerns

### 3.1 Authentication & Role-Based Access Control

**Five system roles:**

| Role | Scope |
|------|-------|
| `ZIMRA_OFFICER` | Create vehicle import records at the border |
| `DEALER` | View own inventory, record sales |
| `CVR_OFFICER` | Search vehicles, approve/block registration |
| `FIU_ANALYST` | Read-only access to all data, manage STR alerts |
| `ADMIN` | Manage users, dealerships, permissions, thresholds, system settings |

**Backend enforcement:**
- Middleware extracts the role from the JWT and compares it against the route-permission map
- Return `401 Unauthorized` for expired or missing tokens
- Return `403 Forbidden` for valid tokens with insufficient role
- Never rely on the frontend alone for access control

**Frontend enforcement:**
- Route guards check the user's role before rendering a route
- Unauthorized navigation redirects to an "Access Denied" page
- UI components conditionally render based on role (e.g., FIU sees all dealer inventories; a dealer sees only their own)

### 3.2 Database Conventions

- All table and column names use `snake_case`
- Every table includes `created_at` and `updated_at` timestamp columns
- Soft deletes where applicable — records are never physically deleted by standard users
- Foreign keys enforce referential integrity across all entity relationships
- Enum columns use MySQL `ENUM` or equivalent string constraints for status fields

### 3.3 API Conventions

- All endpoints are versioned under `/api/v1/`
- Standard response envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

- Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Description of what went wrong"
}
```

- Validation errors return `422 Unprocessable Entity` with field-level details:

```json
{
  "success": false,
  "data": null,
  "error": "Validation failed",
  "fields": {
    "vin": "VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)"
  }
}
```

- Paginated list endpoints accept `?page=1&limit=20` and return:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 150,
    "page": 1,
    "limit": 20
  },
  "error": null
}
```

### 3.4 Audit Logging

- Every create, update, and soft-delete operation writes to the `audit_logs` table
- Implemented as backend middleware or hook — individual modules must not handle audit logging manually
- Audit log fields: `user_id`, `role`, `action` (CREATE, UPDATE, DELETE), `entity_type`, `entity_id`, `timestamp`, `before_value` (JSON), `after_value` (JSON)
- Audit records are immutable — no update or delete API endpoints exist for them
- Any edit to an existing record must include a `reason` field (provided by the Audit Reason Modal on the frontend), stored in the audit log metadata

### 3.5 Frontend Shared Components

These must be built before individual module views:

**Lifecycle Breadcrumb**
- Visual tracker showing vehicle's current stage: `Border Entry` -> `Dealer Inventory` -> `Pending Sale` -> `CVR Registered`
- Props: `currentStage` (enum), `timestamp` (date string for each completed stage)
- Displayed at the top of any vehicle detail view

**Status Badge**
- Renders a colored badge for vehicle status
- Statuses: `CLEARED`, `INVENTORY`, `SOLD`, `REGISTERED`, `STR_FLAGGED`
- Colors follow the semantic palette: green for success states, amber for pending, crimson for alerts
- Props: `status` (enum), `size` (sm, md)

**Audit Reason Modal**
- Intercepts any update or soft-delete action before the API call is made
- Contains a required `textarea` for justification
- Appends the justification to the API request payload
- Blocks submission until a reason is provided

### 3.6 Design Tokens

From `DESIGN.md` — apply globally:

| Token | Value | Usage |
|-------|-------|-------|
| Primary / Authority | `#0F172A` (Deep Navy) | Sidebars, active states, primary buttons |
| Background | `#F8FAFC` (Off-White) | Main application background |
| Surface | `#FFFFFF` (White) | Cards, forms, data tables |
| Success | `#166534` / bg `#DCFCE7` | Approved, registered, cleared |
| Warning | `#B45309` / bg `#FEF3C7` | Pending, inventory, warnings |
| Danger | `#991B1B` / bg `#FEE2E2` | STR flags, blocked, errors |
| Font Family | `Inter`, `Public Sans`, or `Roboto` | UI text |
| Numeric Display | `font-variant-numeric: tabular-nums` | VINs, IDs, currency amounts |

### 3.7 Idempotency & Double-Submit Prevention

- Frontend disables submit buttons and shows a loading state immediately on click
- Backend accepts an optional `Idempotency-Key` header on create operations to prevent duplicate records from network retries

---

## 4. Module Definitions

Each module below maps 1:1 to a functional requirement section in `SPEC.md`.

---

### 4.1 Dealer Registry & Licensing

> SPEC.md Section 6.1

**Description:** Maintains a registry of all approved car dealerships. Only active, licensed dealerships can participate in the system.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/dealers` | ADMIN | Create a new dealership |
| GET | `/api/v1/dealers` | ADMIN, FIU_ANALYST | List all dealerships (paginated) |
| GET | `/api/v1/dealers/:id` | ADMIN, FIU_ANALYST | Get dealership details |
| PATCH | `/api/v1/dealers/:id` | ADMIN | Update dealership details |
| PATCH | `/api/v1/dealers/:id/status` | ADMIN | Change status (activate, suspend, revoke) |

**Database Entity — `dealers`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| name | VARCHAR(255) | NOT NULL |
| license_number | VARCHAR(100) | NOT NULL, UNIQUE |
| status | ENUM('ACTIVE', 'SUSPENDED', 'REVOKED') | NOT NULL, DEFAULT 'ACTIVE' |
| address | TEXT | NOT NULL |
| contact_info | VARCHAR(255) | NOT NULL |
| approved_at | DATETIME | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Business Rules:**
- Only `ACTIVE` dealerships can receive imported vehicles into inventory or record sales
- Status changes (suspend, revoke, reactivate) require an audit reason
- Suspending a dealer does not remove their existing inventory — it prevents new transactions

**Frontend Views:**
- Route: `/admin/dealers`
- Table listing all dealerships with Status Badges, search, and filter by status
- Create/edit form for dealership details
- Status toggle button triggers the Audit Reason Modal before calling the status-change endpoint

**Acceptance Criteria:**
- [ ] A suspended dealer's API calls to create sales or receive vehicles return `403`
- [ ] Status changes are recorded in the audit log with the reason
- [ ] Dealer list is paginated, searchable, and filterable by status

---

### 4.2 ZIMRA Border Intake

> SPEC.md Section 6.2

**Description:** ZIMRA officers register imported vehicles at the border before release. On successful registration, the vehicle is automatically added to the importing dealership's inventory.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/vehicles/import` | ZIMRA_OFFICER | Register a vehicle at the border |
| GET | `/api/v1/vehicles/import/:id` | ZIMRA_OFFICER, FIU_ANALYST | Get import record details |

**Database Entities:**

**`vehicles`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| vin | VARCHAR(17) | NOT NULL, UNIQUE |
| make | VARCHAR(100) | NOT NULL |
| model | VARCHAR(100) | NOT NULL |
| declared_value | DECIMAL(12,2) | NOT NULL |
| country_of_origin | VARCHAR(100) | NOT NULL |
| import_date | DATE | NOT NULL |
| dealership_id | INT | FK -> dealers.id, NOT NULL |
| status | ENUM('CLEARED', 'INVENTORY', 'SOLD', 'REGISTERED', 'STR_FLAGGED') | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**`import_records`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| vehicle_id | INT | FK -> vehicles.id, NOT NULL |
| officer_id | INT | FK -> users.id, NOT NULL |
| border_post | VARCHAR(100) | NOT NULL |
| timestamp | DATETIME | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Business Rules:**
- VIN must be exactly 17 alphanumeric characters, excluding the letters I, O, and Q
- VIN must be unique across the entire system — reject duplicates with a clear error
- The importing dealership must have `ACTIVE` status — reject if suspended or revoked
- On successful submission: create the vehicle record with status `INVENTORY`, create the import record, and link the vehicle to the dealership
- All required fields must be present — reject incomplete submissions with field-level errors

**Frontend Views:**
- Route: `/zimra/import`
- Linear, high-contrast form optimized for speed
- VIN field auto-formats and validates in real time (17 chars, no I/O/Q)
- Auto-focus advances to the next input field upon valid entry
- Full keyboard navigation: Tab to next field, Enter to submit
- Dealer selection via searchable dropdown of ACTIVE dealers only
- Success state: confirmation with the vehicle's assigned inventory ID

**Acceptance Criteria:**
- [ ] Duplicate VIN submission is rejected with a clear error message
- [ ] Vehicle appears in the dealer's inventory immediately after successful submission
- [ ] Import with a suspended/revoked dealer is rejected
- [ ] Incomplete form submission returns field-level validation errors
- [ ] The entire form is navigable using only Tab and Enter keys

---

### 4.3 Dealership Inventory

> SPEC.md Section 6.3

**Description:** Live inventory ledger for each dealership. Vehicles enter inventory automatically via border intake and leave only through a completed sale.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/dealers/:dealerId/inventory` | DEALER, FIU_ANALYST, ADMIN | List vehicles in a dealer's inventory (paginated) |
| GET | `/api/v1/vehicles/:id` | DEALER, FIU_ANALYST, ADMIN, CVR_OFFICER | Get vehicle details with full history |

**Database Entities:**
No new tables. This module reads from the `vehicles` table, filtered by `dealership_id` and `status`.

**Business Rules:**
- A `DEALER` user can only query their own inventory (backend enforces `dealership_id` from the JWT claims)
- `FIU_ANALYST` and `ADMIN` can query any dealer's inventory
- There is no endpoint to manually remove a vehicle from inventory — vehicles leave inventory only through the Sales Recording module
- Vehicle detail view includes linked import record and any sale/registration history

**Frontend Views:**
- Route: `/dealer/inventory`
- Dashboard table showing all vehicles in the dealer's inventory
- Columns: VIN, Make, Model, Declared Value, Import Date, Status (via Status Badge)
- Filterable by status and date range
- Clicking a vehicle opens a detail view with Lifecycle Breadcrumb and full transaction history

**Acceptance Criteria:**
- [ ] Dealer sees only their own inventory
- [ ] FIU analyst can view any dealer's inventory
- [ ] No manual removal or deletion endpoint exists
- [ ] Vehicle detail view shows import record and Lifecycle Breadcrumb

---

### 4.4 Sales Recording

> SPEC.md Section 6.4

**Description:** Dealerships record vehicle sales in real time, capturing buyer identity, payment details, and beneficial ownership information.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/sales` | DEALER | Record a new vehicle sale |
| GET | `/api/v1/sales` | DEALER, FIU_ANALYST, ADMIN | List sales (paginated, scoped by role) |
| GET | `/api/v1/sales/:id` | DEALER, FIU_ANALYST, ADMIN, CVR_OFFICER | Get sale details |

**Database Entities:**

**`buyers`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| full_name | VARCHAR(255) | NOT NULL |
| national_id | VARCHAR(50) | NOT NULL, UNIQUE |
| contact_details | VARCHAR(255) | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**`sale_transactions`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| vehicle_id | INT | FK -> vehicles.id, NOT NULL |
| dealership_id | INT | FK -> dealers.id, NOT NULL |
| buyer_id | INT | FK -> buyers.id, NOT NULL |
| sale_price | DECIMAL(12,2) | NOT NULL |
| payment_type | ENUM('CASH', 'BANK_TRANSFER', 'FINANCE') | NOT NULL |
| proof_of_payment | VARCHAR(500) | NOT NULL |
| sale_date | DATE | NOT NULL |
| is_acting_for_another | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Business Rules:**
- All fields are required — reject the sale if any are missing
- The vehicle must be in `INVENTORY` status and must belong to the submitting dealer
- On successful submission: vehicle status changes to `SOLD`
- If `payment_type` is `CASH` and `sale_price` exceeds the configurable STR threshold (default US$10,000): the backend silently creates an STR alert. The API response to the dealer must not indicate that an STR was generated.
- If `is_acting_for_another` is true, beneficial owner details are required (see Module 4.6)
- Buyer records are reused if a buyer with the same `national_id` already exists

**Frontend Views:**
- Route: `/dealer/sales/new`
- Multi-step wizard:
  - Step 1: Select vehicle from inventory
  - Step 2: Enter buyer details (full name, national ID, contact)
  - Step 3: Payment details + beneficial ownership toggle ("Buying on behalf of someone else?" checkbox that conditionally renders beneficial owner fields)
  - Step 4: Review all details before submission
- The UI must NOT display any warning, alert, or visual indicator when a cash payment exceeds US$10,000
- Success state: confirmation with sale reference number

**Acceptance Criteria:**
- [ ] Incomplete sale submission is rejected with field-level errors
- [ ] Vehicle status updates to SOLD after successful sale
- [ ] Cash sale above threshold silently creates an STR (verify via FIU dashboard or database)
- [ ] Dealer UI shows no indication of STR creation
- [ ] Wizard enforces step completion before allowing progression

---

### 4.5 Suspicious Transaction Reporting (STR)

> SPEC.md Section 6.5

**Description:** Automated generation and FIU management of suspicious transaction reports. STRs are created by the backend — there is no direct creation endpoint.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/str-alerts` | FIU_ANALYST | List all STR alerts (paginated, filterable) |
| GET | `/api/v1/str-alerts/:id` | FIU_ANALYST | Get STR alert details with linked entities |
| PATCH | `/api/v1/str-alerts/:id/status` | FIU_ANALYST | Update alert status (review, dismiss, escalate) |

**Database Entity — `str_alerts`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| alert_type | VARCHAR(50) | NOT NULL |
| source_record_id | INT | NOT NULL |
| source_entity_type | VARCHAR(50) | NOT NULL |
| reason | TEXT | NOT NULL |
| severity | ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') | NOT NULL |
| status | ENUM('PENDING', 'UNDER_REVIEW', 'DISMISSED', 'ESCALATED') | NOT NULL, DEFAULT 'PENDING' |
| vehicle_id | INT | FK -> vehicles.id |
| dealership_id | INT | FK -> dealers.id |
| buyer_id | INT | FK -> buyers.id |
| transaction_value | DECIMAL(12,2) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Automated Trigger Rules:**
1. **Cash threshold:** `payment_type === 'CASH' && sale_price > STR_THRESHOLD` (default: US$10,000)
2. **Price disparity:** Significant difference between `declared_value` (import) and `sale_price` (sale), exceeding a configurable percentage threshold
3. **Nominee pattern:** Same `buyer_id` appears in 3+ purchases within a configurable window (default: 90 days)
4. **Rapid resale:** Same vehicle is sold again within a short period after being re-imported or transferred
5. **High cash volume:** A single dealership records an unusually high volume of cash transactions within a rolling period

Each trigger rule should be implemented as a discrete, testable function. When a sale is recorded, the backend evaluates all applicable rules and creates an STR for each that fires.

**Frontend Views:**
- Route: `/fiu/alerts`
- Alert queue: sortable, filterable table/cards
- Filters: alert type, severity, status, dealership, date range, transaction value range
- Detail view: links to the source sale transaction, vehicle, dealership, and buyer records
- Status update: dropdown to change status (UNDER_REVIEW, DISMISSED, ESCALATED) with a required reason

**Acceptance Criteria:**
- [ ] Each of the five trigger rules independently produces an alert when conditions are met
- [ ] Multiple rules firing on the same sale produce multiple distinct alerts
- [ ] FIU can filter alerts by type, severity, status, dealership, and date range
- [ ] FIU can update alert status with a required reason
- [ ] STR creation is invisible to the dealer role

---

### 4.6 Beneficial Ownership & Nominee Detection

> SPEC.md Section 6.6

**Description:** Captures beneficial ownership information when a buyer acts on behalf of another person, and detects potential nominee buyer patterns.

**Backend API Endpoints:**

Beneficial owner data is submitted as part of the sale transaction (Module 4.4). No separate creation endpoint.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/buyers/:id/beneficial-owners` | FIU_ANALYST | List beneficial owners linked to a buyer |
| GET | `/api/v1/nominee-flags` | FIU_ANALYST | List flagged potential nominee buyers |

**Database Entity — `beneficial_owners`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| linked_buyer_id | INT | FK -> buyers.id, NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| national_id | VARCHAR(50) | NOT NULL |
| relationship_type | VARCHAR(100) | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Business Rules:**
- When `is_acting_for_another` is true on a sale, the beneficial owner fields (`full_name`, `national_id`, `relationship_type`) are required
- Nominee detection: a buyer appearing in 3 or more high-value purchases within a 90-day window is flagged (thresholds are configurable)
- Nominee flags surface as a distinct alert type in the STR system (alert_type: `NOMINEE_PATTERN`)
- Detection can run as a scheduled query or be evaluated at sale-time

**Frontend Views:**
- Beneficial owner fields are part of the Sales Wizard (Module 4.4, Step 3)
- Nominee flags appear in the FIU dashboard alongside other STR alerts
- FIU can view a buyer's purchase history and linked beneficial owners from the alert detail view

**Acceptance Criteria:**
- [ ] Sale with `is_acting_for_another = true` requires beneficial owner fields
- [ ] Sale with `is_acting_for_another = true` but missing beneficial owner fields is rejected
- [ ] Buyer with 3+ high-value purchases within 90 days generates a nominee flag alert
- [ ] Nominee flags are visible to FIU alongside other STR alerts

---

### 4.7 CVR Registration Control

> SPEC.md Section 6.7

**Description:** CVR officers verify a vehicle's complete chain before approving it for road registration. Registration is blocked if any link in the chain is missing.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/registration/search?vin=X&ref=Y` | CVR_OFFICER | Search for a vehicle by VIN or transaction reference |
| POST | `/api/v1/registration/approve` | CVR_OFFICER | Approve registration for a validated vehicle |

**Database Entity — `registration_records`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| vehicle_id | INT | FK -> vehicles.id, NOT NULL |
| buyer_id | INT | FK -> buyers.id, NOT NULL |
| officer_id | INT | FK -> users.id, NOT NULL |
| registration_date | DATE | NOT NULL |
| status | ENUM('APPROVED', 'BLOCKED') | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Validation Chain:**
The search endpoint must evaluate and return the status of each link:

1. **ZIMRA import log exists** — vehicle has an import record
2. **Registered dealer trail** — the vehicle's dealership has/had ACTIVE status
3. **Valid sale record exists** — a completed sale transaction is linked to this vehicle
4. **Buyer identity match** — the CVR officer inputs the requester's national ID, which must match the `national_id` of the buyer in the linked sale record

All four checks must pass for registration to be approved. If any check fails, the response must indicate exactly which check failed and why.

**Business Rules:**
- The search endpoint is read-only and does not modify any data
- The approve endpoint verifies all four checks server-side before creating the registration record (do not trust the frontend's validation result)
- On successful approval: vehicle status changes to `REGISTERED`
- A vehicle that is already `REGISTERED` cannot be registered again

**Frontend Views:**
- Route: `/cvr/register`
- "Search-first" layout: large, centered search bar accepting VIN or transaction reference
- A secondary input field for the requester's national ID (used for buyer identity match check)
- Results panel displays a "Traffic Light" UI:
  - **Green:** All four checks pass. Renders a checklist with green checkmarks and an "Approve Registration" button.
  - **Red:** One or more checks fail. Renders a `BLOCKED` banner with the exact missing link (e.g., "Missing valid sale record from approved dealership").
- Checklist items: `ZIMRA Import Log`, `Dealer Trail`, `Valid Sale Record`, `Buyer Match`

**Acceptance Criteria:**
- [ ] Vehicle with complete chain shows green traffic light with all four checks passed
- [ ] Vehicle missing any chain link shows red traffic light with specific failure reason
- [ ] Registration approval changes vehicle status to REGISTERED
- [ ] Already-registered vehicle cannot be re-registered
- [ ] Approve endpoint re-validates all four checks server-side regardless of frontend state

---

### 4.8 FIU Oversight & Monitoring Dashboard

> SPEC.md Section 6.8

**Description:** Read-only command center for FIU analysts to monitor all system activity, review alerts, and identify patterns.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/fiu/dashboard-stats` | FIU_ANALYST | Aggregate statistics for dashboard widgets |
| GET | `/api/v1/fiu/vehicles` | FIU_ANALYST | Search/list all vehicles (paginated, filterable) |
| GET | `/api/v1/fiu/sales` | FIU_ANALYST | Search/list all sales (paginated, filterable) |
| GET | `/api/v1/fiu/dealers` | FIU_ANALYST | Search/list all dealers (paginated, filterable) |
| GET | `/api/v1/fiu/trends` | FIU_ANALYST | Time-series data for trend charts |

All FIU endpoints are read-only. No create, update, or delete operations.

**Database Entities:**
No new tables. All endpoints read from existing tables with aggregation queries.

**Dashboard Stats (widget data):**
- Active STR count (status: PENDING or UNDER_REVIEW)
- Total vehicles imported this month
- Total licensed (ACTIVE) dealerships
- High-risk nominee flags count

**Business Rules:**
- FIU has read access to all data across all modules
- FIU cannot modify any records except STR alert status (handled in Module 4.5)
- All list endpoints support server-side pagination, sorting, and filtering
- Filters: dealership, buyer, VIN, date range, payment type, risk status, transaction value

**Frontend Views:**
- Route: `/fiu/dashboard`
- Layout per DESIGN.md Section 4:
  - **Top bar:** Global search, user profile, system status
  - **Left sidebar:** Dashboard, STR Alerts (with notification badge), Dealership Registry, Vehicle Search, Audit Logs
  - **Main content area:**
    - Top row: Stat widgets (Active STRs in crimson, Monthly Imports, Licensed Dealers, Nominee Flags)
    - Middle: STR Alert Queue — most recent alerts with columns: Alert ID, Date, Dealership, Value (US$), Trigger Reason, Status, Action (Review button)
    - Bottom: Trend chart showing import volumes vs. registered sales over time
- Data grids must use server-side pagination, sorting, and filtering to handle large datasets
- Consider real-time polling or WebSocket connections to surface incoming STRs immediately

**Acceptance Criteria:**
- [ ] Dashboard stats reflect current system state accurately
- [ ] All data grids support pagination, sorting, and filtering
- [ ] FIU can filter by dealership, buyer, VIN, date range, payment type, risk status, and value
- [ ] No write operations are available to FIU except STR status changes
- [ ] Trend chart displays import vs. sale volumes over a selectable time range

---

### 4.9 Audit & Compliance

> SPEC.md Section 6.9

**Description:** Searchable audit trail of all system actions with export capability for compliance reporting.

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/audit-logs` | FIU_ANALYST, ADMIN | Search/list audit logs (paginated, filterable) |
| GET | `/api/v1/audit-logs/export` | FIU_ANALYST, ADMIN | Export audit logs as CSV |

**Database Entity — `audit_logs`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| user_id | INT | FK -> users.id, NOT NULL |
| role | VARCHAR(50) | NOT NULL |
| action | ENUM('CREATE', 'UPDATE', 'DELETE') | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | INT | NOT NULL |
| before_value | JSON | NULL |
| after_value | JSON | NULL |
| reason | TEXT | NULL |
| timestamp | DATETIME | NOT NULL |
| created_at | DATETIME | NOT NULL |

**Business Rules:**
- Audit logs are populated by the cross-cutting audit middleware (Section 3.4) — not by individual modules
- No update or delete endpoints exist for audit logs — they are immutable
- Filters: user, role, action type, entity type, date range
- Export produces a CSV file with all columns

**Frontend Views:**
- Route: `/admin/audit-logs` and `/fiu/audit-logs`
- Searchable, filterable data table
- Columns: Timestamp, User, Role, Action, Entity Type, Entity ID, Reason
- Expandable row detail showing before/after values
- Export button triggers CSV download

**Acceptance Criteria:**
- [ ] Every create, update, and soft-delete across all modules has a corresponding audit entry
- [ ] Audit logs cannot be modified or deleted via any API endpoint
- [ ] Filters work correctly: user, role, action, entity type, date range
- [ ] CSV export includes all audit log fields

---

## 5. User Management

> SPEC.md Section 7 — `users` entity

**Database Entity — `users`:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, auto-increment |
| full_name | VARCHAR(255) | NOT NULL |
| role | ENUM('ZIMRA_OFFICER', 'DEALER', 'CVR_OFFICER', 'FIU_ANALYST', 'ADMIN') | NOT NULL |
| agency | VARCHAR(100) | NOT NULL |
| username | VARCHAR(100) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| dealership_id | INT | FK -> dealers.id, NULL (only set for DEALER role) |
| status | ENUM('ACTIVE', 'INACTIVE') | NOT NULL, DEFAULT 'ACTIVE' |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Backend API Endpoints:**

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Authenticate and receive JWT |
| POST | `/api/v1/users` | ADMIN | Create a new user |
| GET | `/api/v1/users` | ADMIN | List all users (paginated) |
| PATCH | `/api/v1/users/:id` | ADMIN | Update user details or status |

**Business Rules:**
- Passwords must be hashed using a strong algorithm (bcrypt or argon2)
- `DEALER` role users must be linked to a `dealership_id`
- Only `ADMIN` can create, modify, or deactivate users
- Deactivated users cannot log in

---

## 6. Testing & Validation Strategy

### Backend Testing

- Each module's business rules should have unit tests:
  - VIN format validation (17 chars, no I/O/Q)
  - Cash threshold STR trigger
  - CVR four-step validation chain logic
  - Nominee pattern detection
- API endpoints should have integration tests verifying:
  - Authorized roles succeed, unauthorized roles receive `403`
  - Required field validation returns `422` with field-level errors
  - Business rule enforcement (e.g., suspended dealer cannot create a sale)
- Database constraints should be tested: unique VIN, foreign key integrity, enum values

### Frontend Testing

- Shared component tests: Status Badge renders correct color per status, Audit Reason Modal blocks submission without a reason
- Route guard tests: each role can only access their designated routes
- Form validation tests: VIN format, required fields, conditional beneficial owner fields
- Sales wizard: verify the UI does not display any STR-related indication on cash sales above threshold

### End-to-End Validation

The golden path from SPEC.md Section 8 must work as a complete flow:

1. ZIMRA officer logs a vehicle at the border -> vehicle appears in the dealer's inventory
2. Dealer records a sale with buyer details -> vehicle status becomes SOLD
3. Cash sale above US$10,000 -> STR auto-created and visible to FIU (not visible to dealer)
4. CVR officer searches VIN -> green traffic light, all four checks pass, approves registration
5. FIU dashboard reflects all data: the vehicle, the sale, the STR alert, the registration

Each step's failure mode should also be tested:
- CVR search on a vehicle with no sale record -> red traffic light, "Missing valid sale record"
- Sale attempt on a vehicle not in inventory -> rejected
- Sale attempt by a suspended dealer -> rejected

### Security Validation

- No role can access another role's endpoints (test every endpoint with every role)
- Expired JWT forces re-authentication
- Audit logs cannot be modified or deleted via any endpoint
- SQL injection and XSS protections are in place on all input fields

---

## 7. Environment & Configuration

### Development Setup

- Backend requires a Node.js runtime and a MySQL database instance
- Frontend requires a Node.js runtime for the build toolchain
- Environment variables should be configured via `.env` files (never committed to source control)

**Required Environment Variables:**

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRY` | Token expiry duration (e.g., `1h`) |
| `STR_CASH_THRESHOLD` | Cash amount triggering STR (default: `10000`) |
| `NOMINEE_WINDOW_DAYS` | Days for nominee detection window (default: `90`) |
| `NOMINEE_MIN_PURCHASES` | Minimum purchases for nominee flag (default: `3`) |
| `PRICE_DISPARITY_PERCENT` | Percentage threshold for price disparity alerts |

### Seed Data

A seed script should exist to populate the database with:
- The five roles and a default `ADMIN` user
- Sample dealerships in various statuses (ACTIVE, SUSPENDED)
- Sample vehicles, sales, and STR alerts for development and testing

### Production Considerations

- HTTPS enforced for all traffic (encrypted in transit per SPEC.md Section 9)
- Database encryption at rest
- Rate limiting on authentication endpoints
- CORS configured to allow only the frontend origin
- JWT refresh token rotation for session management
