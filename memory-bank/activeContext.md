# Active Context: Osprey AI-Powered Autonomous IT Helpdesk

## Current Work Focus

The project is at a **100% real, live-integration architecture** across all components. All mock layers have been discarded in favor of actual integrations with your personal Jira Cloud, Google Workspace, and GCP Organization accounts.

Furthermore, we have expanded our frontend specifications to incorporate a **Glassmorphic Double-Sidebar Layout** on `/portal` to display previous conversations, live tickets, and real-time streaming AI reasoning/tool trace indicators.

**What currently exists in the codebase:**
- `next.config.ts` wrapped with `withEve()`.
- `agent/agent.ts` — supervisor agent configuration using `google/gemini-2.5-flash` via Vercel AI Gateway.
- `agent/instructions.md` — supervisor operational instructions directing triage, delegation, and security guardrails.
- `agent/channels/eve.ts` — same-origin auth channels.
- `agent/subagents/jira-agent/` — specialized Jira Specialist subagent files (`agent.ts`, `instructions.md`, `tools/search-tickets.ts`, `tools/create-issue.ts`) for duplicate ticket detection and support board creation.
- `src/middleware.ts` — Clerk edge route protection.
- `src/lib/jira.ts` — unified integration client supporting both `API_MODE=MOCK` and live Atlassian REST API HTTP calls with Atlassian Document Format.
- `src/app/portal/ChatInterface.tsx` and `src/app/portal/page.tsx` — employee conversational interface centered in the viewport, sized rigidly (`h-[82vh] min-h-[480px] max-h-[850px] max-w-3xl`) with responsive borders. Features a `ResizeObserver`-driven dual-mode scroll-lock that anchors instantly during active streaming, gradient uppercase branding (`OSPREY`), and custom `hasVisibleContent` checking that keeps bot message bubbles and large avatars from rendering until real response tokens or tool cards are ready.
- `src/app/layout.tsx` — layout setting up providers and Lato fonts.
- `src/app/globals.css` — custom variables, animated drifting background gradients, and text-clipping transitions.
- `src/components/ui/*` — high-density base components built on top of `@base-ui/react` primitives.

**Immediate Next Work Focus:**
We are beginning **Epic 2: Live Multi-Agent Systems** (Google Workspace subagent) and **Epic 3: Fully Automated Cloud Operations**.
Our focus is:
1. Creating specialized subagents:
   - `workspace-agent` — sending emails, calendar requests, and Google Chat room webhook alerts via real Google REST endpoints using `googleapis`.
   - `gcp-agent` — creating real GCP projects and executing local **Terraform child processes** (`child_process.exec`) to provision secure Compute science workstations.
2. Connecting these specialized subagent actions into the supervisor agent's instructions, ensuring the conversational core smoothly forwards requests to these sub-specialists and renders rich UI preview cards upon completions.

---

## Recent Changes

- **2026-08-08**: Secured ChatInterface's WebSocket connection headers using Clerk's `useAuth` active session JWT token, completing Epic 1.
- **2026-08-08**: Scaffolded the specialized **`jira-agent`** subagent (`agent.ts`, `instructions.md`) and authored standard subagent tools `search-tickets` and `create-issue`.
- **2026-08-08**: Authored a robust `src/lib/jira.ts` client supporting offline local development via `API_MODE=MOCK` and live, authenticated Atlassian API calls using v3 Atlassian Document Format payloads.
- **2026-08-08**: Expanded Epic 1 UX scope to incorporate the **Double-Sidebar Portal Layout**, adding User Story 1.4 (Left Sidebar Ticket & History Drawer) and User Story 1.5 (Right Sidebar AI Diagnostics Console).
- **2026-08-08**: Swapped the temporary guest WiFi passcode tool with a highly advanced, fully automated **GCP Project and Terraform Science Workstation Provisioning tool**, introducing a specialized **`gcp-agent`** subagent.
- **2026-08-09**: Designed and implemented the high-fidelity **Agent & Tool Activity Timeline** in `DiagnosticsConsole.tsx` replacing the text-only monologue.
- **2026-08-09**: Programmed fluid CSS flex transitions enabling the Agent & Tool Activity Timeline to expand up to **100% full panel height** on toggle, hiding the tickets grid cleanly.
- **2026-08-09**: Differentiated Left and Right sidebar header icons using distinct, semantic symbols (`History` and `ClipboardList` respectively).
- **2026-08-09**: Fixed the Jira search filtering gap by implementing **email-aware JQL queries** in `src/lib/jira.ts` (matching `reporter`, `creator`, or `assignee`) and updating `jira-agent/instructions.md` with explicit employee ownership guidelines.
- **2026-08-10**: Installed official `googleapis` SDK and implemented the unified **`src/lib/workspace.ts`** client supporting secure OAuth JWT impersonation for Gmail and Calendar.
- **2026-08-10**: Designed and scaffolded the specialized **`workspace-agent`** subagent (`agent.ts`, `instructions.md`) with three expert tools: `send-gmail`, `post-gchat`, and `schedule-calendar`.
- **2026-08-10**: Configured **Interactive Notification Preference Prompting** inside `agent/instructions.md` directing Osprey to query the user for communication channels (Email, Chat, or Both) and follow up immediately via `workspace-agent` upon task completions.

---

## Next Steps

1. **Epic 3 Setup (GCP + Terraform Core)**:
   - Construct specialized directory `agent/subagents/gcp-agent/`.
   - Author a base workstation Terraform template under `agent/subagents/gcp-agent/templates/workstation.tf`.
   - Implement real project creation calls using Google Cloud Resource Manager API, followed by spawning child shell execution scripts `terraform init && terraform apply -auto-approve` inside `/tmp`.
2. **Epic 4 Setup (Supabase Realtime HITL Queue)**:
   - Provision `hitl_transactions` and `audit_logs` SQL schemas in Supabase and enable real-time tracking streams.
   - Attach Eve's native `needsApproval` conditional intercepts halting high-risk tool calls.

---

## Active Decisions & Considerations

- **Local Terraform CLI Requirement**: Because we are executing real Terraform sub-processes, the local environment running the dev server must have the `terraform` CLI binary installed on its system `PATH`.
- **Organization-Level Service Account permissions**: The Google service account mapped in `.env.local` must possess Org-level IAM roles (Project Creator, Billing User) in order to programmatically set up projects and link billing nodes.
- **Cost Minimization**: All workstation VM configurations inside our Terraform templates will default strictly to minimal, cost-friendly node templates (such as `f1-micro` or `e2-micro`) to safeguard your personal GCP billing account from heavy development/testing charges.

---

## Open Questions

- *Are there specific billing account IDs or parent organization IDs on your personal GCP console that we should note for our upcoming `.env.example` blueprint configuration?* (We will provide instructions for adding these variables during credentials setup).
