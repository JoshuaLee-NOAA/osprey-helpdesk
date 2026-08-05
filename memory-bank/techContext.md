# Tech Context: Osprey AI-Powered Autonomous IT Helpdesk

## Core Technologies

| Layer | Technology | Notes |
|---|---|---|
| Hosting & Infra | Vercel | One-click deploy, edge routing, zero-config env hosting for Next.js |
| Framework & Web UI | Next.js 16 (App Router) | Powers both `/portal` and `/dashboard/hitl` |
| Agent Orchestration | Eve (`eve` npm package, `@vercel/eve`) | File-based subagent definition, tool execution, state persistence, workflow suspension |
| Authentication & RBAC | Clerk (`@clerk/nextjs`) | Auth + role-based routing via `user.publicMetadata.role` |
| Database & Realtime | Supabase | `pgvector` (future KB search), audit logging, Realtime subscriptions for live HITL queue |
| Design System | shadcn/ui + Tailwind CSS | NOAA/Osprey brand colors, accessible components |
| Data Tables | `@tanstack/react-table` | High-density admin approval queue |
| Icons | `lucide-react` | |
| Validation | `zod` | Tool input schemas, payload validation on resume |

## Current `package.json` Dependencies (as of this writing)

```json
"dependencies": {
  "@clerk/nextjs": "^7.6.5",
  "@tanstack/react-table": "^9.0.0",
  "eve": "^0.30.6",
  "lucide-react": "^1.28.0",
  "next": "16.3.0",
  "react": "19.2.8",
  "react-dom": "19.2.8",
  "zod": "^4.4.3"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "tailwindcss": "^4",
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "16.3.0"
}
```

Not yet added but required by later increments (per `progress.md`): Supabase client SDK (`@supabase/supabase-js`), Google Font `Outfit`, shadcn/ui CLI-generated components.

## Development Setup

- **Single command**: `npm run dev` starts Next.js AND the Eve agent runtime together (via `withEve()` in `next.config.ts`). There is no separate agent server/process to manage locally.
- **Environment toggle**: `API_MODE=MOCK` routes all external calls (Jira, Google Workspace) through `src/lib/utils/mockAdapters.ts` for fully offline development — no live credentials required to develop the conversational flow or HITL suspension logic.
- **Auth channels**: `agent/channels/eve.ts` configures same-origin Eve endpoint auth via `eve/channels/auth`'s `localDev()` (local dev bypass) and `vercelOidc()` (production Vercel OIDC token validation).

```ts
// agent/channels/eve.ts
import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [vercelOidc(), localDev()],
});
```

```ts
// next.config.ts
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {};

export default withEve(nextConfig); // Mounts agent routes at /eve/v1/*
```

## Technical Constraints

- **NOTE — Next.js version drift**: This project pins `next@16.3.0`, which per `AGENTS.md` has breaking changes vs. the Next.js in most training data / prior experience. **Always check `node_modules/next/dist/docs/` for the current API/conventions before writing Next.js code** — do not assume App Router conventions from memory are still accurate.
- Eve's `withEve()` wrapper must remain the single source of truth for mounting agent routes — do not hand-roll a parallel `/api/agent/*` proxy unless explicitly required (e.g., the one sanctioned exception is `/api/agent/resume`, which is a Next.js Route Handler that calls into Eve's native resume function — it does not reimplement agent execution).
- Google Workspace integration will use an **Osprey service account** (not per-user OAuth) — exact implementation details are still TBD pending exploration of what Eve's tool/auth primitives support for service-account-style external API calls (see Open Questions in `activeContext.md`).
- Supabase Realtime is required (not polling) for the admin queue to feel "live" per the PRD's UX goals.

## Dependencies / Integrations

- **Clerk**: user auth + custom role metadata (`IT_Admin`).
- **Supabase**: Postgres (transactions + audit tables), Realtime channel subscriptions.
- **Jira** (mocked initially): ticket search/creation.
- **Google Workspace** (mocked initially): Gmail, Google Chat, Calendar — via Osprey service account.
- **Vercel**: deployment target; also provides OIDC identity for `vercelOidc()` channel auth in production.

## Tool Usage Patterns

- Run `npm run dev` for all local development (single unified process).
- Use `npx jest [path]` to run tests; no path runs the full suite.
- Test files live alongside the code they test (e.g., `create-issue.test.ts` next to `create-issue.ts`).
- Use `API_MODE=MOCK npm run dev` (or equivalent `.env.local` setting) to develop/demo without live Jira/Google credentials.
