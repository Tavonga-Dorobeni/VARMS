# CLAUDE.md — Frontend Implementation Instructions

You are building the **frontend** of VARMS (Vehicle Asset Registry and Monitoring System).

## Scope

**You are responsible for the Vue.js frontend only.** Do not create, modify, or scaffold any backend code, database schemas, or API server files. Assume the backend API already exists and conforms to the contracts defined in the documentation.

## Reference Documents

Read these files before starting any work:

- `docs/AGENT.md` — Primary implementation guide. Contains the architecture overview (Section 2), cross-cutting concerns including shared components and design tokens (Section 3), all module definitions with frontend views, routes, and acceptance criteria (Section 4), and the module dependency graph for build order.
- `docs/DESIGN.md` — UI/UX design direction. Contains the color palette, typography, role-specific UX strategies (ZIMRA speed-focused forms, Dealer guided wizards, CVR traffic-light validation, FIU command-center dashboard), and interaction design principles.
- `docs/SPEC.md` — Full system specification. Use this for understanding business context, user roles, workflows, and acceptance criteria when the other documents reference it.

## Key Frontend Constraints

- **Stack:** Vue.js single-page application
- **Route groups:** `/zimra/*`, `/dealer/*`, `/cvr/*`, `/fiu/*`, `/admin/*` — lazy-loaded per role
- **Auth:** JWT-based. Store tokens securely. Handle `401` (force logout) and `403` (access denied redirect) globally.
- **API base:** All backend endpoints are under `/api/v1/` — see `docs/AGENT.md` Section 3.3 for response envelope format and Section 4 for per-module endpoint contracts
- **Shared components to build first:** Lifecycle Breadcrumb, Status Badge, Audit Reason Modal — see `docs/AGENT.md` Section 3.5
- **Design tokens:** See `docs/AGENT.md` Section 3.6 for colors, typography, and numeric display rules
- **Silent STR rule:** The dealer UI must NOT display any warning or indicator when a cash sale exceeds US$10,000 — see `docs/AGENT.md` Section 4.4
- **Keyboard accessibility:** ZIMRA and CVR forms must be fully navigable with Tab and Enter keys
