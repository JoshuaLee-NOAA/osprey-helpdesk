import { defineTool } from "eve/tools";
import { z } from "zod";
import { scheduleCalendarEvent } from "../../../../src/lib/workspace";

export default defineTool({
  description: "Schedule an IT support meeting or event on the employee's Google Calendar.",
  inputSchema: z.object({
    userEmail: z.string().email().describe("The authenticated employee email address whose calendar will be updated."),
    summary: z.string().describe("Title of the calendar event (e.g. 'Osprey Helpdesk: Hardware Handover Session')"),
    description: z.string().describe("Description detailing the session, instructions, and related helpdesk tickets."),
    startDateTime: z.string().describe("ISO-8601 start date-time string (e.g. '2026-08-10T10:00:00Z')."),
    endDateTime: z.string().describe("ISO-8601 end date-time string (e.g. '2026-08-10T11:00:00Z')."),
  }),
  async execute({ userEmail, summary, description, startDateTime, endDateTime }) {
    try {
      console.log(`[Tool: schedule-calendar] Booking event "${summary}" for ${userEmail}...`);
      const result = await scheduleCalendarEvent(userEmail, summary, description, startDateTime, endDateTime);
      return result;
    } catch (error: any) {
      console.error("[Tool: schedule-calendar] Error scheduling event:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred while scheduling calendar event.",
      };
    }
  },
});
