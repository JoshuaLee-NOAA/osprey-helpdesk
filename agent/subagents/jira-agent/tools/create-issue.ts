import { defineTool } from "eve/tools";
import { z } from "zod";
import { createJiraIssue } from "../../../../src/lib/jira";

export default defineTool({
  description: "Create a new support ticket in Jira Cloud with standardized titles, descriptions, categories, and severity levels.",
  inputSchema: z.object({
    summary: z.string().describe("A professional, short title summarizing the request (e.g. 'Request Figma Seat - Jane Doe')"),
    description: z.string().describe("Detailed description of the issue, employee requests, OS, error codes, and instructions"),
    category: z.enum(["DevOps", "License", "Hardware", "Software", "Access", "Security", "Network", "Incident"])
      .describe("Standard helpdesk classification category"),
    severity: z.enum(["Low", "Medium", "High", "Critical"])
      .describe("Calculated severity level reflecting priority and business block status"),
  }),
  async execute({ summary, description, category, severity }) {
    try {
      console.log(`[Tool: create-issue] Registering support issue: "${summary}" [Category: ${category}, Severity: ${severity}]`);
      const newIssue = await createJiraIssue(summary, description, category, severity);
      return {
        success: true,
        message: "Support ticket registered successfully in Jira Cloud.",
        ticket: newIssue,
      };
    } catch (error: any) {
      console.error("[Tool: create-issue] Error registering support ticket:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during ticket creation.",
      };
    }
  },
});
