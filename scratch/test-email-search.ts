import { searchJiraIssues } from "../src/lib/jira";

async function run() {
  try {
    console.log("Searching Jira issues for joshua.lee@noaa.gov...");
    const results = await searchJiraIssues("joshua.lee@noaa.gov");
    console.log(`✅ Success! Found ${results.length} issues:`);
    results.forEach((r) => {
      console.log(`  - [${r.key}] ${r.summary} (Status: ${r.status})`);
    });
  } catch (error: any) {
    console.error("❌ Email search failed!");
    console.error(error);
  }
}

run();
