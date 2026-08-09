import { defineTool } from "eve/tools";
import { z } from "zod";
import { searchJiraIssues } from "../../../../src/lib/jira";

// Trigger edit to force Eve compiler to rebuild and load updated searchJiraIssues JQL from src/lib/jira.ts
export default defineTool({
  description: "Query existing support tickets across our Jira database to identify matching or highly similar requests.",
  inputSchema: z.object({
    query: z.string().describe("Search term or keyword match (e.g. 'MFA', 'Figma', 'workstation')"),
  }),
  async execute({ query }) {
    try {
      console.log(`[Tool: search-tickets] Searching Jira issues for query: "${query}"`);
      const issues = await searchJiraIssues(query);
      return {
        success: true,
        count: issues.length,
        issues,
      };
    } catch (error: any) {
      console.error("[Tool: search-tickets] Error executing Jira search:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during ticket search.",
      };
    }
  },
});
