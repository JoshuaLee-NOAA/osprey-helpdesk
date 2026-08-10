import { defineTool } from "eve/tools";
import { z } from "zod";
import { sendGChatMessage } from "../../../../src/lib/workspace";

export default defineTool({
  description: "Send a real-time notification or alert directly to the team's Google Chat Space via webhook.",
  inputSchema: z.object({
    message: z.string().describe("The notification message text to post (e.g. '🔔 Ticket KAN-12 created for Joshua Lee (License request)')"),
  }),
  async execute({ message }) {
    try {
      console.log(`[Tool: post-gchat] Posting message: "${message}"`);
      const result = await sendGChatMessage(message);
      return result;
    } catch (error: any) {
      console.error("[Tool: post-gchat] Error posting message:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred while posting to Google Chat.",
      };
    }
  },
});
