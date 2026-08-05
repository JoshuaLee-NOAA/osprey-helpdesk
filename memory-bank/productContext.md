# Product Context: Osprey AI-Powered Autonomous IT Helpdesk

## Why This Project Exists

IT helpdesks are traditionally bottlenecked by manual triage: employees fill out confusing multi-field ticketing forms, IT staff spend hours on categorization and data entry, and any automation that does exist can't safely be trusted with higher-risk actions (permission changes, external emails, critical ticket closures) without a human in the loop.

Osprey exists to demonstrate that an AI agent — built on Vercel's Eve SDK — can autonomously handle the bulk of routine IT helpdesk work (ticket creation, notifications, scheduling) while **guaranteeing** that any high-risk action is durably paused for human approval before it executes. It is as much a showcase of the Eve framework's capabilities (unified dev server, file-based subagents, native `needsApproval` HITL suspension) as it is a functional helpdesk product.

## Problems It Solves

- **For employees**: No more confusing ticketing forms — describe your IT issue in natural language (e.g., "My mouse is broken, and also send an email reminder to IT support") and let Osprey draft/route it.
- **For IT Admins**: No more hours spent on manual triage and data entry for routine issues. Osprey autonomously categorizes and drafts tickets. For anything risky, IT Admins retain full control via an approval queue — nothing executes without sign-off.
- **For the organization**: An immutable audit trail of every agent decision, approval, modification, and rejection, satisfying governance/compliance needs.

## How It Should Work

1. An employee opens `/portal` and describes their issue conversationally.
2. Osprey (the supervisor agent) triages the request, asks clarifying questions if vague, and delegates to the appropriate subagent(s):
   - `jira-agent` searches for existing similar tickets before creating a new one (avoids duplicates).
   - `workspace-agent` sends confirmation emails, posts Google Chat alerts, and/or books a calendar slot with a technician.
3. If a tool call is flagged high-risk (via `needsApproval` on that tool's `defineTool` config), Eve's runtime **pauses the entire workflow**, serializes state, and pushes a pending transaction to Supabase.
4. IT Admins see the pending transaction appear instantly (Supabase Realtime) in `/dashboard/hitl`'s approval queue.
5. The IT Admin inspects the user's prompt history, the agent's reasoning, and the raw JSON payload, then chooses:
   - **Approve** — resumes the workflow with the original payload.
   - **Modify & Run** — edits the JSON payload (schema-validated), then resumes with the updated payload.
   - **Reject** — cancels the workflow and notifies the employee in the chat portal, with admin notes.
6. Every state transition (suspend, approve, modify, reject, execute) is written to an immutable `audit_logs` table.

## User Experience Goals

- **Employees**: A clean, lightweight, conversational chat experience. Visual feedback (Osprey Amber pulsing badges) shows which subagent is actively working. Rich preview cards (not raw text) for ticket drafts, calendar slots, etc.
- **IT Admins**: A high-density, real-time command center. Pending approvals should feel urgent and clear (Osprey Amber risk badges), with a two-column layout: queue on the left, full inspector detail (prompt history + AI reasoning + raw JSON) on the right.
- **Both**: Clean NOAA/Osprey-branded design system (see `systemPatterns.md` for exact tokens), fast feedback loops, and zero ambiguity about what the AI is doing and why.

## User Stories

- As an employee, I want to describe my IT issue in natural language so I don't have to fill out confusing multi-field ticketing forms.
- As an employee, I want automated email confirmations and calendar invites for support sessions without back-and-forth emailing a technician.
- As an IT Administrator, I want Osprey to autonomously categorize issues and draft tickets so I don't spend hours on triage and data entry.
- As an IT Administrator, I want to review, modify, or reject any high-risk change before it executes, so I maintain absolute control over the organization's environment.
