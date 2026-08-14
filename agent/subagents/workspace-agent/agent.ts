import { defineAgent } from "eve";

export default defineAgent({
  description: "Specialist in dispatching email updates, sending automated Google Chat notifications, and booking Google Calendar support slots.",
  model: "openai/gpt-4o-mini",
});
