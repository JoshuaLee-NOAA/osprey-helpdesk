# Product Context: Osprey AI-Powered Autonomous IT Helpdesk

## Why This Project Exists

IT helpdesks are traditionally bottlenecked by manual triage and operational friction. Employees fill out confusing multi-field ticketing forms, IT staff spend hours on manual categorization and data entry, and any automation that does exist cannot safely be trusted with higher-risk actions (infrastructure changes, billing accounts, external emails) without a human in the loop.

Osprey demonstrates that an AI agent — built on Vercel's Eve SDK — can autonomously handle the bulk of routine IT helpdesk work (ticketing, calendar scheduling) and advanced DevOps operations (GCP project creation and Terraform workstation provisioning) while **guaranteeing** that any high-risk action is durably paused for human approval before it executes. It is a functional, production-ready system utilizing **100% real, live integrations** across Jira Cloud, Google Workspace, and GCP Organizations.

---

## Problems It Solves

- **For employees**: No more confusing forms — describe your IT issue or requested cloud resource in natural language (e.g., "Provision a standard science workstation in us-central1") and let Osprey execute it instantly.
- **For scientists / researchers**: Eliminates the DevOps bottleneck. Instead of waiting days for an administrator to create a GCP project, configure a VPC, link billing, and spin up a Compute VM, Osprey automates the entire loop in seconds using Terraform.
- **For IT Admins**: No more hours spent on manual triage, resource provisioning, or duplicate checks. Osprey autonomously categorizes tickets, checks software DB seats, and deploys cloud projects. For risky resources (like costly GPU machines), admins retain absolute control via an interactive approval queue.
- **For the organization**: An immutable, tamper-evident audit trail of every automated run, administrative modification, and workflow resumption, satisfying rigorous governance and regulatory compliance needs.

---

## How It Should Work

1. An employee opens `/portal` and describes their issue or request conversationally.
2. Osprey (the supervisor agent) triages the request and delegates to the appropriate specialized subagent:
   - `jira-agent` connects to your real Jira Cloud to search for duplicate cases and log tickets.
   - `workspace-agent` connects to real Google APIs using `googleapis` to send Gmails, alert Google Chat rooms, and schedule meetings.
   - `gcp-agent` connects to your real Google Cloud Org to provision projects and executes local shell scripts to run `terraform init && terraform apply`.
3. If a tool call is flagged high-risk (e.g., emailing an external domain, booking calendar overrides, or requesting GPU machine types like `g2-standard-8` inside a workstation request) via the `needsApproval` property, Eve's runtime **pauses the entire workflow**, serializes its execution state, and registers a `PENDING` record in Supabase.
4. IT Admins see the pending transaction appear instantly in `/dashboard/hitl`'s approval queue driven by Supabase Realtime.
5. The IT Admin inspects the user's prompt history, the agent's reasoning, and the raw JSON payload, then chooses:
   - **Approve** — resumes the workflow with the original payload.
   - **Modify & Run** — edits the raw JSON parameters (schema-validated), then resumes with the updated payload.
   - **Reject** — cancels the workflow and notifies the employee in `/portal`, writing admin explanation notes.
6. Every state transition (suspend, approve, modify, reject, execute) is written to an immutable `audit_logs` table (guaranteed tamper-proof by database triggers).

---

## User Experience Goals

- **Employees**: A clean, conversational chat experience. Visual feedback (Osprey Amber pulsing badges) shows which subagent is actively working. Rich preview cards (like GCP workstation details with Jupyter links and SSH keys) render inline instead of raw markdown text.
- **Double-Sidebar Glassmorphic Interface**:
  - **Left Collapsible Drawer**: Hosts a prominent "New Chat" button, a chronological list of past conversations (sourced from Supabase), and a master ticket console toggleable between **Active Tickets** (displaying keys and real-time statuses) and **Resolved Tickets**.
  - **Right Collapsible Drawer**: Monaco-style monospaced console streaming the LLM's raw reasoning steps (`reasoning` stream parts) and active tool node links (connecting the supervisor to subagents with rotating orbital indicators and expandable raw JSON Zod arguments).
- **IT Admins**: A high-density, real-time command center. Pending approvals feel urgent and clear (Osprey Amber risk badges), with a two-column layout: queue on the left, full inspector detail (prompt history + AI reasoning + raw JSON) on the right.
- **Both**: Clean NOAA/Osprey-branded design system (see `systemPatterns.md` for exact tokens), fast feedback loops, and zero ambiguity about what the AI is doing and why.

---

## User Stories

- As an employee, I want to describe my IT issue in natural language so I don't have to fill out confusing multi-field ticketing forms.
- As an employee, I want automated email confirmations and calendar invites for support sessions without back-and-forth emailing a technician.
- As an IT Administrator, I want Osprey to autonomously categorize issues and draft tickets so I don't spend hours on triage and data entry.
- As an IT Administrator, I want to review, modify, or reject any high-risk change before it executes, so I maintain absolute control over the organization's environment.
- **[US 1.4]** As an employee, I want a collapsible left sidebar containing my past conversation history threads and active/resolved service desk tickets, so I can manage my entire IT relationship in one spot.
- **[US 1.5]** As an employee, I want to view Osprey's step-by-step thinking steps and raw tool parameters inside a collapsible right diagnostics console, so that I have complete transparency into the AI's operations.
- **[US 3.1]** As an employee, I want to request access to standard pre-approved software tools (Zoom, Slack, Figma, 1Password) and have Osprey check seat inventory, update the licenses database, and activate access for me instantly.
- **[US 3.2]** As a research scientist, I want Osprey to autonomously create a real GCP project under our organization and run real Terraform scripts to spin up a secure VM science workstation for me, so I can start conducting research immediately.
