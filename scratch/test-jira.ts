import * as fs from "fs";
import * as path from "path";

// Simple manual .env.local loader to avoid Next.js module loading issues
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

loadEnvLocal();

import { searchJiraIssues, createJiraIssue } from "../src/lib/jira";

async function runTest() {
  console.log("=========================================");
  console.log("OSPREY IT HELPDESK - JIRA INTEGRATION TEST");
  console.log("=========================================\n");

  console.log("Environment variables loaded:");
  console.log(`- JIRA_HOST: ${process.env.JIRA_HOST || "NOT SET (Commented out or missing)"}`);
  console.log(`- JIRA_USER_EMAIL: ${process.env.JIRA_USER_EMAIL || "NOT SET (Commented out or missing)"}`);
  console.log(`- JIRA_PROJECT_KEY: ${process.env.JIRA_PROJECT_KEY || "NOT SET (Commented out or missing)"}`);
  console.log(`- JIRA_API_TOKEN is ${process.env.JIRA_API_TOKEN ? "Present" : "NOT SET (Commented out or missing)"}\n`);

  if (!process.env.JIRA_HOST || !process.env.JIRA_USER_EMAIL || !process.env.JIRA_API_TOKEN) {
    console.error("❌ ERROR: Jira credentials are not fully configured in your .env.local file yet!");
    console.log("Please uncomment and fill in the Jira section inside .env.local, then run this test again.");
    process.exit(1);
  }

  try {
    console.log("1. Testing Issue Search...");
    const searchResults = await searchJiraIssues("Test");
    console.log(`✅ Success! Found ${searchResults.length} existing tickets containing 'Test'.`);
    if (searchResults.length > 0) {
      console.log("Sample tickets:");
      searchResults.slice(0, 3).forEach((t) => {
        console.log(`  - [${t.key}] ${t.summary} (Status: ${t.status}, Severity: ${t.severity})`);
      });
    }
    console.log("");

    console.log("2. Testing Issue Creation...");
    const testSummary = `Test Ticket - Osprey Helpdesk Verification [${new Date().toLocaleTimeString()}]`;
    const testDescription = "This is an automated test ticket dispatched from the Osprey IT Helpdesk scratch test suite to verify end-to-end Atlassian REST API credentials.";
    const createdIssue = await createJiraIssue(
      testSummary,
      testDescription,
      "Software",
      "Low"
    );

    console.log("✅ Success! Registered ticket in Jira Cloud:");
    console.log(`- Key: ${createdIssue.key}`);
    console.log(`- ID: ${createdIssue.id}`);
    console.log(`- Summary: ${createdIssue.summary}`);
    console.log(`- Category: ${createdIssue.type}`);
    console.log(`- Severity: ${createdIssue.severity}`);
    console.log(`- Status: ${createdIssue.status}\n`);

    console.log("=========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (err: any) {
    console.error("\n❌ TEST FAILED with error:");
    console.error(err.message || err);
    console.log("\nDouble-check your credentials in .env.local and make sure the Project Key exists in your Jira Cloud instance.");
  }
}

runTest();
