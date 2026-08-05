# Osprey Helpdesk: Project-Specific Workflow Rules

These rules are specific to the `osprey-helpdesk` project and complement the general Memory Bank workflow defined in `.clinerules/memory-bank.md`.

## Source of Truth

- The original Product Requirements Document and task breakdown that seeded this Memory Bank were `prd-osprey-helpdesk.md` and `tasks-prd-osprey-helpdesk.md` at the project root. These have been superseded and removed — their content now lives in `memory-bank/projectbrief.md`, `memory-bank/productContext.md`, `memory-bank/systemPatterns.md`, and `memory-bank/progress.md`.
- `memory-bank/progress.md` is the authoritative, living task tracker. Follow its increments **in order** (1.0 → 6.0) unless the user explicitly directs otherwise. Do not skip ahead to later increments before earlier ones are functionally complete and verified.
- Each increment in `progress.md` ends with a "Browser Verification" step and a "Git Milestone" commit message suggestion. When an increment's implementation is complete, prompt the user to verify in-browser before considering it done, and suggest the corresponding commit message.

## Architecture Conventions (from systemPatterns.md / techContext.md)

- This project uses Vercel's **Eve** SDK (`eve` package) with the `withEve()` wrapper in `next.config.ts` to run the Next.js app and the Eve agent runtime in one unified `npm run dev` process.
- Agent code lives under `agent/` at the project root (NOT under `src/`):
  - `agent/agent.ts` — root supervisor `defineAgent` config.
  - `agent/instructions.md` — supervisor system prompt.
  - `agent/channels/eve.ts` — auth channel config (`vercelOidc`, `localDev`).
  - `agent/subagents/<name>/agent.ts`, `instructions.md`, `tools/*.ts` — specialized child agents (e.g., `jira-agent`, `workspace-agent`).
- Frontend code lives under `src/app/` using the Next.js App Router.
  - `/portal` — employee-facing chat UI (`useEveAgent` hook from `eve/react`).
  - `/dashboard/hitl` — IT Admin real-time command center (restricted to `IT_Admin` Clerk role).
- Authentication is handled by Clerk (`@clerk/nextjs`). Role is read from `user.publicMetadata.role` (`"IT_Admin"` vs. default employee). `src/middleware.ts` protects `/portal`, `/dashboard`, and `/api/agent/resume`.
- High-risk tool calls must use Eve's native `needsApproval` property on `defineTool` to trigger durable HITL suspension — do NOT build a custom pause/resume mechanism from scratch; use Eve's built-in primitive.
- HITL transactions and immutable audit logs are persisted in Supabase (`hitl_transactions`, `audit_logs` tables) per the schema in `memory-bank/systemPatterns.md`. Realtime subscriptions drive the live admin queue.
- Local development should support `API_MODE=MOCK` to bypass live Jira/Google Workspace integrations via `src/lib/utils/mockAdapters.ts`.

## Design System

- Colors: NOAA Dark Blue `--primary` (`#003087`), Process Light Blue `--secondary` (`#0085CA`), Osprey Amber `--accent` (`#FF9F1C`), white/light-gray backgrounds.
- Typography: Google Font `Lato`.

- Use `shadcn/ui` + Tailwind + `lucide-react` icons. Use `@tanstack/react-table` for the admin approval queue.
- Osprey Amber pulsing badges indicate active sub-agent invocation in the chat UI.

## Security Guardrails

- Every user prompt path through the supervisor agent should be screened for prompt injection / scope-escalation attempts (see `agent/instructions.md` guardrail directives). Preserve and extend these guardrails rather than removing them.
- Administrative routes/actions (e.g., `/api/agent/resume`) must re-validate the caller's Clerk role server-side, never trust client-supplied role claims alone.

## Memory Bank Maintenance for This Project

- After completing any subtask from `memory-bank/progress.md`, check it off and add a short note under "Recent Changes" in `activeContext.md`.
- If PRD-level scope changes (new requirements, removed features), update `projectbrief.md` and `productContext.md` accordingly and note the change in `activeContext.md`.
- Do not recreate `prd-osprey-helpdesk.md` or `tasks-prd-osprey-helpdesk.md` at the project root — the Memory Bank is now the single source of truth going forward.
