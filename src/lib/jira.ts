import { getJiraConfig } from "./config";

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  type: string;
  severity: string;
}

// Simulated in-memory mock Jira datastore for fully offline local-dev simulation
let mockIssues: JiraIssue[] = [];

/**
 * Encodes basic credentials for Atlassian REST APIs
 */
function getBasicAuthHeader(email: string, token: string): string {
  const creds = `${email}:${token}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

/**
 * Search Jira issues. Fallback to offline mock database if API_MODE=MOCK or credentials absent.
 */
export async function searchJiraIssues(queryText: string): Promise<JiraIssue[]> {
  const isMockMode = process.env.API_MODE === "MOCK";

  const lowerQuery = queryText.toLowerCase().trim();
  const isAllQuery = !lowerQuery || lowerQuery === "all" || lowerQuery === "all active" || lowerQuery === "*";

  if (isMockMode) {
    console.log(`[Jira Client] Running in MOCK mode. Searching mock issues for: "${queryText}"`);
    if (isAllQuery) {
      return mockIssues;
    }
    return mockIssues.filter(
      (issue) =>
        issue.summary.toLowerCase().includes(lowerQuery) ||
        issue.key.toLowerCase().includes(lowerQuery) ||
        issue.type.toLowerCase().includes(lowerQuery)
    );
  }

  // Live Integration mode
  const config = getJiraConfig();
  const authHeader = getBasicAuthHeader(config.JIRA_USER_EMAIL, config.JIRA_API_TOKEN);
  
  // Use JQL (Jira Query Language) to search tickets across the designated project
  let jql = "";
  if (isAllQuery) {
    jql = `project = "${config.JIRA_PROJECT_KEY}" AND status != "Done" AND status != "Resolved" ORDER BY created DESC`;
  } else {
    const escapedQuery = queryText.replace(/"/g, '\\"');
    const isIssueKey = /^[A-Za-z]+-\d+$/.test(queryText.trim());

    if (isIssueKey) {
      jql = `project = "${config.JIRA_PROJECT_KEY}" AND (key = "${escapedQuery}" OR summary ~ "\\"${escapedQuery}\\"" OR text ~ "\\"${escapedQuery}\\"") ORDER BY created DESC`;
    } else {
      jql = `project = "${config.JIRA_PROJECT_KEY}" AND (summary ~ "\\"${escapedQuery}\\"" OR text ~ "\\"${escapedQuery}\\"") ORDER BY created DESC`;
    }
  }
  const url = `${config.JIRA_HOST}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=summary,status,labels`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jira API returned HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const issues = data.issues || [];

    return issues.map((issue: any) => {
      // Extract fields safely with defensive defaults
      const fields = issue.fields || {};
      const labels = fields.labels || [];
      const severity = labels.find((l: string) => ["low", "medium", "high", "critical"].includes(l.toLowerCase())) || "Low";
      const type = labels.find((l: string) => !["low", "medium", "high", "critical", "osprey-helpdesk"].includes(l.toLowerCase())) || "Incident";

      return {
        id: issue.id,
        key: issue.key || `KEY-${issue.id}`,
        summary: fields.summary || "No Summary",
        status: fields.status?.name || "Open",
        type,
        severity,
      };
    });
  } catch (error: any) {
    console.error("❌ Jira Search API failed:", error.message);
    throw error;
  }
}

/**
 * Create a Jira support ticket. Fallback to offline mock database if API_MODE=MOCK.
 */
export async function createJiraIssue(
  summary: string,
  description: string,
  category: string,
  severity: string
): Promise<JiraIssue> {
  const isMockMode = process.env.API_MODE === "MOCK";

  if (isMockMode) {
    console.log(`[Jira Client] Running in MOCK mode. Creating mock issue: "${summary}"`);
    const nextId = String(mockIssues.length + 101);
    const newIssue: JiraIssue = {
      id: nextId,
      key: `OSP-${nextId}`,
      summary,
      status: "Open",
      type: category,
      severity,
    };
    mockIssues.push(newIssue);
    return newIssue;
  }

  // Live Integration mode
  const config = getJiraConfig();
  const authHeader = getBasicAuthHeader(config.JIRA_USER_EMAIL, config.JIRA_API_TOKEN);
  const url = `${config.JIRA_HOST}/rest/api/3/issue`;

  // Jira Cloud V3 requires Atlassian Document Format (ADF) for descriptions
  const bodyPayload = {
    fields: {
      project: {
        key: config.JIRA_PROJECT_KEY,
      },
      summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: description,
              },
            ],
          },
        ],
      },
      issuetype: {
        name: "Task", // Use standard "Task" which exists out of the box in all Jira projects
      },
      labels: ["osprey-helpdesk", category.toLowerCase(), severity.toLowerCase()],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jira Create API returned HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    key: data.key,
    summary,
    status: "Open",
    type: category,
    severity,
  };
}

/**
 * Update Jira issue status or labels. Fallback to offline mock database if API_MODE=MOCK.
 */
export async function updateJiraIssue(
  key: string,
  status?: string,
  category?: string,
  severity?: string
): Promise<JiraIssue> {
  const isMockMode = process.env.API_MODE === "MOCK";

  if (isMockMode) {
    console.log(`[Jira Client] Running in MOCK mode. Updating mock issue: "${key}" to status: "${status}"`);
    const issue = mockIssues.find((i) => i.key.toLowerCase() === key.toLowerCase() || i.id === key);
    if (!issue) {
      throw new Error(`Mock ticket with key/ID ${key} not found.`);
    }
    if (status) issue.status = status;
    if (category) issue.type = category;
    if (severity) issue.severity = severity;
    return issue;
  }

  // Live Integration mode
  const config = getJiraConfig();
  const authHeader = getBasicAuthHeader(config.JIRA_USER_EMAIL, config.JIRA_API_TOKEN);

  // 1. If status update is requested, transition the issue
  if (status) {
    // In Jira, status is changed by posting to /transitions endpoint.
    // First, we fetch available transitions to find the ID matching our target status
    const transUrl = `${config.JIRA_HOST}/rest/api/3/issue/${key}/transitions`;
    const transRes = await fetch(transUrl, {
      method: "GET",
      headers: { Authorization: authHeader, Accept: "application/json" },
    });

    if (transRes.ok) {
      const transData = await transRes.json();
      const transitions = transData.transitions || [];
      const matchingTrans = transitions.find(
        (t: any) => t.name.toLowerCase() === status.toLowerCase() || t.to?.name?.toLowerCase() === status.toLowerCase()
      );

      if (matchingTrans) {
        await fetch(transUrl, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            transition: { id: matchingTrans.id },
          }),
        });
      }
    }
  }

  // 2. Update labels if category or severity is supplied
  if (category || severity) {
    const editUrl = `${config.JIRA_HOST}/rest/api/3/issue/${key}`;
    const labels: string[] = ["osprey-helpdesk"];
    if (category) labels.push(category.toLowerCase());
    if (severity) labels.push(severity.toLowerCase());

    await fetch(editUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fields: { labels },
      }),
    });
  }

  // Fetch and return the updated issue state
  const issueUrl = `${config.JIRA_HOST}/rest/api/3/issue/${key}`;
  const res = await fetch(issueUrl, {
    method: "GET",
    headers: { Authorization: authHeader, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to retrieve updated issue ${key}`);
  }
  const data = await res.json();
  const labels = data.fields.labels || [];
  const foundSeverity = labels.find((l: string) => ["low", "medium", "high", "critical"].includes(l.toLowerCase())) || "Low";
  const foundType = labels.find((l: string) => !["low", "medium", "high", "critical", "osprey-helpdesk"].includes(l.toLowerCase())) || "Incident";

  return {
    id: data.id,
    key: data.key,
    summary: data.fields.summary,
    status: data.fields.status?.name || status || "Open",
    type: foundType,
    severity: foundSeverity,
  };
}

/**
 * Add a comment to a Jira issue.
 */
export async function addJiraComment(key: string, bodyText: string): Promise<boolean> {
  const isMockMode = process.env.API_MODE === "MOCK";

  if (isMockMode) {
    console.log(`[Jira Client] Running in MOCK mode. Adding comment to issue "${key}": "${bodyText}"`);
    return true;
  }

  // Live Integration mode
  const config = getJiraConfig();
  const authHeader = getBasicAuthHeader(config.JIRA_USER_EMAIL, config.JIRA_API_TOKEN);
  const url = `${config.JIRA_HOST}/rest/api/3/issue/${key}/comment`;

  const bodyPayload = {
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: bodyText }],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  return response.ok;
}
