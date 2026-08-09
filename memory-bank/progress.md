# Progress: Osprey AI-Powered Autonomous IT Helpdesk

This file is the **authoritative, living task tracker** for the project, mirroring our official backlog of **4 Epics and 14 User Stories**. All mocking layers are discarded in favor of **100% real, live integrations** using your personal accounts as staging endpoints. Check off subtasks as they are completed and keep this file in sync with actual implementation status.

## Relevant Files

- `next.config.ts` - Configures the `withEve` wrapper to bundle, deploy, and proxy the Next.js app and the Eve agent under a single development process.
- `agent/agent.ts` - Main supervisor configuration via `defineAgent`.
- `agent/instructions.md` - Main supervisor system instructions.
- `agent/channels/eve.ts` - Defines OIDC, localDev, and Clerk credentials checks for same-origin authentication.
- `agent/subagents/jira-agent/agent.ts` - Configuration file for Jira specialist agent.
- `agent/subagents/jira-agent/instructions.md` - Jira prompt and behavior guidelines.
- `agent/subagents/jira-agent/tools/search-tickets.ts` - Real Jira similarity matching JQL ticket search tool.
- `agent/subagents/jira-agent/tools/create-issue.ts` - Real Jira ticket creation tool.
- `agent/subagents/workspace-agent/agent.ts` - Configuration file for Google Workspace specialist agent.
- `agent/subagents/workspace-agent/instructions.md` - Workspace prompt guidelines.
- `agent/subagents/workspace-agent/tools/send-gmail.ts` - Real Gmail sending tool with conditional `needsApproval` configuration.
- `agent/subagents/workspace-agent/tools/post-gchat.ts` - Threaded Google Chat notification tool.
- `agent/subagents/workspace-agent/tools/schedule-calendar.ts` - Google Calendar search and support booking tool.
- `agent/subagents/gcp-agent/agent.ts` - Configuration file for GCP DevOps specialist agent.
- `agent/subagents/gcp-agent/instructions.md` - GCP prompt guidelines and workstation deployment constraints.
- `agent/subagents/gcp-agent/tools/provision-gcp-workstation.ts` - Real GCP project creator and Terraform execution tool.
- `src/app/layout.tsx` - Root layout setting up providers (Clerk, React Query/Eve) and global `Lato` typography.
- `src/app/page.tsx` - Main router forwarding users dynamically based on role claims.
- `src/app/portal/page.tsx` - Employee chat portal workspace utilizing `useEveAgent` client hooks.
- `src/app/dashboard/hitl/page.tsx` - IT Admin real-time Command Center.
- `src/app/api/agent/resume/route.ts` - Next.js Route Handler processing IT Admin decisions (Approve, Modify, Reject) and signaling Eve's running workflow.
- `supabase/migrations/20260805120000_init_hitl.sql` - Supabase schemas establishing transaction queues, immutable audit logs, and triggers.

---

## Tasks Backlog

### Epic 1: Portal & Conversational Core (Conversational UX)
*Goal: Provide a responsive, beautiful, single-column chat interface that establishes robust streaming connections to Vercel's Eve runtime, complemented by a collapsible left-side operational hub and right-side diagnostics panel.*

- [/] **User Story 1.1: Clerk-Authenticated Eve Conversation Stream**
  - [x] Configure Clerk SDK, wrapping the app layout in `<ClerkProvider>`.
  - [x] Author same-origin route protections inside `agent/channels/eve.ts` utilizing `localDev` and `vercelOidc`.
  - [x] Fix Clerk middleware runtime protect call (`await auth.protect()`).
  - [ ] Connect the dynamic Clerk JWT session token inside `ChatInterface.tsx` to secure client-to-agent socket headers.
- [x] **User Story 1.2: Bounded Floating Card with Seamless Scroll-Lock**
  - [x] Configure Google Font `Lato` as the primary typography.
  - [x] Setup `shadcn/ui` variables with the project palette (NOAA Dark Blue, Process Light Blue, and Osprey Amber).
  - [x] Build `ChatInterface.tsx` with a centered, rounded-2xl container and rigid responsive height (`h-[82vh] min-h-[480px] max-h-[850px]`).
  - [x] Remove the flashing "Osprey is thinking" loading bar and replace it with a seamless thinking bubble to prevent layout shifts.
  - [x] Filter out invisible setup messages via `hasVisibleContent` so the Osprey bot mascot avatar renders in perfect lockstep with the first streamed text token.
  - [x] Integrate a `ResizeObserver` auto-scrolling system with fast scrolling on active streams and smooth scrolling on finishers.
- [ ] **User Story 1.3: Rich Inline Message Preview Cards**
  - [ ] Build high-fidelity inline components inside `/portal` (e.g., `JiraTicketCard`, `GmailDraftCard`, `GcpWorkstationCard`).
  - [ ] Intercept finished tool payloads and map them to their corresponding card templates.
- [x] **User Story 1.4: Left Sidebar Ticket & History Drawer**
  - [x] Build a collapsible left-side drawer styled with rounded margins.
  - [x] Relocate "New Chat" trigger and wire session clearing hooks.
  - [x] Load chronological list of past employee sessions from Supabase.
  - [x] Build high-density tab switcher displaying active and resolved Jira support tickets.
- [x] **User Story 1.5: Right Sidebar AI Diagnostics Console**
  - [x] Build collapsible right-side drawer styled with a dark monospace terminal layout.
  - [x] Capture Eve's `reasoning` stream parts and display them as a live terminal stream.
  - [x] Integrate rotating orbital visualizers reflecting which subagent is actively queried.
  - [x] Provide expandable code-blocks displaying real Zod-validated tool parameters and JSON replies.

---

### Epic 2: Live Multi-Agent Systems & Credential Vault
*Goal: Implement file-based specialized subagents, write real-world SDK client integrations, and establish a secure credentials framework.*

- [x] **User Story 2.1: Jira Cloud Specialist Subagent (`jira-agent`)**
  - [x] Scaffold `agent/subagents/jira-agent/` sub-module files.
  - [x] Configure `search-tickets` tool to connect to real Jira Cloud REST APIs using JQL text matches.
  - [x] Configure `create-issue` tool to submit actual issues to your Jira Cloud workspace.
- [ ] **User Story 2.2: Google Workspace API Subagent (`workspace-agent`)**
  - [ ] Scaffold `agent/subagents/workspace-agent/` sub-module files.
  - [ ] Install official Google APIs SDK and configure service account authentications.
  - [ ] Implement `send-gmail` to dispatch real emails.
  - [ ] Implement `post-gchat` to send real Google Chat webhook threads.
  - [ ] Implement `schedule-calendar` to query and book real Google Calendar slots.
- [x] **User Story 2.3: Live Integration Credentials & Env Vault Setup**
  - [x] Create a comprehensive `.env.local` secure template and update `.env.example` in Git.
  - [x] Build a startup validator checks script to ensure all required API, Billing, and Org keys are present and correctly formatted.

---

### Epic 3: Fully Automated Cloud & Self-Service Operations (GCP & Terraform)
*Goal: Empower employees with direct, instant, fully autonomous fulfillment workflows—including highly complex GCP Org Project creation and actual Terraform workstation provisioning—utilizing real cloud sub-processes.*

- [ ] **User Story 3.1: Active Software License Database Operations**
  - [ ] Create PostgreSQL table `user_software_licenses` inside Supabase.
  - [ ] Implement `provision-software` to update Supabase seat structures autonomously for standard items.
  - [ ] Configure background triggers to automatically log Jira tickets and send Google Chat notifications.
- [ ] **User Story 3.2: GCP Workstation Project Generator & Terraform Execution**
  - [ ] Create specialized `gcp-agent` subagent files.
  - [ ] Write standardized Terraform `.tf` configurations inside `agent/subagents/gcp-agent/templates/workstation.tf` provisioning VPCs, IAM roles, and VM notebook endpoints.
  - [ ] Implement `provision-gcp-workstation` tool connecting to Google Cloud Resource Manager API to create real projects under your Organization billing node.
  - [ ] Wire Node's `child_process` module to safely execute shell commands: `terraform init && terraform apply -auto-approve` inside `/tmp`.
  - [ ] Render the GcpWorkstationCard featuring real Project IDs, external IPs, dynamic SSH connect keys, and Google Console workspace URLs.

---

### Epic 4: State-Serialized HITL Command Center (Supabase Realtime)
*Goal: Implement native workflow suspension on high-risk tools and build a live-updating, high-density dashboard for IT staff to inspect, edit, or reject pending operations.*

- [x] **User Story 4.1: Supabase Real-Time HITL Ledger SQL**
  - [x] Create Supabase database client interface.
  - [x] Execute migration script `supabase/migrations/20260805120000_init_hitl.sql` setting up transaction and immutable audit tables.
  - [x] Attach Postgres triggers blocking `UPDATE` or `DELETE` on the `audit_logs` table.
- [ ] **User Story 4.2: Live Suspended Workflow Interceptor**
  - [ ] Attach Eve's native `needsApproval` property to high-risk tools (external Gmail targets, calendar overrides, heavy GPU workstations).
  - [ ] Map conditional gates: write a `PENDING` transaction record to Supabase whenever a workflow is suspended.
- [ ] **User Story 4.3: Real-Time Admin Queue Command Center**
  - [ ] Scaffold `/src/app/dashboard/hitl/page.tsx` with Clerk administrative role guardrails.
  - [ ] Implement high-density Master Queue table utilizing `@tanstack/react-table`.
  - [ ] Wire Supabase Realtime channel subscription to append/update queue rows instantly as transactions stream.
- [ ] **User Story 4.4: Sliding JSON Inspector Panel & Next.js Resume API**
  - [ ] Build right-side sliding `InspectorPanel.tsx` detailing prompt histories and raw JSON payloads.
  - [ ] Implement a code editor block to modify raw JSON payloads with schema-validated controls.
  - [ ] Build Route Handler `/src/app/api/agent/resume/route.ts` validating administrative claims, checking schema parameters, and calling Eve's native resume function.

---

## Current Status

- **Active Epic**: Epic 2: Live Multi-Agent Systems & Credential Vault. The Jira specialist subagent (`jira-agent`) is 100% complete and fully verified with live JQL queries and ownership guidelines.
- **Ready for Next Step**: Implement the specialized Google Workspace subagent (`workspace-agent`) to support automated Gmail dispatches, Google Chat webhooks, and Calendar bookings (Epic 2.2).
- **In progress**: Epic 2 (Jira core integrated, Workspace starting).
- **Not started**: Epics 3 and 4 (GCP provisioning infrastructure and Supabase-backed HITL approval queues).

## Known Issues

- **[FIXED — 2026-08-05]** Clerk middleware route protection crash (`auth().protect()` → `await auth.protect()`).
- **[FIXED — 2026-08-09]** Jira agent unassigned issue search filter mismatch. Resolved via email-aware JQL expanding query targets to `reporter`, `creator`, and `assignee` simultaneously.

## Evolution of Project Decisions

- **2026-08-05**: PRD and original tasks compiled into the Memory Bank.
- **2026-08-08**: Swapped guest WiFi passcode with highly advanced GCP Org project creation and Terraform "science workstation" deployment tools.
- **2026-08-08**: Strategic pivot to **100% real, live integrations across all epics** (no mocks), utilizing personal credentials and local Terraform sub-process command runners. Structured the roadmap into 4 Epics and 12 User Stories.
- **2026-08-08**: Expanded Epic 1 UX scope to incorporate the **Double-Sidebar Portal Layout**, adding User Story 1.4 (Left Sidebar Ticket & History Drawer) and User Story 1.5 (Right Sidebar AI Diagnostics Console).
- **2026-08-08**: Implemented collapsible Left and Right sidebars inside `ChatInterface.tsx` with sliding glassmorphism effects, live-monitored reasoning logs terminal streams, and high-density active ticket status grids.
- **2026-08-08**: Executed initial Postgres real-time schema and trigger migrations in live Supabase dashboard workspace.
- **2026-08-08**: Refactored layout to match clean, minimal Gemini-style left navigation drawer (strictly past logs), introduced active/resolved IT ticket cards inside the main landing screen, and stacked service tickets on top of a collapsible/minimized Diagnostics Console in the right sidebar. Added clickable callback hooks that prompt Osprey instantly when ticket cards are clicked.
- **2026-08-09**: Replaced text monologue with high-fidelity, color-coded **Agent & Tool Activity Timeline** capturing dynamic tool statuses (`Running`, `Completed`, `Failed`, `Approval Required`, etc.).
- **2026-08-09**: Added responsive CSS class triggers enabling the Activity Timeline drawer to expand up to **100% panel height** on demand, collapsing the tickets panel to 0px dynamically.
- **2026-08-09**: Upgraded Jira ticket searching to be fully **email-aware**, resolving a core gap where helpdesk tickets (unassigned by default) could not be retrieved by the agent's assignee JQL filters. Added formal employee ownership instructions in `instructions.md`.
