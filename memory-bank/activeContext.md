# Active Context: Osprey AI-Powered Autonomous IT Helpdesk

## Current Work Focus

The project is at the **start of Increment 1.0** ("Core Shell, Auth, & Conversational Employee Portal") per `progress.md`. Scaffolding exists but the increment is not yet complete.

**What currently exists in the codebase:**
- `next.config.ts` wrapped with `withEve()`.
- `agent/agent.ts` — minimal `defineAgent` config (description + model `google/gemini-2.5-flash`).
- `agent/instructions.md` — supervisor operational directives (reception/triage, guardrails, delegation) already written, referencing `jira-agent` and `workspace-agent` (which don't exist as files yet).
- `agent/channels/eve.ts` — `vercelOidc()` + `localDev()` auth configured.
- `src/middleware.ts` — Clerk route protection for `/portal`, `/dashboard`, `/api/agent/resume`.
- `src/app/page.tsx` — role-based redirect (`IT_Admin` → `/dashboard/hitl`, else → `/portal`) plus a marketing/sign-in landing page for unauthenticated users.
- `src/app/portal/ChatInterface.tsx` and `src/app/portal/page.tsx` — portal chat scaffold exists but has not been verified against `useEveAgent` integration or styled per the NOAA/Osprey design tokens yet.
- `src/app/layout.tsx`, `src/app/globals.css` — base layout/styles, not yet confirmed to include `Outfit` font or shadcn/ui token setup.

**Not yet started:** `agent/subagents/jira-agent/*`, `agent/subagents/workspace-agent/*`, Supabase setup, `/dashboard/hitl`, `/api/agent/resume`, mock adapters, guardrail tool, tests.

## Recent Changes

- **2026-08-05**: Created the Memory Bank (`memory-bank/*.md`) and `.clinerules/` (`memory-bank.md`, `project-workflow.md`), seeded from the project's PRD and task list.
- **2026-08-05**: Removed the root-level `prd-osprey-helpdesk.md` and `tasks-prd-osprey-helpdesk.md` files — their content is now fully absorbed into this Memory Bank (see `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`).

## Next Steps

1. Verify/complete **Increment 1.0** per `progress.md`:
   - Confirm Tailwind + `Outfit` font + shadcn/ui token setup (NOAA Dark Blue / Process Light Blue / Osprey Amber).
   - Confirm `ChatInterface.tsx` correctly uses `useEveAgent` from `eve/react` with Clerk JWT headers.
   - Do a browser verification pass: log in via Clerk, navigate to `/portal`, send a message, confirm streamed reply.
2. Once 1.0 is verified, proceed to **Increment 2.0** (Jira subagent + mock adapters) — do not skip ahead.
3. Follow the increment order strictly (1.0 → 6.0) as defined in `progress.md` unless the user explicitly directs otherwise.

## Active Decisions & Considerations

- **Google Workspace auth strategy**: Confirmed to use an **Osprey service account** (not per-user OAuth) for `send-gmail`, `post-gchat`, `schedule-calendar`. Exact implementation mechanics (how a service account credential is wired into an Eve tool) are still open — need to explore Eve's tool/auth capabilities before implementing Increment 3.0/5.0's workspace tools.
- **HITL implementation must use Eve's native `needsApproval`** — this was an explicit non-negotiable from the PRD and repeated in `.clinerules/project-workflow.md`. Do not build a custom suspend/resume mechanism.
- **Scope discipline**: Per the user, this project intentionally stays narrowly focused on showcasing (a) the Eve framework/stack and (b) how AI agents can help IT ops — resist scope creep into HR/payroll or complex local auto-remediation.

## Important Patterns & Preferences

- Follow the file/folder conventions already established under `agent/` and `src/app/` exactly (see `systemPatterns.md`) — do not relocate agent code into `src/`.
- Use the increment structure in `progress.md` as the task tracker; check off subtasks as completed and note changes here.
- Prefer Eve-native primitives over custom infrastructure wherever an equivalent exists (subagent delegation, `needsApproval`, session/state persistence).

## Learnings & Project Insights

- `AGENTS.md` warns that this project's pinned Next.js version (`16.3.0`) has breaking changes vs. typical training-data assumptions — check `node_modules/next/dist/docs/` before writing Next.js-specific code.
- The original PRD (`prd-osprey-helpdesk.md`) and task list (`tasks-prd-osprey-helpdesk.md`) have been deleted from the project root per user instruction; this Memory Bank is now the sole source of truth going forward. Do not recreate those files at the root.

## Open Questions

- What specific capabilities/limitations does the Eve framework impose on authenticating and executing actions via a Google Workspace service account?
- Are there specific Jira project keys, required custom fields, or issue types needed for the ticket creation tool (`create-issue.ts`)? Not yet specified — will need clarification before Increment 2.0's Jira tool implementation is finalized against a real Jira instance (mock mode unblocks initial dev regardless).
