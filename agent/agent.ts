import { defineAgent } from "eve";

export default defineAgent({
  description: "Osprey AI-Powered IT Helpdesk Orchestrator. Safely and autonomously triages employee IT requests and delegates tasks to Jira and Workspace specialists.",
  model: "openai/gpt-4o-mini",
});

