# Active Context: Osprey AI-Powered Autonomous IT Helpdesk

## Current Work Focus

The project is at the **tail end of Increment 1.0** ("Core Shell, Auth, & Conversational Employee Portal") per `progress.md`. Scaffolding is now substantially more complete than earlier snapshots of this file described — the design system, base UI components, and portal chat integration all exist and have been verified to compile and render.

**What currently exists in the codebase:**
- `next.config.ts` wrapped with `withEve()`.
- `agent/agent.ts` — minimal `defineAgent` config (description + model `google/gemini-2.5-flash`).
- `agent/instructions.md` — supervisor operational directives (reception/triage, guardrails, delegation) already written, referencing `jira-agent` and `workspace-agent` (which don't exist as files yet).
- `agent/channels/eve.ts` — `vercelOidc()` + `localDev()` auth configured.
- `src/middleware.ts` — Clerk route protection for `/portal`, `/dashboard`, `/api/agent/resume`. **Fixed 2026-08-05**: was throwing `TypeError: auth(...).protect is not a function` at runtime; corrected to `clerkMiddleware(async (auth, req) => { await auth.protect(); })`. Verified via `tsc --noEmit` (clean) and a live `curl` to `/portal` (now returns Clerk's signed-out rewrite headers instead of throwing).
- `src/app/page.tsx` — role-based redirect (`IT_Admin` → `/dashboard/hitl`, else → `/portal`) plus a marketing/sign-in landing page for unauthenticated users.
- `src/app/portal/ChatInterface.tsx` and `src/app/portal/page.tsx` — **fully implemented**, not a stub, and **redesigned 2026-08-05** into a minimal, single-column, chat-first layout (no sidebar, no "suggested workflows"). Uses the real `useEveAgent` hook from `eve/react` exclusively (all prior hardcoded/mock chat logic removed), renders streaming `text`/`reasoning`/`file`/`authorization`/`dynamic-tool` message parts, shows an Osprey Amber pulsing badge/card for active subagent tool calls (including `approval-requested` state), and has a thin top header (Osprey mark, activity dot, new-chat icon button, Clerk `UserButton`).

- `src/app/layout.tsx` — wraps app in `<ClerkProvider>`, loads `Lato` via CSS `@import`, renders `<Toaster />` (sonner).
- `src/app/globals.css` — full NOAA/Osprey Amber token set (`--primary`, `--secondary`, `--accent`, sidebar tokens, chart tokens, dark mode variants) mapped into Tailwind v4 `@theme inline`, plus custom `.animate-pulse-glow` keyframe animation used for HITL/agent-activity affordances.
- `src/components/ui/*` — shadcn/ui base components already generated: `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `label`, `separator`, `sonner`, `table`, `tabs`. **Important**: generated against `@base-ui/react` primitives, not Radix UI — see `techContext.md` / `systemPatterns.md` for the implication.
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `src/app/style-guide/page.tsx` — **newly created (2026-08-05)**. Unauthenticated internal preview page rendering the full color palette, typography scale, all base components (buttons, badges/status indicators, form elements, cards, avatars, tabs, table, dialog) styled with the brand tokens. Verified to compile (`tsc --noEmit` clean) and render (`curl` → HTTP 200).

**Not yet started:** `agent/subagents/jira-agent/*`, `agent/subagents/workspace-agent/*`, Supabase setup, `/dashboard/hitl`, `/api/agent/resume`, `src/lib/utils/mockAdapters.ts`, guardrail tool, tests.

## Recent Changes

- **2026-08-05**: Created the Memory Bank (`memory-bank/*.md`) and `.clinerules/` (`memory-bank.md`, `project-workflow.md`), seeded from the project's PRD and task list.
- **2026-08-05**: Removed the root-level `prd-osprey-helpdesk.md` and `tasks-prd-osprey-helpdesk.md` files — their content is now fully absorbed into this Memory Bank (see `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`).
- **2026-08-05**: Fixed the Clerk middleware runtime crash (`auth().protect()` → `await auth.protect()`) blocking every protected route. Logged in `progress.md` Known Issues as fixed.
- **2026-08-05**: Built `src/app/style-guide/page.tsx`, a design-system preview page, to visually validate brand tokens and base components together in one place. Confirmed it compiles and renders (HTTP 200).
- **2026-08-05**: Updated `techContext.md` and `systemPatterns.md` to reflect the actual current dependency list (`@base-ui/react`, `class-variance-authority`, `clsx`, `next-themes`, `sonner`, `tailwind-merge`, `tw-animate-css`, `shadcn` CLI) and file tree (`src/lib/utils.ts`, `src/components/ui/*`, `src/app/style-guide/`), and to flag that this project's shadcn components target `@base-ui/react`, not Radix UI.
- **2026-08-05 (correction)**: On closer inspection (via `git show HEAD:src/app/portal/ChatInterface.tsx`), the *original* `ChatInterface.tsx` **did** contain a large hardcoded mock-response engine (`localMessages` state + `setTimeout`-based fake Jira/Workspace/security-guardrail replies keyed off substring matching on user input, e.g. `lowerText.includes("mouse")`), with a `try { await agent.submit?.(textToSend) } catch { ... }` fallback bolted on. My earlier note in this file claiming "no mock logic to scrap" was **incorrect** — it was based on an in-progress rewrite state, not the original committed file.
- **2026-08-05**: Per user design feedback, **fully rewrote `src/app/portal/ChatInterface.tsx`** to (a) remove 100% of the hardcoded mock/simulated response logic and the sidebar/"suggested workflows" UI, and (b) drive the entire experience off the real `useEveAgent` hook. New layout is a minimal, single-column, chat-first design (no sidebar): a thin top header (small Osprey mark, activity dot, "new chat" icon button, Clerk `UserButton`), a centered `max-w-2xl` message column with a ChatGPT-style centered empty-state greeting, and a floating rounded input pill fixed at the bottom. Verified real `EveDynamicToolPart`/`EveMessagePart`/`EveMessage` type shapes directly against `node_modules/eve/dist/src/client/message-reducer-types.d.ts` and `eve-agent-store.d.ts` before writing the render logic (message roles are only `"user"`/`"assistant"`; tool states are `input-streaming`/`input-available`/`approval-requested`/`approval-responded`/`output-available`/`output-error`/`output-denied`). Verified clean via `tsc --noEmit` and `eslint`.


## Next Steps

1. Finish verifying **Increment 1.0** end-to-end in-browser (a live human check, not just `curl`):
   - Log in via Clerk (keyless dev mode is currently active — note the dashboard claim-your-keys banner in server logs; not blocking for local dev).
   - Navigate to `/portal`, send a message, confirm a streamed reply from the unified dev server.
   - Visit `/style-guide` to sanity-check the design system visually.
2. Once 1.0 is verified in-browser by the user, proceed to **Increment 2.0** (Jira subagent + mock adapters) — do not skip ahead.
3. Follow the increment order strictly (1.0 → 6.0) as defined in `progress.md` unless the user explicitly directs otherwise.

## Active Decisions & Considerations

- **Google Workspace auth strategy**: Confirmed to use an **Osprey service account** (not per-user OAuth) for `send-gmail`, `post-gchat`, `schedule-calendar`. Exact implementation mechanics (how a service account credential is wired into an Eve tool) are still open — need to explore Eve's tool/auth capabilities before implementing Increment 3.0/5.0's workspace tools.
- **HITL implementation must use Eve's native `needsApproval`** — this was an explicit non-negotiable from the PRD and repeated in `.clinerules/project-workflow.md`. Do not build a custom suspend/resume mechanism.
- **Scope discipline**: Per the user, this project intentionally stays narrowly focused on showcasing (a) the Eve framework/stack and (b) how AI agents can help IT ops — resist scope creep into HR/payroll or complex local auto-remediation.
- **shadcn/ui primitive substitution**: This project's shadcn CLI config generates components against `@base-ui/react`, not Radix UI. Any new component work (hand-written or CLI-generated) must follow the existing `src/components/ui/*.tsx` patterns rather than assuming Radix APIs from general shadcn/ui familiarity.

## Important Patterns & Preferences

- Follow the file/folder conventions already established under `agent/` and `src/app/` exactly (see `systemPatterns.md`) — do not relocate agent code into `src/`.
- Use the increment structure in `progress.md` as the task tracker; check off subtasks as completed and note changes here.
- Prefer Eve-native primitives over custom infrastructure wherever an equivalent exists (subagent delegation, `needsApproval`, session/state persistence).
- Use `src/app/style-guide/page.tsx` as the reference/sandbox when introducing new brand-token or component usage before wiring it into a real screen.

## Learnings & Project Insights

- `AGENTS.md` warns that this project's pinned Next.js version (`16.3.0`) has breaking changes vs. typical training-data assumptions — check `node_modules/next/dist/docs/` before writing Next.js-specific code.
- Clerk's middleware API in this project's pinned SDK version expects `await auth.protect()` (the `auth` callback argument used directly, awaited), not the `auth().protect()` pattern that appears in older Clerk docs/training data. If new Clerk-related runtime errors appear, check the actual installed SDK's types/signatures rather than assuming older API shapes.
- This project's shadcn/ui setup is built on `@base-ui/react`, not Radix UI — component internals (props like `render`, primitive import paths) differ from the Radix-based shadcn/ui docs most training data reflects.
- The original PRD (`prd-osprey-helpdesk.md`) and task list (`tasks-prd-osprey-helpdesk.md`) have been deleted from the project root per user instruction; this Memory Bank is now the sole source of truth going forward. Do not recreate those files at the root.

## Open Questions

- What specific capabilities/limitations does the Eve framework impose on authenticating and executing actions via a Google Workspace service account?
- Are there specific Jira project keys, required custom fields, or issue types needed for the ticket creation tool (`create-issue.ts`)? Not yet specified — will need clarification before Increment 2.0's Jira tool implementation is finalized against a real Jira instance (mock mode unblocks initial dev regardless).
