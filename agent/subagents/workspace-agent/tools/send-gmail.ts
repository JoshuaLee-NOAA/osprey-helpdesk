import { defineTool } from "eve/tools";
import { z } from "zod";
import { sendGmail } from "../../../../src/lib/workspace";

export default defineTool({
  description: "Send a professional email via Gmail from the Osprey IT Helpdesk sender account to an employee or target recipient.",
  inputSchema: z.object({
    to: z.string().email().describe("The recipient email address for the notification (e.g., the logged-in employee's email address from System Context or a specifically requested target email address)."),
    subject: z.string().describe("Professional, short email subject line (e.g. 'Osprey IT Helpdesk: Ticket KAN-12 Created successfully')"),
    htmlContent: z.string().describe("HTML email content containing the detailed follow-up notes, ticket details, or next steps."),
  }),
  async execute({
    to,
    subject,
    htmlContent,
  }: {
    to: string;
    subject: string;
    htmlContent: string;
  }) {
    try {
      const senderEmail = process.env.WORKSPACE_STAGING_USER || "osprey@readymove.ai";
      console.log(`[Tool: send-gmail] Dispatching email from ${senderEmail} -> TO RECIPIENT: ${to}`);
      const result = await sendGmail(senderEmail, to, subject, htmlContent);
      return result;
    } catch (error: any) {
      console.error("[Tool: send-gmail] Error sending email:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred while sending email.",
      };
    }
  },
});
