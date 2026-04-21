# AGENTS.md — Backend Implementation Instructions

You are building the **backend** of VARMS (Vehicle Asset Registry and Monitoring System).

## Scope

**You are responsible for the Node.js backend and MySQL database only.** Do not create, modify, or scaffold any frontend code, Vue components, or UI assets. Assume the frontend will be built separately and will consume your API according to the contracts defined in the documentation.

## Reference Documents

Read these files before starting any work:

- `docs/AGENT.md` — Primary implementation guide. Contains the architecture overview (Section 2), cross-cutting concerns including API conventions, database conventions, RBAC, and audit logging (Section 3), all module definitions with endpoint contracts, database entities, and business rules (Section 4), user management (Section 5), testing strategy (Section 6), and environment configuration (Section 7).
- `docs/SPEC.md` — Full system specification. Use this for understanding business context, user roles, workflows, business rules, and acceptance criteria when the implementation guide references it.
- `docs/DESIGN.md` — UI/UX design direction. You do not need to implement any UI, but reference this to understand the frontend's expectations of API behavior (e.g., the silent STR trigger must not leak information in the API response to dealers).

## Key Backend Constraints

- **Stack:** Node.js REST API with MySQL database
- **API versioning:** All endpoints under `/api/v1/` — see `docs/AGENT.md` Section 3.3 for the response envelope format
- **Database:** All tables use `snake_case`, include `created_at`/`updated_at` timestamps, enforce foreign keys — see `docs/AGENT.md` Section 3.2
- **Auth:** JWT-based with five roles (`ZIMRA_OFFICER`, `DEALER`, `CVR_OFFICER`, `FIU_ANALYST`, `ADMIN`). Middleware validates tokens and enforces role-based access on every endpoint — see `docs/AGENT.md` Section 3.1
- **Audit logging:** Implement as middleware that automatically logs every create, update, and soft-delete. Individual modules must not handle audit logging manually — see `docs/AGENT.md` Section 3.4
- **STR generation:** Silent and automatic. When a sale meets trigger conditions, create the STR server-side. The API response to the dealer must not indicate an STR was created — see `docs/AGENT.md` Section 4.5
- **CVR validation:** The approve endpoint must re-validate all four chain checks server-side regardless of what the frontend sends — see `docs/AGENT.md` Section 4.7
- **Seed script:** Provide a seed script for development data — see `docs/AGENT.md` Section 7
- **Environment variables:** All configurable thresholds (STR cash limit, nominee window, price disparity percent) must come from environment variables, not hardcoded values — see `docs/AGENT.md` Section 7
