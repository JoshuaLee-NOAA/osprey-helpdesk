"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { searchJiraIssues } from "@/lib/jira";

export interface TicketItem {
  id: string;
  key: string;
  summary: string;
  status: string;
  type: string;
  severity: string;
}

export async function getJiraTicketsAction(clientEmail?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized access: Active user session required." };
    }

    const user = await currentUser();
    const authenticatedEmail = user?.emailAddresses?.[0]?.emailAddress;
    const targetEmail = authenticatedEmail || clientEmail;

    if (!targetEmail) {
      return { success: false, error: "No authenticated email associated with session." };
    }

    // Retrieve all Jira issues containing the authenticated user's email
    const allIssues = await searchJiraIssues(targetEmail);

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
