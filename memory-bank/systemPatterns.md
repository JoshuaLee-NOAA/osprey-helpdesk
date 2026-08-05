# System Patterns: Osprey AI-Powered Autonomous IT Helpdesk

## Architecture Overview

Osprey is a **unified Next.js + Eve** monorepo. There is no separate backend service — Eve's `withEve()` wrapper in `next.config.ts` mounts the agent runtime's routes (`/eve/v1/*`) directly into the Next.js app, so both run from a single `npm run dev` process with no CORS boundary.

```
osprey-helpdesk/
├── next.config.ts                     # Wraps config with withEve()
├── agent/                             # Root Eve Directory (project root, NOT under src/)
│   ├── agent.ts                       # Main supervisor config via defineAgent
│   ├── instructions.md                # Supervisor system instructions (prompt)
│   ├── channels/
│   │   └── eve.ts                     # Configures Clerk/LocalDev auth strategy
│   ├── skills/                        # Common IT playbooks / knowledge base markdown
│   │   └── hardware-replacement.md
│   └── subagents/                     # Specialized child agents (auto-registered as tools)
│       ├── jira-agent/
│       │   ├── agent.ts
│       │   ├── instructions.md
│       │   └── tools/
│       │       ├── search-tickets.ts
│       │       └── create-issue.ts
│       └── workspace-agent/
│           ├── agent.ts
│           ├── instructions.md
│           └── tools/
│               ├── send-gmail.ts
│               ├── post-gchat.ts
│               └── schedule-calendar.ts
└── src/
    ├── middleware.ts                  # Clerk route protection (uses `clerkMiddleware(async (auth, req) => { await auth.protect(); })`)
    ├── lib/
    │   └── utils.ts                   # `cn()` classname helper (clsx + tailwind-merge)
    ├── components/
    │   └── ui/                        # shadcn/ui base components generated against @base-ui/react primitives
    │       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx, dialog.tsx,
    │       └── input.tsx, label.tsx, separator.tsx, sonner.tsx, table.tsx, tabs.tsx
    └── app/
        ├── layout.tsx                 # Root layout — <ClerkProvider>, global Lato font, <Toaster />
        ├── globals.css                # NOAA/Osprey Amber CSS variable tokens + Tailwind v4 @theme mapping
        ├── page.tsx                   # Marketing/sign-in landing + role-based router (redirects to /portal or /dashboard/hitl)
        ├── style-guide/page.tsx       # Internal, unauthenticated design-system preview page (colors, typography, all base components, HITL status affordances)
        ├── portal/                    # Employee chat portal (ChatInterface.tsx uses real `useEveAgent`, no mocked chat logic)
        └── dashboard/hitl/            # IT Admin command center (to be built — Increment 4.0)
```


## Key Technical Decisions

1. **Supervisor / Subagent delegation pattern**: `agent/agent.ts` is the single entry point (`defineAgent`). It never performs Jira or Workspace actions itself — it always delegates to `jira-agent` or `workspace-agent`. This keeps domain logic cleanly separated and matches Eve's file-based subagent convention (subagents are auto-registered as callable tools of the supervisor).

2. **Native HITL via `needsApproval`** (critical pattern — do not reinvent): High-risk tools (e.g., `send-gmail`, calendar overrides, hypothetical access changes) set a `needsApproval` property inside their `defineTool()` config. When it evaluates `true` at runtime, Eve automatically:
   - Pauses session state.
   - Serializes the full execution context (call stack, prompt history, proposed payload).
   - Dispatches a suspension event.
   - Waits indefinitely, at zero compute cost, for an external resume signal (Approve / Modify / Reject).

   This is a **framework-native primitive**, not a custom-built pause/resume system. Any implementation work should configure this property and the accompanying persistence hook — not build parallel infrastructure.

3. **Supabase as the durable HITL + audit store**: Two tables drive the whole HITL loop:
   - `hitl_transactions` — one row per suspended tool call (status: `PENDING` → `APPROVED`/`MODIFIED`/`REJECTED`/`EXPIRED`).
   - `audit_logs` — append-only log of every state transition, enforced immutable via a Postgres `BEFORE UPDATE OR DELETE` trigger that raises an exception (`prevent_audit_log_modification()`).

   Supabase Realtime subscriptions on `hitl_transactions` drive the live-updating admin queue — no polling.

4. **Resume flow**: `/api/agent/resume` (Next.js Route Handler) is the only path to resolve a paused workflow. It:
   - Re-validates the caller's Clerk role server-side (never trusts client claims).
   - Validates any modified JSON payload against the tool's schema before forwarding.
   - Signals Eve's native workflow-resume function with the final payload.
   - Updates the `hitl_transactions` row status and writes an `audit_logs` entry.

5. **Auth boundary**: Clerk handles identity; role (`IT_Admin` vs. default employee) is read from `user.publicMetadata.role`. `src/middleware.ts` protects `/portal`, `/dashboard`, and `/api/agent/resume` at the edge; server-side re-validation happens again inside any admin-only route handler.

6. **Mock-first local dev**: `API_MODE=MOCK` env var routes all Jira/Google Workspace tool calls through `src/lib/utils/mockAdapters.ts` instead of live APIs — enables fully offline development and demoing.

## Design Patterns In Use

- **Delegation / Chain of Responsibility**: supervisor → subagent → tool.
- **Interrupt/Resume (Sagas-like)**: `needsApproval` suspension + `/api/agent/resume` is functionally a durable saga checkpoint — state is externalized to Supabase, not kept in memory.
- **Append-only audit log**: enforced at the database level via trigger, not just application logic — guarantees tamper-evidence regardless of code path.
- **Guardrail middleware in the agent prompt layer**: `agent/instructions.md` embeds explicit prompt-injection and scope-escalation defenses as operational directives the supervisor must follow before delegating any task.

## Component Relationships

```
Employee (Clerk auth) 
   → /portal (ChatInterface.tsx, useEveAgent hook)
      → Eve runtime (/eve/v1/*, mounted via withEve)
         → agent/agent.ts (supervisor)
            → jira-agent  (search-tickets, create-issue)
            → workspace-agent (send-gmail[needsApproval], post-gchat, schedule-calendar)
               → [if needsApproval] → hitl_transactions row (Supabase) → Realtime → /dashboard/hitl
                     IT Admin (Clerk auth, IT_Admin role)
                        → ApprovalQueue.tsx + InspectorPanel.tsx
                           → POST /api/agent/resume (Approve / Modify & Run / Reject)
                              → Eve resume signal → tool executes (or workflow cancelled)
                              → audit_logs entry written (immutable)
```

## Critical Implementation Paths

- Anything touching **tool execution risk** must go through `needsApproval`, never a custom flag.
- Anything touching **admin actions** must re-check role server-side in the route handler, not rely on middleware alone.
- Anything touching **audit_logs** must only ever `INSERT`, never `UPDATE`/`DELETE` (enforced by DB trigger, but application code should also never attempt it).
- The **Supabase schema** (see below) is foundational — build it before wiring HITL suspension, since the suspension hook writes into it immediately.

### Supabase Schema Blueprint

```sql
CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'EXPIRED');

CREATE TABLE hitl_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,      -- Eve execution session key
    user_id VARCHAR(255) NOT NULL,         -- Clerk user ID of initiator
    user_email VARCHAR(255) NOT NULL,
    sub_agent VARCHAR(100) NOT NULL,       -- e.g., 'workspace-agent'
    tool_name VARCHAR(100) NOT NULL,       -- e.g., 'send-gmail'
    proposed_payload JSONB NOT NULL,
    final_payload JSONB,                   -- arguments actually executed (if modified)
    risk_reason TEXT NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    it_admin_id VARCHAR(255),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES hitl_transactions(id),
    actor_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,     -- e.g., 'AGENT_SUSPEND', 'ADMIN_APPROVE', 'TOOL_EXECUTE_SUCCESS'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

## Design System Tokens

- `--primary`: NOAA Dark Blue `#003087` — sidebar backgrounds, global headers, primary CTAs.
- `--secondary`: Process Light Blue `#0085CA` — employee chat bubbles, active tabs.
- `--accent`: Osprey Amber `#FF9F1C` — pending states, alert banners, pulsed AI "thinking" animations.
- `--background`: white / light gray (`#FFFFFF` / `#F8FAFC`).
- Typography: Google Font `Lato`, applied globally.
- Glassmorphic touch: `backdrop-filter: blur(8px)` with semi-transparent borders for alert cards and floating headers.
- Animations: pulsing amber glows during subagent runs; slide-over transition for the Inspector Panel; row transition effects when queue items resolve.
- **Live preview**: `src/app/style-guide/page.tsx` renders every base component + token combination on one unauthenticated page — use it to visually verify new brand/token changes before wiring them into `/portal` or `/dashboard/hitl`.
- **Primitive library note**: shadcn/ui components in this project are generated against `@base-ui/react` (not Radix UI). When adding new shadcn components, expect imports like `import { X as XPrimitive } from "@base-ui/react/x"` and prop shapes (e.g., `render` prop for polymorphic elements, as used in `dialog.tsx`'s `DialogTrigger render={<Button variant="outline" />}`) that differ from Radix-based shadcn docs/training data.

