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
- `src/app/portal/ChatInterface.tsx` and `src/app/portal/page.tsx` — **fully implemented**, not a stub, and **redesigned 2026-08-05** into a minimal, single-column, chat-first layout (no sidebar, no "suggested workflows"). Enclosed inside a centered, fully-bordered `max-w-3xl` chat card with a strict, non-growing fixed height (`h-[82vh] min-h-[480px] max-h-[850px]`) vertically and horizontally centered in the viewport, featuring an automatic `ResizeObserver`-driven seamless scroll lock that snaps scroll positions smoothly (and instantly during active text streaming) when text is streaming near the bottom. Uses the real `useEveAgent` hook from `eve/react` exclusively (all prior hardcoded/mock chat logic removed), utilizing a custom `hasVisibleContent` filtering algorithm to prevent empty bot message rows or avatars from flashing/rendering before actual visible response text or tool cards arrive. Renders streaming `text`/`reasoning`/`file`/`authorization`/`dynamic-tool` message parts inside bubbles flanked by the user's actual Clerk profile picture and circular, dark-mode-safe Osprey character logos, shows an Osprey Amber pulsing badge/card for active subagent tool calls (including `approval-requested` state), and has a thin top header featuring the official brand logo, uppercase gradient brand lettering (`OSPREY`), activity status indicator, and Clerk `UserButton`.

- `src/app/layout.tsx` — wraps app in `<ClerkProvider>`, loads brand fonts via CSS `@import`, and sets up global custom theme variables & styles for Clerk inputs and primary buttons.
- `src/app/globals.css` — full NOAA/Osprey Amber token set (`--primary`, `--secondary`, `--accent`, sidebar tokens, chart tokens, dark mode variants) mapped into Tailwind v4 `@theme inline`, custom ambient background gradient drift keys (`.animate-moving-bg`), and bubble animations.
- `src/components/ui/*` — shadcn/ui base components already generated: `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `label`, `separator`, `sonner`, `table`, `tabs`. **Important**: generated against `@base-ui/react` primitives, not Radix UI — see `techContext.md` / `systemPatterns.md` for the implication.
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

**Not yet started:** `agent/subagents/jira-agent/*`, `agent/subagents/workspace-agent/*`, Supabase setup, `/dashboard/hitl`, `/api/agent/resume`, `src/lib/utils/mockAdapters.ts`, guardrail tool, tests.

## Recent Changes

- **2026-08-07**: Fully cleaned up and standardized project assets. Standardized high-fidelity branding logo to `/logo.svg` (and deleted legacy raw `/osprey-logo.svg`). Completely deleted `/style-guide` route per user request and cleaned up next-config redirects. Customized Clerk styling to a solid brand blue (`#005F9E`) with custom rounded-xl elements. Optimized landing page CTA buttons padding (`px-12`), sizing (`min-w-[220px]`), and optical text centering (via absolute icon offsets).
- **2026-08-06**: **Redesigned the landing page (`src/app/page.tsx`)** to match the design system. Replaced the off-brand dark `slate-950` layout (generic Tailwind blues/ambers) with a modern, clean, Material-leaning **light** page using brand tokens: Google-style animated gradient headline ("Osprey" in NOAA Dark Blue → Process Light Blue → Osprey Amber via new `.animate-gradient-text` utility), slow-drifting brand-tinted aurora background blobs (`.animate-aurora` / `.animate-aurora-slow`), a glass assist chip with pulsing amber dot, rounded-full Material CTAs using the shared `Button` component (Clerk `SignInButton`/`SignUpButton` modal wrappers preserved), and three Material surface feature cards (`--card`, tinted icon containers, hover lift). Auth redirect logic unchanged. New keyframes/utilities added to `globals.css` (with `prefers-reduced-motion` fallback) and previewed in a new "Animated Gradient" section on `/style-guide`. Verified: `tsc --noEmit` clean, `eslint` clean, live dev server serves the new page (HTTP 200, gradient markup present) and `/style-guide` (HTTP 200).

- **2026-08-06**: Created `.env.local` with the Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) sourced from the keyless-mode-generated `.clerk/.tmp/keyless.json`, moving off Clerk keyless dev mode. File is confirmed gitignored (`.env*` rule). Dev server must be restarted to pick up the env vars.
- **2026-08-06**: **Model credential saga (resolved via Vercel AI Gateway).** First attempt used the user's **Google Gemini API key from GCP** via Eve's direct/external provider mode (`@ai-sdk/google` + `model: google("gemini-2.5-flash")` + `GOOGLE_GENERATIVE_AI_API_KEY`). The code path worked, but **Google blocked the request at the GCP side** ("Requests to this API generativelanguage.googleapis.com … StreamGenerateContent are blocked") — likely NOAA org policy or key API restrictions. **Pivoted back to the gateway route per user decision**: reverted `agent/agent.ts` to `model: "google/gemini-2.5-flash"` (gateway id string), uninstalled `@ai-sdk/google`, removed the Google key from `.env.local`, and added an `AI_GATEWAY_API_KEY=REPLACE_WITH_YOUR_VERCEL_AI_GATEWAY_KEY` placeholder (user to create a key at vercel.com/dashboard/ai/api-keys and paste it in). `tsc --noEmit` clean. **Key learnings**: (1) `AI_GATEWAY_API_KEY` is strictly for Vercel AI Gateway keys; provider-native keys require the provider's AI SDK package and a `LanguageModel` instance in `defineAgent`. (2) The consumer `generativelanguage.googleapis.com` endpoint is blocked in the user's GCP org — direct-Google integration would require Vertex AI (`@ai-sdk/google-vertex`) if ever revisited.

## Next Steps

1. Finish verifying **Increment 1.0** end-to-end in-browser (a live human check, not just `curl`):
   - Log in via Clerk (keyless dev mode is currently active — note the dashboard claim-your-keys banner in server logs; not blocking for local dev).
   - Navigate to `/portal`, send a message, confirm a streamed reply from the unified dev server.
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
- Use existing core screens and the component UI templates in `src/components/ui` as standard references for new component/brand-token integration.

## Learnings & Project Insights

- `AGENTS.md` warns that this project's pinned Next.js version (`16.3.0`) has breaking changes vs. typical training-data assumptions — check `node_modules/next/dist/docs/` before writing Next.js-specific code.
- Clerk's middleware API in this project's pinned SDK version expects `await auth.protect()` (the `auth` callback argument used directly, awaited), not the `auth().protect()` pattern that appears in older Clerk docs/training data. If new Clerk-related runtime errors appear, check the actual installed SDK's types/signatures rather than assuming older API shapes.
- This project's shadcn/ui setup is built on `@base-ui/react`, not Radix UI — component internals (props like `render`, primitive import paths) differ from the Radix-based shadcn/ui docs most training data reflects.
- The original PRD (`prd-osprey-helpdesk.md`) and task list (`tasks-prd-osprey-helpdesk.md`) have been deleted from the project root per user instruction; this Memory Bank is now the sole source of truth going forward. Do not recreate those files at the root.

## Open Questions

- What specific capabilities/limitations does the Eve framework impose on authenticating and executing actions via a Google Workspace service account?
- Are there specific Jira project keys, required custom fields, or issue types needed for the ticket creation tool (`create-issue.ts`)? Not yet specified — will need clarification before Increment 2.0's Jira tool implementation is finalized against a real Jira instance (mock mode unblocks initial dev regardless).
