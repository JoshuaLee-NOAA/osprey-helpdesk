import { defineAgent } from "eve";

export default defineAgent({
  description: "Specialist in searching existing IT support tickets, similarity matching, and creating new issues in Jira Cloud.",
  model: "openai/gpt-4o-mini",
});
