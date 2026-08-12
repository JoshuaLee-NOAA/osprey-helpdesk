# Active Context: Osprey AI-Powered Autonomous IT Helpdesk

## Current Work Focus

The project is focused on demo-readiness around **100% completed, live-integrated features**:
- Conversational IT portal with full multi-agent triage and history tracking (`/portal`).
- Live Jira Cloud ticket searching, duplicate checking, and ticket creation.
- Live Google Workspace integrations (Gmail notifications, Google Chat webhook alerts, Google Calendar support scheduling).
- Software license allocation database table (`user_software_licenses`) and automated seat provisioning tool.
- GCP DevOps subagent (`gcp-agent`) with Terraform science workstation blueprints (`src/lib/templates/workstation.tf`).

**Recent Architecture Adjustments:**
- Removed HITL (Human-In-The-Loop) approval holds for demo simplicity. All tools (including `send-gmail`) execute directly and seamlessly.
- Removed Thought Terminal tab from `DiagnosticsConsole.tsx`, focusing the right drawer on My Service Tickets and the Agent & Tool Activity Timeline.
- Streamlined `src/app/page.tsx` redirecting all authenticated users directly to `/portal`.

---

## Recent Changes

- **2026-08-12**: Simplified `send-gmail.ts` tool to dispatch emails directly without HITL suspension gates.
- **2026-08-12**: Removed Thought Terminal tab from `DiagnosticsConsole.tsx` to streamline the UI.
- **2026-08-12**: Updated `src/app/page.tsx` routing all authenticated users directly to `/portal`.
- **2026-08-12**: Relocated Terraform template to `src/lib/templates/workstation.tf` to avoid subagent directory scanning warnings.
