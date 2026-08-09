import { defineAgent } from "eve";

export default defineAgent({
  description: "Specialist in searching existing IT support tickets, similarity matching, and creating new issues in Jira Cloud.",
  model: "google/gemini-2.5-flash",
});
