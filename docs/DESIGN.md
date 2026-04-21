# Design Direction

1. Brand Identity & Visual Language
Since VARMS is a centralized government platform with Financial Intelligence Unit (FIU) oversight, the branding must immediately communicate authority, security, and modernity. It shouldn't feel like legacy government software; it should feel like a modern, enterprise-grade banking or compliance tool.

Brand Archetype: The Guardian / The Auditor. Authoritative, secure, transparent, and efficient.

Color Palette:

Primary (Authority & Trust): Deep Navy Blue or Slate Gray. This anchors the application, used for sidebars, primary navigation, and headers.

Background (Cleanliness): Off-White or Very Light Gray. Reduces eye strain for officers looking at screens all day.

Functional Accents (Subtle localized nods): You can use muted tones of the Zimbabwe national colors strictly for system statuses:

Forest Green: Success states, approved registrations, cleared vehicles.

Amber/Gold: Pending actions, dealership inventory status, warnings.

Crimson Red: STR alerts, blocked registrations, revoked licenses, critical errors.

Typography: Use a highly legible, modern sans-serif typeface designed for user interfaces and data density. Inter, Public Sans (specifically designed for government portals), or Roboto are excellent choices. They render numbers (like VINs and ID numbers) clearly.

Iconography: Sharp, solid, standard icons (e.g., Material Design or Phosphor Icons). Avoid playful or abstract icons. Use clear metaphors: a shield for FIU, a building for dealerships, a car for inventory, a stamp for CVR.

2. UX Strategy: Role-Based Architecture
VARMS serves vastly different stakeholders. The UX must be strictly compartmentalized. When a user logs in, the system should feel custom-built for their specific job.

A. ZIMRA Border Intake (The "Speed & Accuracy" UX)
Environment: Border posts, potentially noisy, high-pressure.

UX Focus: Speed of data entry.

Key Feature: A high-contrast, linear form. As soon as the VIN is typed, the system should auto-format it. Use large input fields. Allow for keyboard-only navigation (Tab to next field, Enter to submit) so officers don't have to rely on a mouse.

B. Dealerships (The "Guided Wizard" UX)
Environment: Private businesses, varying levels of tech-literacy.

UX Focus: Compliance by design. The interface must guide them to do the right thing and make it impossible to skip steps.

Key Feature: For the Sales Recording Module, use a Step-by-Step Wizard (e.g., Step 1: Vehicle Select -> Step 2: Buyer Details -> Step 3: Payment & BO -> Step 4: Review). If a cash payment exceeds US$10,000, the UI shouldn't alarm the dealer, but quietly trigger the STR backend while allowing the sale to complete smoothly.

C. CVR Officers (The "Traffic Light" UX)
Environment: Registry offices, citizen-facing.

UX Focus: Instant validation.

Key Feature: A "Search-First" dashboard. A massive search bar for VIN or Transaction ID. When searched, the UI should return a clear Green (Approved for Registration) or Red (Blocked) status, accompanied by a checklist showing the required chain (ZIMRA log ✓ -> Dealer log ✓ -> Valid Sale ✓).

D. FIU Analysts (The "Command Center" UX)
Environment: Investigative office.

UX Focus: Data density, pattern recognition, and filtering.

Key Feature: Data-rich tables with sticky headers, advanced filtering (by dealership, buyer, date, value), and visual heatmaps. STR alerts should be pushed to the top of the dashboard as actionable, clickable cards.

3. UI & Interaction Design Principles
To ensure the system meets your non-functional requirements (performance, scalability, integrity), the UI should adopt these principles:

Data Density vs. Scannability: For dealerships and ZIMRA, use generous whitespace to prevent data entry errors. For the FIU, use tighter data grids (tables) to display maximum information without endless scrolling.

Immutable Badges: Every vehicle should have a visual "Status Badge" attached to its record wherever it appears in the system. E.g., [Border Cleared], [In Dealer Inventory], [Sold - Pending Reg], [Registered], [STR Flagged].

Friction for Destructive Actions: Since critical records cannot be deleted (only versioned/edited), any attempt to alter an existing record (e.g., fixing a typo in a VIN) must require a pop-up modal demanding a "Reason for Edit," which feeds directly into the Audit Log.

Breadcrumbs: Because a vehicle moves through a lifecycle, display a visual timeline or breadcrumb trail at the top of a vehicle's detail page (e.g., ZIMRA -> Dealership -> Sale -> CVR) so any user can instantly see where the asset is in its lifecycle.

4. Key Screen Concept: The FIU Monitoring Dashboard
Based on your MVP requirements, this is the most complex screen. Here is how it should be structured:

Top Bar: Global search, User Profile, System Status.

Left Sidebar: Dashboard, STR Alerts (with notification badge), Dealership Registry, Vehicle Search, Audit Logs.

Main Content Area:

Top Row (Widgets): Quick stats: Active STRs (Red), Total Vehicles Imported This Month, Total Licensed Dealerships, High-Risk Nominee Flags.

Middle Section (The Alert Queue): A list of the most recent STRs requiring review. Columns: Alert ID, Date, Dealership, Value (US$), Trigger Reason (e.g., >$10k Cash), Action (Review Button).

Bottom Section (Trend Graph): A visual chart showing import volumes vs. registered sales, helping analysts spot market disparities.


# Frontend Implementation Guide: VARMS (Vehicle Asset Registry and Monitoring System)

**Document Purpose:** This guide serves as the foundational brief for frontend engineering teams tasked with building the VARMS user interface. It translates the system specifications and design directions into actionable development patterns, component architectures, and technical constraints.

---

## 1. Core Development Philosophy

VARMS is a mission-critical government compliance and monitoring tool. The frontend must prioritize **reliability, security, data integrity, and role-specific ergonomics** over flashy animations or experimental UI trends.

* **Strict RBAC (Role-Based Access Control):** The UI must dynamically adapt based on the JWT/Session claims. A ZIMRA officer should never download the FIU bundle, and vice versa. 
* **Accessibility (a11y) First:** Ensure WCAG 2.1 AA compliance. ZIMRA and CVR officers require robust keyboard navigation (e.g., `Tab` and `Enter` workflows) for high-speed data entry.
* **Friction by Design:** Destructive or mutative actions (like editing a VIN) must be intentionally difficult, requiring confirmation modals and audit-reason inputs.

---

## 2. Design System & Theming Tokens

Configure your CSS framework (e.g., Tailwind CSS, MUI, or styled-components) with the following foundational tokens.

### Typography
* **Font Family:** `Inter`, `Public Sans`, or `Roboto` (System UI fallback). 
* **Data Fields:** Use tabular numbers (e.g., `font-variant-numeric: tabular-nums;`) for VINs, IDs, and currency amounts to ensure decimal alignment in FIU data tables.

### Color Palette
* **Primary / Authority:** Deep Navy (`#0F172A`) — *Use for sidebars, active states, primary buttons.*
* **Background:** Off-White (`#F8FAFC`) — *Use for main application background to reduce glare.*
* **Surface:** Pure White (`#FFFFFF`) — *Use for cards, forms, and data tables.*
* **Semantic Status Colors:**
  * Success (Approved, Registered): Forest Green (`#166534`, bg: `#DCFCE7`)
  * Warning (Pending, Inventory): Amber (`#B45309`, bg: `#FEF3C7`)
  * Danger (STR Flag, Blocked, Error): Crimson (`#991B1B`, bg: `#FEE2E2`)

---

## 3. Global Reusable Components

Before building distinct modules, the team must engineer the following shared components to ensure consistency across the application.

### A. Lifecycle Breadcrumbs
A visual tracker indicating a vehicle's current state.
* **States:** `Border Entry` -> `Dealer Inventory` -> `Pending Sale` -> `CVR Registered`
* **Props:** `currentStage` (number/enum), `timestamp` (date string).

### B. Immutable Status Badges
Used universally across tables and detail views.
* **Props:** `status` (enum: CLEARED, INVENTORY, SOLD, REGISTERED, STR_FLAGGED), `size` (sm, md).
* **Behavior:** Renders the appropriate semantic color.

### C. The "Audit Reason" Modal
Whenever an `update` or `delete` (soft delete) action is triggered, this modal must intercept the API call.
* **Fields:** Required `textarea` for the justification.
* **Action:** Appends the justification to the payload sent to the backend.

---

## 4. Role-Specific Application Architecture

Implement lazy-loaded route boundaries for the four main user personas. 

### Route: `/zimra/*` (Border Intake)
* **Goal:** High-throughput data entry.
* **Implementation:** * Linear form structure.
  * Auto-capitalize and validate the VIN field instantly (17 alphanumeric characters, no I, O, or Q).
  * Auto-focus the next input field upon valid entry.

### Route: `/dealer/*` (Dealerships)
* **Goal:** Guided compliance.
* **Implementation:**
  * **Sales Wizard:** Use a multi-step form state machine (e.g., `react-hook-form` + `zod` for validation).
  * **Silent STR Triggers:** If `paymentMethod === 'CASH'` and `amount > 10000`, the frontend must *not* show a warning to the dealer. Submit the payload normally; the backend will generate the STR silently.
  * **Beneficial Owner Toggle:** A checkbox ("Buying on behalf of someone else?") that conditionally renders the Beneficial Owner form array.

### Route: `/cvr/*` (Registration Control)
* **Goal:** Instant verification.
* **Implementation:**
  * Centered, oversized search bar for VIN or Transaction Reference.
  * **Results Panel:** Must return a clear "Traffic Light" UI. 
    * *Green:* Renders a checklist of completed prerequisites and an "Approve Registration" button.
    * *Red:* Renders a large `Blocked` banner detailing the exact missing link (e.g., "Missing valid sale record from approved dealership").

### Route: `/fiu/*` (Oversight & Monitoring)
* **Goal:** Complex data analysis.
* **Implementation:**
  * Highly performant data grids (e.g., AG Grid or TanStack Table).
  * Server-side pagination, sorting, and filtering are mandatory to handle large datasets.
  * Real-time polling or WebSocket connections to surface incoming STRs immediately in the "Alert Queue" widget.

---

## 5. Security & State Management Handlers

* **Token Handling:** Store JWTs securely. Use HTTP-only cookies if supported by the backend architecture; otherwise, use short-lived access tokens in memory and rotating refresh tokens.
* **API Interceptors:** Configure global Axios/Fetch interceptors to handle `401 Unauthorized` (force logout) and `403 Forbidden` (redirect to an "Access Denied" page, do not fail silently).
* **Idempotency:** Prevent double-submissions on the ZIMRA intake and Dealership Sales forms by disabling submit buttons and showing loading spinners immediately upon click.

---

## 6. MVP Acceptance Checklist for Frontend QA

- [ ] Route guarding successfully redirects unauthorized roles attempting to access restricted URLs.
- [ ] ZIMRA entry form validates standard VIN formatting locally before API submission.
- [ ] Dealership Sales form successfully captures and structures Beneficial Owner data.
- [ ] Dealership UI does not visually alert the user when a >$10k cash transaction is entered.
- [ ] CVR dashboard properly renders the dependency checklist (Import -> Inventory -> Sale) upon searching a VIN.
- [ ] FIU tables support filtering by `Dealership`, `Date Range`, and `Alert Status`.
- [ ] All forms are fully navigable using only the `Tab` and `Enter` keys.