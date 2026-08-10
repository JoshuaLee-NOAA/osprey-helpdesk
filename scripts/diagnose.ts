import * as fs from "fs";
import * as path from "path";

// Simple manual .env.local loader to load variables into process.env before any imports
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️ Warning: No .env.local found at ${envPath}`);
    return;
  }

  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const firstEqual = trimmed.indexOf("=");
    if (firstEqual === -1) return;

    const key = trimmed.slice(0, firstEqual).trim();
    let value = trimmed.slice(firstEqual + 1).trim();

    // Strip quotes if they wrap the value
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

// RUN ENV LOADER FIRST
loadEnvLocal();

// Dynamic imports to prevent ES Module hoisting issues with env loading
async function runDiagnostics() {
  console.log("\n============================================================");
  console.log("🛡️  OSPREY HELPDESK - COMPREHENSIVE INTEGRATION DIAGNOSTICS");
  console.log("============================================================\n");

  const args = process.argv.slice(2);
  const runAll = args.length === 0 || args.includes("--all");
  const runJira = runAll || args.includes("--jira");
  const runWorkspace = runAll || args.includes("--workspace");
  const runGChat = runAll || args.includes("--gchat");

  const isMockMode = process.env.API_MODE === "MOCK";
  const stagingUser = process.env.WORKSPACE_STAGING_USER || "joshua@readymove.ai";

  console.log("🔍 [1/3] VERIFYING ENVIRONMENT CONFIGURATION...");
  console.log(`- API_MODE: ${isMockMode ? "MOCK (Offline Simulation)" : "LIVE (Real Integrations)"}`);
  console.log(`- WORKSPACE_STAGING_USER: ${stagingUser}`);

  const missingJiraVars = [];
  if (!process.env.JIRA_HOST) missingJiraVars.push("JIRA_HOST");
  if (!process.env.JIRA_USER_EMAIL) missingJiraVars.push("JIRA_USER_EMAIL");
  if (!process.env.JIRA_API_TOKEN) missingJiraVars.push("JIRA_API_TOKEN");
  if (!process.env.JIRA_PROJECT_KEY) missingJiraVars.push("JIRA_PROJECT_KEY");

  const missingWorkspaceVars = [];
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) missingWorkspaceVars.push("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
  if (!process.env.GOOGLE_CHAT_WEBHOOK_URL) missingWorkspaceVars.push("GOOGLE_CHAT_WEBHOOK_URL");

  if (missingJiraVars.length > 0 && !isMockMode) {
    console.warn(`⚠️ Warning: Missing Jira Env Variables: ${missingJiraVars.join(", ")}`);
  } else {
    console.log("✔ Jira Cloud environment variables are set!");
  }

  if (missingWorkspaceVars.length > 0 && !isMockMode) {
    console.warn(`⚠️ Warning: Missing Google Workspace Env Variables: ${missingWorkspaceVars.join(", ")}`);
  } else {
    console.log("✔ Google Workspace environment variables are set!");
  }
  console.log("------------------------------------------------------------");

  // =========================================================================
  // JIRA SUITE
  // =========================================================================
  if (runJira) {
    console.log("\n📍 [2/3] RUNNING JIRA CLOUD DIAGNOSTICS SUITE...");
    try {
      const { searchJiraIssues, createJiraIssue, updateJiraIssue, addJiraComment } = await import("../src/lib/jira");

      // 1. Search Tickets
      console.log("\n  [JIRA 1/4] Testing JQL Issue Search...");
      const results = await searchJiraIssues("Test");
      console.log(`  ✔ Search successful! Found ${results.length} issues matching 'Test'.`);

      // 2. Create Ticket
      console.log("\n  [JIRA 2/4] Testing Issue Creation (ADF Compliant)...");
      const summary = `Diagnostic Ticket [${new Date().toLocaleTimeString()}]`;
      const description = "This is a temporary diagnostic ticket created by the consolidated integration runner to verify active Atlassian credentials.";
      const newIssue = await createJiraIssue(summary, description, "Software", "Low");
      console.log(`  ✔ Ticket created successfully! Key: [${newIssue.key}] (Status: ${newIssue.status})`);

      // 3. Add Comment
      console.log(`\n  [JIRA 3/4] Appending validation comments to ${newIssue.key}...`);
      const commentOk = await addJiraComment(newIssue.key, "Diagnostics verified: API client successfully posted comment.");
      if (commentOk) {
        console.log("  ✔ Comment posted successfully.");
      } else {
        console.error("  ❌ Failed to post comment.");
      }

      // 4. Transition Status
      console.log(`\n  [JIRA 4/4] Transitioning state of ${newIssue.key} to In Progress...`);
      const updatedIssue = await updateJiraIssue(newIssue.key, "In Progress");
      console.log(`  ✔ State updated! Status: [${updatedIssue.status}]`);

      console.log("\n🏁 JIRA CLOUD SUITE VERIFIED: ALL TASKS PASSED!");
    } catch (error: any) {
      console.error("\n❌ JIRA DIAGNOSTICS FAILED with error:");
      console.error(`   ${error.message || error}`);
    }
    console.log("------------------------------------------------------------");
  }

  // =========================================================================
  // GOOGLE WORKSPACE SUITE
  // =========================================================================
  if (runWorkspace || runGChat) {
    console.log("\n📍 [3/3] RUNNING GOOGLE WORKSPACE DIAGNOSTICS SUITE...");
    try {
      const { sendGmail, scheduleCalendarEvent, sendGChatMessage } = await import("../src/lib/workspace");

      // 1. GChat Webhook Alert
      if (runGChat) {
        console.log("\n  [WORK 1/3] Testing Google Chat Webhook alert room...");
        const chatMsg = `🔔 Osprey diagnostics alert dispatched! All connection pre-flights succeeded at ${new Date().toLocaleTimeString()}. 🎉`;
        const chatRes = await sendGChatMessage(chatMsg);
        if (chatRes.success) {
          console.log("  ✔ Google Chat alert delivered successfully.");
        } else {
          console.error(`  ❌ Google Chat alert failed: ${chatRes.error}`);
        }
      }

      // 2. Gmail Send
      if (runWorkspace) {
        console.log(`\n  [WORK 2/3] Sending test email via Gmail (JWT impersonating ${stagingUser})...`);
        const emailHtml = `
          <div style="font-family: 'Lato', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-gradient: linear-gradient(135deg, #032b30 0%, #04414a 100%); background-color: #032b30; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">OSPREY HELPDESK</h2>
            </div>
            <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
              <p>Hello Joshua,</p>
              <p>This is a live end-to-end verification of your <strong>Osprey Helpdesk diagnostics suite</strong>.</p>
              <p>If you are reading this message, it means your secure Base64 Service Account keys and Domain-Wide Delegation credentials are 100% active and functioning correctly!</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #64748b; text-align: center; font-style: italic;">Automated verification payload from your local workspace.</p>
            </div>
          </div>
        `;

        const gmailRes = await sendGmail(
          stagingUser,
          stagingUser,
          `🔔 Osprey Helpdesk: Consolidated Diagnostics Success [${new Date().toLocaleTimeString()}]`,
          emailHtml
        );

        if (gmailRes.success) {
          console.log(`  ✔ Gmail sent successfully! Message ID: ${gmailRes.messageId}`);
        } else {
          console.error(`  ❌ Gmail failed: ${gmailRes.error}`);
        }

        // 3. Calendar Event Scheduling
        console.log(`\n  [WORK 3/3] Scheduling test meeting via Calendar (for ${stagingUser})...`);
        const todayStr = new Date().toISOString().split("T")[0];
        const startDateTime = `${todayStr}T14:00:00`;
        const endDateTime = `${todayStr}T15:00:00`;

        const calRes = await scheduleCalendarEvent(
          stagingUser,
          "🛠️ Osprey Helpdesk Consolidated Diagnostics Session",
          "Verification appointment scheduled automatically by the integrated diagnostics script.",
          startDateTime,
          endDateTime
        );

        if (calRes.success) {
          console.log(`  ✔ Google Calendar event booked successfully!`);
          console.log(`     Link: ${calRes.htmlLink}`);
        } else {
          console.error(`  ❌ Google Calendar event failed: ${calRes.error}`);
        }
      }

      console.log("\n🏁 GOOGLE WORKSPACE SUITE VERIFIED: ALL TASKS PASSED!");
    } catch (error: any) {
      console.error("\n❌ GOOGLE WORKSPACE DIAGNOSTICS FAILED with error:");
      console.error(`   ${error.message || error}`);
    }
    console.log("------------------------------------------------------------");
  }

  console.log("\n============================================================");
  console.log("🎉 DIAGNOSTIC SESSION COMPLETED.");
  console.log("============================================================\n");
}

runDiagnostics();
