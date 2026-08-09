# Project Brief: Osprey AI-Powered Autonomous IT Helpdesk

## What is Osprey?

Osprey is an AI-powered autonomous IT helpdesk built on Vercel's **Eve** agent framework and **Next.js 16**. It runs as a single unified project — Eve's `withEve()` wrapper mounts the agent runtime alongside the Next.js app server, so `npm run dev` boots both simultaneously with zero CORS/env overhead.

The system uses a **filesystem-first, supervisor + subagents** architecture with **100% real, live integrations** (no mocking layers) connecting securely to real-world cloud and ticketing endpoints:
- **Supervisor** (`agent/agent.ts` + `agent/instructions.md`) — Triage center that coordinates requests and delegates to specialized child subagents.
- **`jira-agent`** — Connects to real Jira Cloud REST APIs to perform similar duplicate ticket searches and create active support tickets.
- **`workspace-agent`** — Authenticates Google Cloud service accounts using official `googleapis` SDKs to dispatch real Gmail confirmations, post to real Google Chat webhooks, and schedule real Google Calendar events.
- **`gcp-agent`** — Connects to your Google Cloud Organization to provision real, active GCP projects and triggers local **Terraform CLI sub-process scripts** (`terraform init && terraform apply`) to deploy secure, VM-backed science workstations autonomously.
- A native **Human-in-the-Loop (HITL)** mechanism (Eve's built-in `needsApproval` property on `defineTool`) pauses high-risk tool calls (like GPU workstation sizes or external emails) until an IT Admin approves, modifies, or rejects them.

---

## Core Goals

1. **100% Real, Live API Integrations** — Zero mocking layers. All operations connect directly to active Jira Cloud instances, Google Workspace profiles, and real Google Cloud Organizations.
2. **Single-Server Unified Development** — One `npm run dev` command runs the full stack (Next.js + Eve agent runtime).
3. **Multi-Agent Cloud & Ticketing Orchestration** — Clean segregation of ticketing (Jira), messaging (Workspace), and DevOps/Infrastructure (GCP + Terraform) logic across file-based subagents.
4. **Durable Human-in-the-Loop (HITL)** — Eve's native `needsApproval` hook creates zero-compute, state-serialized pauses for high-risk actions.
5. **Persistent, Immutable Audit Logging** — Every agent state, tool approval, and payload revision is logged to a real Supabase database and made immutable via database triggers.
6. **Premium Dual-Portal UX**:
   - `/portal` — A beautiful, centered, floating chat card vertically and horizontally centered in the viewport, flanked by two collapsible drawers:
     - **Left Sidebar**: Conversational history list, a relocated "New Chat" trigger, and live active/resolved Jira ticket listings.
     - **Right Sidebar**: monospaced terminal streaming Osprey's live reasoning thoughts and a visual active-tool connectivity monitor with Zod JSON arguments inspector.
   - `/dashboard/hitl` — High-density real-time command center table driven by Supabase Realtime subscriptions.

---

## Success Metrics

- **Autonomous Resolution**: ≥70% of standard IT operations (like pre-approved software licensing and standard science workstation deployments) are completed fully autonomously within seconds.
- **100% Interception**: All defined high-risk actions (GPU VM types, custom SSD bounds, external emails) are reliably caught by Eve's native `needsApproval` loop—0% leakage.
- **Zero CORS/Env Overhead**: Single-origin deployment guarantees no CORS configuration issues or mismatched route environment variables.
- **Zero-Friction Dev Environment**: A single securely-vaulted `.env.local` configuration powers full operations with integrated credential health checks.

---

## Non-Goals (Out of Scope)

- Complex local auto-remediation (e.g., executing scripts directly on an end-user's local operating system).
- Handling non-IT queries (strictly IT support scope).
- Any feature that doesn't directly contribute to showcasing Eve framework capabilities, multi-agent coordination, or durable HITL.

---

## Target Users

- **Internal employees / scientists** (End Users) — Request standard catalog software, book support slots, and provision cloud science workstations via `/portal`.
- **IT Administrators** (Staff) — Review, edit, and resume suspended high-risk cloud and messaging transactions via `/dashboard/hitl`.
