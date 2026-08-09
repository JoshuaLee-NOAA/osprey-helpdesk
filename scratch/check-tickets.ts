import { getJiraConfig } from "../src/lib/config";

function getBasicAuthHeader(email: string, token: string): string {
  const creds = `${email}:${token}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

async function checkAllTickets() {
  const config = getJiraConfig();
  const authHeader = getBasicAuthHeader(config.JIRA_USER_EMAIL, config.JIRA_API_TOKEN);
  
  // Search for ALL tickets in the project
  const jql = `project = "${config.JIRA_PROJECT_KEY}" ORDER BY created DESC`;
  const url = `${config.JIRA_HOST}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=summary,status,labels,assignee,reporter,creator,description`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`Found ${data.issues?.length} total issues in project ${config.JIRA_PROJECT_KEY}:\n`);

    data.issues?.forEach((issue: any) => {
      console.log(`- [${issue.key}] ${issue.fields.summary}`);
      console.log(`  Status:    ${issue.fields.status?.name}`);
      console.log(`  Labels:    ${JSON.stringify(issue.fields.labels)}`);
      console.log(`  Assignee:  ${issue.fields.assignee?.emailAddress} (${issue.fields.assignee?.displayName})`);
      console.log(`  Reporter:  ${issue.fields.reporter?.emailAddress} (${issue.fields.reporter?.displayName})`);
      console.log(`  Creator:   ${issue.fields.creator?.emailAddress} (${issue.fields.creator?.displayName})`);
      console.log(`  Desc:      ${JSON.stringify(issue.fields.description?.content?.[0]?.content?.[0]?.text || "")}`);
      console.log(`------------------------------------------------`);
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
  }
}

checkAllTickets();
