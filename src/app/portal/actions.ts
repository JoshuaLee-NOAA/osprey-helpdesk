"use server";

import { searchJiraIssues } from "@/lib/jira";

export interface TicketItem {
  id: string;
  key: string;
  summary: string;
  status: string;
  type: string;
  severity: string;
}

export async function getJiraTicketsAction(email: string) {
  try {
    if (!email) {
      return { success: false, error: "No email provided." };
    }

    // Retrieve all issues containing the user's email
    const allIssues = await searchJiraIssues(email);

    // Filter into active and resolved states
    const activeStates = ["open", "to do", "in progress", "pending approval", "under review"];
    
    const activeTickets = allIssues.filter((ticket) => 
      activeStates.includes(ticket.status.toLowerCase())
    );

    const resolvedTickets = allIssues.filter((ticket) => 
      !activeStates.includes(ticket.status.toLowerCase())
    );

    return {
      success: true,
      activeTickets,
      resolvedTickets,
    };
  } catch (error: any) {
    console.error("❌ getJiraTicketsAction failed:", error.message);
    return {
      success: false,
      error: error.message || "Failed to retrieve Jira tickets.",
    };
  }
}
