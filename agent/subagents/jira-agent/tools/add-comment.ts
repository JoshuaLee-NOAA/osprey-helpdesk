import { defineTool } from "eve/tools";
import { z } from "zod";
import { addJiraComment } from "../../../../src/lib/jira";

export default defineTool({
  description: "Add a text comment or conversational note to an existing Jira support ticket.",
  inputSchema: z.object({
    key: z.string().describe("The Jira issue key or ID to comment on (e.g. 'OSP-104')"),
    comment: z.string().describe("The comment message or status update text to post"),
  }),
  async execute({ key, comment }) {
    try {
      console.log(`[Tool: add-comment] Adding comment to issue ${key}: "${comment}"`);
      const success = await addJiraComment(key, comment);
      return {
        success,
        message: success ? "Comment posted successfully." : "Failed to post comment to issue.",
      };
    } catch (error: any) {
      console.error(`[Tool: add-comment] Error posting comment to ${key}:`, error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during comment submission.",
      };
    }
  },
});
