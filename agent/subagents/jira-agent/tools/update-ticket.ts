import { defineTool } from "eve/tools";
import { z } from "zod";
import { updateJiraIssue } from "../../../../src/lib/jira";

// Trigger edit to force Eve compiler to rebuild and load updated updateJiraIssue from src/lib/jira.ts
export default defineTool({
  description: "Update an existing support ticket's fields, classification (category, severity) or transition its lifecycle status.",
  inputSchema: z.object({
    key: z.string().describe("The Jira issue key or ID to update (e.g. 'OSP-104')"),
    status: z.string().optional().describe("Optional new workflow status transition (e.g., 'In Progress', 'Done', 'Resolved', 'Reopened')"),
    category: z.enum(["DevOps", "License", "Hardware", "Software", "Access", "Security", "Network", "Incident"]).optional()
      .describe("Optional update to the helpdesk classification category"),
    severity: z.enum(["Low", "Medium", "High", "Critical"]).optional()
      .describe("Optional update to the severity level"),
  }),
  async execute({ key, status, category, severity }) {
    try {
      console.log(`[Tool: update-ticket] Updating ticket ${key}: [Status: ${status}, Category: ${category}, Severity: ${severity}]`);
      const updatedIssue = await updateJiraIssue(key, status, category, severity);
      return {
        success: true,
        message: `Support ticket ${key} updated successfully.`,
        ticket: updatedIssue,
      };
    } catch (error: any) {
      console.error(`[Tool: update-ticket] Error updating ticket ${key}:`, error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during ticket update.",
      };
    }
  },
});
