import { defineTool } from "eve/tools";
import { z } from "zod";
import { sendGmail } from "../../../../src/lib/workspace";

export default defineTool({
  description: "Send a professional email via Gmail on behalf of the logged-in employee.",
  inputSchema: z.object({
    userEmail: z.string().email().describe("The email address of the authenticated employee (e.g. joshua.lee@noaa.gov) to impersonate via Domain-Wide Delegation."),
    to: z.string().email().describe("Recipient email address for the notification (e.g. employee email or supervisor email)."),
    subject: z.string().describe("Professional, short email subject line (e.g. 'Osprey IT Helpdesk: Ticket KAN-12 Created successfully')"),
    htmlContent: z.string().describe("HTML email content containing the detailed follow-up notes, ticket details, or next steps."),
  }),
  async execute({ userEmail, to, subject, htmlContent }) {
    try {
      console.log(`[Tool: send-gmail] Sending email from ${userEmail} to ${to}...`);
      const result = await sendGmail(userEmail, to, subject, htmlContent);
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
