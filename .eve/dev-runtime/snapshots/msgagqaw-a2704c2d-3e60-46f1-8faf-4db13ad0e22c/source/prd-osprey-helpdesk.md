# Product Requirements Document (PRD): Osprey AI-Powered Autonomous IT Helpdesk

## 1. Introduction/Overview
Osprey is an AI-powered autonomous IT helpdesk designed to streamline IT operations. Built using Vercel's **Eve** framework and **Next.js 14**, Osprey runs as a unified project using Eve's native `withEve` integration wrapper. The system utilizes a filesystem-first agent architecture where a main supervisor coordinates tasks and delegates to specialized sub-agents (`jira-agent` and `workspace-agent`), showcasing durable execution, secure sandboxes, and native Human-in-the-Loop (HITL) tool approvals.

---

## 2. Goals & Success Metrics
### Goals
- **Single-Server Unified Development**: Leverage `withEve` to run both the Next.js app server and the Eve agent runtime simultaneously from a single `npm run dev` command.
- **Native Multi-Agent Orchestration**: Utilize Eve’s file-based `subagents` convention to cleanly segregate domain logic for Jira and Google Workspace.
- **Durable Human-in-the-Loop (HITL)**: Implement native tool-approval barriers using Eve's built-in `needsApproval` hook, ensuring zero-compute, state-serialized pauses for high-risk actions.
- **Persistent Audit Logging**: Maintain an immutable audit trail of all agent states, tool approvals, and payload revisions in Supabase.
- **Premium User Experience**: Provide a dual-portal interface: a lightweight conversational assistant for employees (`/portal`) using Eve's native client hook (`useEveAgent`), and a high-density, real-time command center for IT Administrators (`/dashboard/hitl`).

### Success Metrics
- **Seamless Triage**: At least 70% of routine queries are resolved or prepared for execution automatically without manual human ticket routing.
- **100% Interception**: All defined "high-risk" tools are intercepted by Eve's durable `needsApproval` workflow state.
- **Zero CORS/Env Overhead**: Single-origin deployment guarantees zero CORS configuration issues or mismatching route environmental variables.

---

## 3. User Stories
- **As an employee**, I want to describe my IT issue in natural language (e.g., "My mouse is broken, and also send an email reminder to IT support") so that I don't have to fill out confusing, multi-field ticketing forms.
- **As an employee**, I want to receive automated email confirmations and calendar invites for support sessions without having to email back and forth with a technician.
- **As an IT Administrator**, I want Osprey to autonomously categorize issues and draft tickets, so that I don't spend hours on triage and data entry.
- **As an IT Administrator**, I want to review, modify, or reject any high-risk changes (like email group membership updates or calendar overrides) before they execute, so that I can maintain absolute control over the organization's environment.

---

## 4. Functional Requirements & Unified Project Layout

### 4.1. Filesystem-First Unified Directory
The project's backend agent and Next.js frontend are unified in a single repository:

```text
osprey-helpdesk/
├── package.json
├── tsconfig.json
├── next.config.ts                     # Wraps configuration with withEve()
├── agent/                             # Root Eve Directory (located at project root)
│   ├── agent.ts                       # Main supervisor config via defineAgent
│   ├── instructions.md                # Supervisor system instructions (Prompt)
│   ├── channels/
│   │   └── eve.ts                     # Configures Clerk/LocalDev Auth strategy
│   ├── skills/                        # Common IT playbooks & knowledge base markdown
│   │   └── hardware-replacement.md
│   └── subagents/                     # Specialized child agents (auto-registered as tools)
│       ├── jira-agent/
│       │   ├── agent.ts               # Jira Agent config (defines description, model)
│       │   ├── instructions.md        # Specialized Jira prompt rules
│       │   └── tools/                 # Jira sub-agent specific tools
│       │       ├── search-tickets.ts  # Ticket duplicate similarity checker
│       │       └── create-issue.ts    # Drafts / creates tickets
│       └── workspace-agent/
│           ├── agent.ts               # Google Workspace Agent config
│           ├── instructions.md        # Google Workspace prompt rules
│           └── tools/                 # Workspace sub-agent specific tools
│               ├── send-gmail.ts      # Sends HTML confirmation emails
│               ├── post-gchat.ts      # Posts threaded alerts to Google Chat spaces
│               └── schedule-calendar.ts # Schedules available technician slots
```

### 4.2. Routing Integration & next.config.ts
The Next.js configuration is wrapped with `withEve()` to automatically compile, route, and deploy the agent alongside the Next.js pages:

```typescript
// next.config.ts
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {};

export default withEve(nextConfig); // Automatically mounts agent routes at /eve/v1/*
```

### 4.3. Authentication & Authorization Route Protection
1. **User Authentication**: The system must authenticate users via Clerk.
2. **Channel Authentication (`agent/channels/eve.ts`)**: To secure same-origin Eve endpoints, write custom OIDC and localDev checks:
   ```typescript
   import { eveChannel } from "eve/channels/eve";
   import { localDev, vercelOidc } from "eve/channels/auth";

   export default eveChannel({ auth: [vercelOidc(), localDev()] });
   ```
3. **Route Protection**:
   - `/portal` must be restricted to authenticated users with either role.
   - `/dashboard/*` (IT Command Center) must be strictly restricted to `IT_Admin` users.
4. **Server-Side Validation**: All Next.js Server Actions and Route Handlers triggering administrative operations must verify the user's role on the server side using Clerk's JWT claims.

### 4.4. Conversational Customer Support Portal (Employee View)
1. **Chat UI**: A responsive, animated chat interface (`ChatInterface.tsx`) using Google Font `Outfit` and glassmorphic floating components.
2. **React Hook Integration (`useEveAgent`)**: The portal must consume Eve's native React hook to maintain conversation state, stream responses, and manage credentials:
   ```typescript
   import { useEveAgent } from "eve/react";

   const agent = useEveAgent({
     headers: async () => ({
       authorization: `Bearer ${await getClerkToken()}`,
     }),
   });
   ```
3. **Agent Status Badges**: Use Eve's session trace states to display dynamic Osprey Amber pulsing badges indicating which sub-agent is active (e.g., `[Jira Sub-Agent checking duplicate tickets...]`, `[Workspace Sub-Agent scheduling technician...]`).
4. **Rich Ticket Previews**: When a ticket is drafted or created, display a rich UI card showing the ticket ID, status, and summary, rather than raw text.

### 4.5. IT Staff HITL Command Center (Admin View)
1. **High-Density Queue**: A real-time data table (`@tanstack/react-table`) displaying all pending HITL approvals, sorted by urgency and risk score.
2. **Live Updates**: The queue must update instantly using Supabase Realtime when an Eve tool suspends execution.
3. **Two-Column Layout**:
   - **Left Column**: The list of pending and historical transactions.
   - **Right Column (Inspector Panel)**: Displays comprehensive context for the selected pending item:
     - User Prompt History (the conversational thread leading to the action).
     - AI Reasoning (explanation of why this tool is being invoked).
     - Raw JSON Payload (the exact parameters the agent wants to pass to the tool).
4. **Admin Decisions**:
   - **Approve**: Resumes the Eve workflow with the original payload.
   - **Modify & Run**: Allows the IT Admin to edit the JSON payload directly in a code editor block, validates the modified JSON schema, and resumes the Eve workflow with the updated payload.
   - **Reject**: Cancels the workflow, prompts the admin for rejection notes, and notifies the user in the chat portal.

### 4.6. Multi-Agent Orchestration & Sub-Agent Design
- **Orchestration**: The root `agent/agent.ts` coordinates the workflow and delegates to `subagents/jira-agent` and `subagents/workspace-agent` using native task delegation.
- **Jira Agent (`jira-agent`)**:
  - `search-tickets.ts`: Searches for similar existing tickets. If a similarity match is found, the sub-agent prompts the user to link updates instead of creating duplicates.
  - `create-issue.ts`: Drafts and registers the incident in Jira.
- **Google Workspace Agent (`workspace-agent`)**:
  - `send-gmail.ts`: Dispatches structured HTML confirmations using an Osprey Service Account.
  - `post-gchat.ts`: Posts alerts to Google Chat space IDs, threaded by Ticket ID.
  - `schedule-calendar.ts`: Searches a designated technician calendar and schedules the first available 30-minute block within working hours.

### 4.7. Native Human-in-the-Loop (HITL) Execution Pause
To prevent destructive administrative actions, key tools (e.g. `send-gmail`, calendar bookings, or hypothetical user access changes) must configure Eve's native `needsApproval` property inside their `defineTool` configurations. When `needsApproval` evaluates to `true`, the Eve runtime automatically:
1. Pauses the session state.
2. Serializes the execution context (call stack, prompt history, proposed payload arguments).
3. Dispatches a suspension event to the database queue.
4. Waits indefinitely (with zero active server compute consumption) for a resumption payload containing an Approve, Modify, or Reject signal.

---

## 5. Security, Governance & Guardrails
1. **Prompt Injection Mitigation**: A guardrail tool or middleware in the root agent must preprocess user inputs, scanning for instructions that attempt to bypass role security, override system bounds, or abuse subagents.
2. **Access Control Verification**: Subagents must not execute tools outside their authorized scope. Administrative operations must check the original user's JWT role claims inside the server routing layer.
3. **Payload Sanitization**: Payloads edited via the "Modify & Run" dashboard panel must be schema-validated on the server before being sent to the Eve runtime's resume endpoint.
4. **Immutable Audit Trail**: All transaction states, approvals, modifications, and rejections must be logged in a read-only `audit_logs` database table in Supabase, locked by PostgreSQL triggers to prevent manipulation.

---

## 6. Supabase Database Schema Blueprint
To support real-time HITL sync and audit logging, the following schema must be provisioned:

```sql
CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'EXPIRED');

CREATE TABLE hitl_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL, -- Eve execution session key
    user_id VARCHAR(255) NOT NULL,    -- Clerk user ID of initiator
    user_email VARCHAR(255) NOT NULL,
    sub_agent VARCHAR(100) NOT NULL,  -- e.g., 'workspace-agent'
    tool_name VARCHAR(100) NOT NULL,  -- e.g., 'send-gmail'
    proposed_payload JSONB NOT NULL,  -- Proposed arguments
    final_payload JSONB,              -- Arguments actually executed (if modified)
    risk_reason TEXT NOT NULL,        -- Why it triggered HITL
    status transaction_status DEFAULT 'PENDING',
    it_admin_id VARCHAR(255),         -- Clerk user ID of approver
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES hitl_transactions(id),
    actor_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'AGENT_SUSPEND', 'ADMIN_APPROVE', 'TOOL_EXECUTE_SUCCESS'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Immutable audit logs trigger
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutable_audit
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
```

---

## 7. Design & Aesthetic Specifications
- **Theme**: NOAA and Osprey branding:
  - `--primary`: NOAA Dark Blue (`#003087`) for sidebar backgrounds, global headers, and primary CTAs.
  - `--secondary`: Process Light Blue (`#0085CA`) for employee chat bubbles and active tabs.
  - `--accent`: Osprey Amber (`#FF9F1C`) for pending states, alert banners, and pulsed AI thinking animations.
  - `--background`: Clean white/light gray (`#FFFFFF` / `#F8FAFC`).
- **Typography**: Google Font `Outfit` applied globally as the baseline typography.
- **Glassmorphic Touch**: Utilize CSS `backdrop-filter: blur(8px)` with semi-transparent boundaries for alert cards and floating control headers.
- **Animations**:
  - Pulsing amber glows during sub-agent tool runs.
  - Slide-over transition for the inspector panel.
  - Row transition effects in the data table when items get resolved.

---

## 8. Technical Considerations
- **Framework**: Next.js 14 (App Router) deployed on Vercel.
- **Single-Project Wrapper**: Integrates using `withEve` inside `next.config.ts`, booting local development via a unified `npm run dev`.
- **React Client Hook**: Streams conversations natively via the `useEveAgent` client hook.
- **Mock Mode**: To enable complete local, offline debugging, the application must run with mock service adapters when the environment variable `API_MODE=MOCK` is active, bypassing live Jira/Google Workspace integrations.