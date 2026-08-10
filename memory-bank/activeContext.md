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
We are beginning **Epic 3: Fully Automated Cloud Operations** and **Epic 4: State-Serialized HITL Command Center**.
Our focus is:
1. Creating specialized `gcp-agent` subagent:
   - Author standard Terraform configurations inside `gcp-agent` templates.
   - Implement real project creation and workspace VM provision commands.
2. Building the Supabase-backed HITL (Human-in-the-loop) queue to intercept high-risk operations and provide a real-time admin queue.

---

## Recent Changes

- **2026-08-10**: Designed and implemented the unified **`src/lib/workspace.ts`** client and specialized **`workspace-agent`** subagent with three expert tools: `send-gmail`, `post-gchat`, and `schedule-calendar`.
- **2026-08-10**: Configured **Interactive Notification Preference Prompting** inside `agent/instructions.md` directing Osprey to query the user for communication channels (Email, Chat, or Both) and follow up immediately.
- **2026-08-10**: Resolved the Jira subagent hanging bug (Epic 6) by implementing robust Atlassian ADF empty-text fallback protections and 10-second `AbortController` fetch timeouts inside `src/lib/jira.ts`.
- **2026-08-10**: Authored a consolidated integration pre-flight test runner at `scripts/diagnose.ts` and clean-up 6 obsolete scratch files under `/scratch` and `/scripts` to eliminate code clutter.

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

### Identified Technical Debt & Hardening Opportunities:
1. **Google REST/Webhook Timeout Safety**: While we integrated 10s fetch timeouts on Jira REST operations, the Google Workspace integration (such as Google Chat webhooks) currently lacks custom fetch timeout bounds. This should be hardened.
2. **Support Metadata Enums**: Support ticket category maps and severity tags are currently handled as plain strings across components. Migrating to shared enums will improve TypeScript validation robustness.

---

## Open Questions

- *Are there specific billing account IDs or parent organization IDs on your personal GCP console that we should note for our upcoming `.env.example` blueprint configuration?* (We will provide instructions for adding these variables during credentials setup).

