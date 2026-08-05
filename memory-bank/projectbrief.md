# Project Brief: Osprey AI-Powered Autonomous IT Helpdesk

## What is Osprey?

Osprey is an AI-powered autonomous IT helpdesk built on Vercel's **Eve** agent framework and **Next.js 16**. It runs as a single unified project — Eve's `withEve()` wrapper mounts the agent runtime alongside the Next.js app server, so `npm run dev` boots both simultaneously with zero CORS/env overhead.

The system uses a **filesystem-first, supervisor + subagents** architecture:
- A root supervisor agent (`agent/agent.ts` + `agent/instructions.md`) triages employee requests and delegates to specialized child agents.
- `jira-agent` — searches for duplicate tickets and creates new Jira issues.
- `workspace-agent` — sends Gmail confirmations, posts Google Chat alerts, and schedules calendar sessions.
- A native **Human-in-the-Loop (HITL)** mechanism (Eve's built-in `needsApproval` property on `defineTool`) pauses high-risk tool calls until an IT Admin approves, modifies, or rejects them.

## Core Goals

1. **Single-Server Unified Development** — one `npm run dev` command runs the full stack (Next.js + Eve agent runtime).
2. **Native Multi-Agent Orchestration** — Eve's file-based `subagents` convention cleanly segregates Jira and Google Workspace domain logic.
3. **Durable Human-in-the-Loop (HITL)** — Eve's native `needsApproval` hook creates zero-compute, state-serialized pauses for high-risk actions (no custom pause/resume mechanism built from scratch).
4. **Persistent, Immutable Audit Logging** — every agent state, tool approval, and payload revision is logged to Supabase and cannot be altered after the fact.
5. **Premium Dual-Portal UX**:
   - `/portal` — lightweight conversational assistant for employees (`useEveAgent` client hook).
   - `/dashboard/hitl` — high-density, real-time command center for IT Administrators.

## Success Metrics

- **Seamless Triage**: ≥70% of routine queries are resolved or prepared for execution automatically without manual human ticket routing.
- **100% Interception**: All defined "high-risk" tools are intercepted by Eve's durable `needsApproval` workflow state — none slip through.
- **Zero CORS/Env Overhead**: Single-origin deployment guarantees no CORS configuration issues or mismatched route environment variables.
- Reduced manual workload / approvals burden for IT staff (this is the headline demo goal — showcasing what Eve + AI agents can do for IT ops).

## Non-Goals (Out of Scope)

- Complex local auto-remediation (e.g., agent directly executing scripts on an end-user's machine).
- Handling non-IT queries (HR, payroll, etc.) — strictly IT support scope.
- Any feature that doesn't directly contribute to showcasing the Eve framework or core multi-agent/HITL operations.

## Target Users

- **Internal employees** (End Users) — report issues conversationally via `/portal`.
- **IT Administrators** (Staff) — review and resolve HITL approvals via `/dashboard/hitl`.

## Provenance

This brief distills `prd-osprey-helpdesk.md`, the original Product Requirements Document (now removed from the project root — its full content lives across this Memory Bank, primarily here and in `productContext.md`, `systemPatterns.md`, and `progress.md`).
