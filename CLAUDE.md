# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Official Documentation

**All authoritative project documentation is maintained exclusively under `docs/claude/`.**
Do not rely on other files in `docs/` — they are historical artifacts and may be outdated.

| Document | Purpose |
|----------|---------|
| [`docs/claude/PRD.md`](docs/claude/PRD.md) | Product requirements, feature scope, tech stack |
| [`docs/claude/ARCHITECTURE.md`](docs/claude/ARCHITECTURE.md) | MSA structure, services, data flow, key file paths |
| [`docs/claude/RULE.md`](docs/claude/RULE.md) | Coding conventions, forbidden patterns, build rules |
| [`docs/claude/MCP.md`](docs/claude/MCP.md) | MCP server config, tool list, usage rules |
| [`docs/claude/SKILL.md`](docs/claude/SKILL.md) | Available skills, trigger conditions, usage examples |
| [`docs/claude/AGENT.md`](docs/claude/AGENT.md) | Subagent types, parallel execution strategy |

When documentation needs updating, **only update files under `docs/claude/`** — never update legacy docs in `docs/`.

## Commands

```bash
# Full stack (frontend + all 3 microservices)
npm run dev:msa

# Frontend only
npm run dev:frontend

# Individual services
npm run dev:core        # port 3011
npm run dev:app         # port 3012
npm run dev:inspection  # port 3013

# Build
npm run build           # Next.js frontend
npm run build:services  # shared lib + all 3 services (build:shared must run first)

# First-time setup (install + build shared library)
npm run setup:local

# Code quality
npm run lint
npm run type-check

# Database (PostgreSQL, requires bash)
npm run db:init         # schema only
npm run db:init:sample  # schema + sample data
npm run db:status
npm run db:rollback
```

There are no test scripts defined in `package.json`.

## Architecture

### MSA Structure

The project is a monorepo with a Next.js frontend and 3 Express microservices sharing a common library:

```
shared/                     # @enterprise/shared — must build before services
services/
  core-service/   (3011)    # auth + admin (users, roles, menus, programs, codes, depts) + common
  app-service/    (3012)    # content (posts, boards, comments) + comm (mail, conversations)
  inspection-service/ (3013)# checksheet templates, inspections, offline sync
src/                        # Next.js 16 App Router frontend
database/                   # Liquibase migrations (PostgreSQL default, Oracle optional)
infrastructure/             # Docker Compose, Nginx, monitoring (Prometheus/Grafana/Loki)
```

Build order matters: `shared` → services (can be parallel).

### Frontend — Next.js App Router

All pages live under `src/app/[locale]/` for i18n routing. The root `/` redirects to `/en/login`.

**i18n:** `next-international` with URL-based locale routing (`/en/`, `/ko/`, `/zh/`, `/vi/`). Middleware is in `middleware.ts`. Translation files are in `src/lib/i18n/`. The `useI18n()` hook is used in client components; `getI18n()` in server components.

**State management:** Three React Contexts (no Redux/Zustand):
- `AuthContext` — user, access/refresh tokens, login state; tokens stored in `localStorage`
- `MenuContext` — navigation menu items fetched from core-service
- `PermissionContext` — RBAC permissions per program code

**API clients** (`src/lib/axios/index.ts`): Six lazily-initialized service-specific clients — `authApi`, `adminApi`, `contentApi`, `commonApi`, `commApi`, `inspectionApi` — each pointing to the correct service URL. In development these call services directly (hardcoded ports); in production they use relative paths through Nginx. The base URL logic lives in `src/lib/api/config.ts`. All clients share the same JWT interceptor pattern: inject `accessToken` from `localStorage`, auto-refresh on 401, redirect to `/en/login` on refresh failure.

**Path alias:** `@/` maps to `src/`.

**Component library:** MUI v6. Rich text editing via TipTap. Data grids via MUI X Data Grid Premium. Forms via React Hook Form + Zod. Charts via Recharts.

**`next.config.ts` note:** `output: 'standalone'` is intentionally disabled due to a Next.js 16 middleware bug.

### Microservices (Express + TypeScript)

Each service follows the same internal structure: `src/routes/`, `src/controllers/`, `src/services/` (business logic), `src/middleware/`. All use `ts-node-dev` for dev and compile with `tsc` for production. Swagger docs are available at `/api-docs` on each service port. Logging is handled by Winston (from `@enterprise/shared`).

### Database

PostgreSQL 16 is the default; Oracle 19c+ is optional. Schema managed by Liquibase (`database/changelog/`). Seed data split into `database/seed/required/` (always) and `database/seed/sample/` (dev/test). The shared library (`shared/src/database/`) owns the pg connection pool used by all services.

### Auth Flow

Login → core-service `/auth/login` → returns `accessToken` (short-lived) + `refreshToken` → both stored in `localStorage`. MFA is email-based; in dev mode the code appears in the server console. Auto-logout fires after 30 minutes of inactivity (`src/hooks/useAutoLogout.ts`). SSO login bypasses password via `ssoLogin()` in `AuthContext`.

### Permission System

Permissions are program-code based (e.g., `PROG-USER-MGMT`). Each role has a `role_program_mappings` entry with `can_view / can_create / can_update / can_delete` flags. Use `useDataGridPermissions(programId)` hook to get button visibility in list pages. The `programId` is typically resolved via `useProgramId()` which reads from the current route's menu config.
