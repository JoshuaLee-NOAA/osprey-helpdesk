# Osprey — AI-Powered Autonomous IT Helpdesk

Osprey is an AI-powered, autonomous IT helpdesk built on **Vercel's Eve** agent framework and **Next.js**. It showcases a supervisor/subagent multi-agent architecture with a native, durable Human-in-the-Loop (HITL) approval workflow for high-risk actions — all running from a single unified `npm run dev` process.

## What It Does

- **Employees** describe IT issues conversationally at `/portal` (e.g., *"My mouse is broken, please order a replacement and email me a confirmation"*). A supervisor agent triages the request and delegates to specialized subagents.
- **`jira-agent`** searches for duplicate tickets and creates new ones in Jira.
- **`workspace-agent`** sends Gmail confirmations, posts Google Chat alerts, and schedules technician calendar sessions.
- **High-risk tool calls** (e.g., emailing outside the company domain, critical actions) are intercepted by Eve's native `needsApproval` mechanism, which durably pauses the workflow and pushes a pending transaction to Supabase.
- **IT Administrators** review, modify, or reject pending actions in real time at `/dashboard/hitl`, backed by Supabase Realtime and an immutable audit log.

## Tech Stack

| Layer | Technology |
|---|---|
| Hosting & Infra | Vercel |
| Framework & Web UI | Next.js (App Router) |
| Agent Orchestration | [Eve](https://www.npmjs.com/package/eve) (`withEve`, `defineAgent`, `defineTool`, `useEveAgent`) |
| Auth & RBAC | Clerk (`@clerk/nextjs`) |
| Database & Realtime | Supabase (Postgres + Realtime) |
| UI | Tailwind CSS + shadcn/ui + `lucide-react` |
| Data Tables | `@tanstack/react-table` |
| Validation | Zod |

## Project Structure

```
osprey-helpdesk/
├── next.config.ts              # Wraps Next.js config with withEve()
├── agent/                      # Root Eve agent directory (NOT under src/)
│   ├── agent.ts                # Supervisor agent config (defineAgent)
│   ├── instructions.md         # Supervisor system prompt / guardrails
│   ├── channels/eve.ts         # Auth channel config (vercelOidc, localDev)
│   └── subagents/
│       ├── jira-agent/         # Ticket search & creation
│       └── workspace-agent/    # Gmail, Google Chat, Calendar
└── src/
    ├── middleware.ts           # Clerk route protection
    └── app/
        ├── page.tsx            # Role-based landing/redirect
        ├── portal/              # Employee chat portal
        └── dashboard/hitl/      # IT Admin approval command center
```

## Getting Started

Install dependencies and run the unified dev server (this boots **both** the Next.js app and the Eve agent runtime):

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/portal` (employee) or `/dashboard/hitl` (IT Admin) based on your Clerk role (`user.publicMetadata.role === "IT_Admin"`).

### Local/Offline Development

To develop without live Jira/Google Workspace credentials, set:

```bash
API_MODE=MOCK npm run dev
```

This routes all external tool calls through mock adapters (`src/lib/utils/mockAdapters.ts`).

### Required Environment Variables

- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `API_MODE` — set to `MOCK` for offline dev, unset/`LIVE` for real integrations

## Project Documentation (Memory Bank)

This project maintains a **Memory Bank** under [`memory-bank/`](./memory-bank/) as the living source of truth for scope, architecture, and implementation progress:

- [`projectbrief.md`](./memory-bank/projectbrief.md) — goals, success metrics, non-goals
- [`productContext.md`](./memory-bank/productContext.md) — why the project exists, user stories, UX goals
- [`systemPatterns.md`](./memory-bank/systemPatterns.md) — architecture, key patterns, Supabase schema
- [`techContext.md`](./memory-bank/techContext.md) — tech stack, dev setup, constraints
- [`activeContext.md`](./memory-bank/activeContext.md) — current focus, recent changes, next steps
- [`progress.md`](./memory-bank/progress.md) — the authoritative, increment-by-increment task tracker (1.0 → 6.0)

Project-specific conventions and guardrails for AI-assisted development are defined in [`.clinerules/`](./.clinerules/).

## Development Roadmap

Implementation proceeds in ordered increments (see `memory-bank/progress.md` for full detail):

1. **Core Shell, Auth, & Conversational Portal** — `withEve`, Clerk auth, `/portal` chat UI.
2. **Jira Subagent & Offline Mocking** — ticket search/creation, mock adapters.
3. **Database Foundation & Native HITL Interception** — Supabase schema, `needsApproval` suspension.
4. **IT Staff Command Center & Real-time Resumption** — `/dashboard/hitl`, approval queue, resume API.
5. **Advanced Workspace Tools & Security Hardening** — calendar/Chat tools, prompt-injection guardrails.
6. **Integration Testing & Production Readiness** — test coverage, deployment config.

## Design System

- **NOAA Dark Blue** (`#003087`) — headers, sidebars, primary actions
- **Process Light Blue** (`#0085CA`) — chat bubbles, active tabs
- **Osprey Amber** (`#FF9F1C`) — pending/alert states, active-agent indicators
- Typography: Google Font `Outfit`

## Learn More

- [Eve documentation](https://www.npmjs.com/package/eve)
- [Next.js documentation](https://nextjs.org/docs) — note: this project pins a recent Next.js version with breaking changes vs. older conventions; see `AGENTS.md` and check `node_modules/next/dist/docs/` before writing Next.js-specific code.
- [Clerk documentation](https://clerk.com/docs)
- [Supabase documentation](https://supabase.com/docs)
