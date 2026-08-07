import { defineAgent } from "eve";

export default defineAgent({
  description: "Osprey AI-Powered IT Helpdesk Orchestrator. Safely and autonomously triages employee IT requests and delegates tasks to Jira and Workspace specialists.",
  // Gateway model id — routes through Vercel AI Gateway, authenticated via
  // AI_GATEWAY_API_KEY in .env.local (create keys at vercel.com/dashboard/ai/api-keys).
  model: "google/gemini-2.5-flash",
});

