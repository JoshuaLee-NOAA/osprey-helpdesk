import { sendGmail, scheduleCalendarEvent } from "../src/lib/workspace";

async function runWorkspaceTest() {
  const targetEmail = "joshua@readymove.ai";
  
  console.log("====================================================");
  console.log("🚀 STARTING GOOGLE WORKSPACE E2E CONNECTIVITY TEST...");
  console.log(`👤 Target User Email (Impersonating): ${targetEmail}`);
  console.log("====================================================");

  // 1. Test Gmail Send
  console.log("\n✉️ 1. Sending Test Email via Gmail API...");
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color: #032b30; color: #ffffff; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Osprey Workspace Test</h2>
      </div>
      <div style="padding: 20px; color: #333333; line-height: 1.6;">
        <p>Hello Joshua,</p>
        <p>This is a live end-to-end verification of your <strong>Osprey IT Helpdesk Google Workspace integration</strong>!</p>
        <p>If you are reading this email, it means Gmail delegation is configured and functioning perfectly. 🎉</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777777; text-align: center;">This is an automated notification from Osprey Helpdesk.</p>
      </div>
    </div>
  `;

  const emailResult = await sendGmail(
    targetEmail,
    targetEmail, // Send to self
    "🔔 Osprey Helpdesk: Live E2E Integration Success!",
    emailHtml
  );

  if (emailResult.success) {
    console.log(`✅ Gmail Sent Successfully! Message ID: ${emailResult.messageId}`);
  } else {
    console.error(`❌ Gmail Failed: ${emailResult.error}`);
  }

  // 2. Test Google Calendar Event Scheduling
  console.log("\n📅 2. Scheduling Test Event via Google Calendar API...");
  // Set start to today at 11:00 AM (local time) and end at 12:00 PM
  const todayStr = new Date().toISOString().split("T")[0];
  const startDateTime = `${todayStr}T11:00:00`;
  const endDateTime = `${todayStr}T12:00:00`;

  const calendarResult = await scheduleCalendarEvent(
    targetEmail,
    "🐠 Osprey Helpdesk Integration Verification",
    "Live test event booked by Osprey agent. Connectivity is successful! 🚀",
    startDateTime,
    endDateTime
  );

  if (calendarResult.success) {
    console.log(`✅ Calendar Event Booked Successfully! Event ID: ${calendarResult.eventId}`);
    console.log(`   Link: ${calendarResult.htmlLink}`);
  } else {
    console.error(`❌ Calendar Booking Failed: ${calendarResult.error}`);
  }

  console.log("\n====================================================");
  console.log("🏁 TEST SEQUENCE COMPLETE!");
  console.log("====================================================");
}

runWorkspaceTest();
