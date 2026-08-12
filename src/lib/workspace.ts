import { google } from "googleapis";
import { getWorkspaceConfig } from "./config";
import { buildBrandedEmailHtml } from "./email-template";

/**
 * Resolves the active staging/production email address to impersonate.
 * If the user's logged-in email is from an unauthorized external domain (like noaa.gov),
 * it redirects to our authorized 'joshua@readymove.ai' staging address to allow domain-wide delegation to succeed.
 */
export function resolveActiveEmail(userEmail: string): string {
  const stagingUser = process.env.WORKSPACE_STAGING_USER || "joshua@readymove.ai";
  if (userEmail.endsWith("@noaa.gov") || !userEmail.includes("@readymove.ai")) {
    console.log(`🔧 [Workspace API Redirect] Mapping user email "${userEmail}" -> "${stagingUser}"`);
    return stagingUser;
  }
  return userEmail;
}

/**
 * Creates an authorized JWT client for Google APIs, impersonating the designated employee
 * to enable Gmail and Google Calendar access via Domain-Wide Delegation.
 */
function getGoogleAuthClient(impersonateEmail: string) {
  const config = getWorkspaceConfig();
  
  if (!config.credentials) {
    throw new Error(
      "❌ Google Service Account is not configured.\n" +
      "Please set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 in your .env.local file."
    );
  }
  
  const activeEmail = resolveActiveEmail(impersonateEmail);
  
  // Create JWT Auth Client with Workspace Scopes
  return new google.auth.JWT({
    email: config.credentials.client_email,
    key: config.credentials.private_key,
    scopes: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
    ],
    subject: activeEmail,
  });
}

/**
 * Sends a real email via Gmail API by impersonating the authenticated employee.
 * Falls back to detailed console log dry-run if API_MODE=MOCK.
 */
export async function sendGmail(
  userEmail: string,
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const isMockMode = process.env.API_MODE === "MOCK";

  // Ensure every outgoing email is wrapped in Osprey's branded HTML email template
  const finalHtml = htmlContent.trim().startsWith("<!DOCTYPE html>")
    ? htmlContent
    : buildBrandedEmailHtml({
        title: subject,
        badgeText: "OSPREY IT NOTIFICATION",
        badgeType: "info",
        contentHtml: htmlContent,
      });

  if (isMockMode) {
    console.log(`[Workspace API] (MOCK) Gmail sent successfully:`);
    console.log(`  From:    ${userEmail}`);
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:    ${finalHtml}`);
    return { success: true, messageId: `mock-msg-${Date.now()}` };
  }

  try {
    const activeEmail = resolveActiveEmail(userEmail);
    const activeRecipient = to; // Deliver directly to the requested recipient email
    console.log(`📧 [Gmail Client] Sending email | From (Sender): "${activeEmail}" | To (Recipient): "${activeRecipient}"`);
    const auth = getGoogleAuthClient(activeEmail);
    const gmail = google.gmail({ version: "v1", auth });

    // Construct raw MIME email
    const emailLines = [
      `From: ${activeEmail}`,
      `To: ${activeRecipient}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${subject}`,
      "",
      finalHtml,
    ];

    const emailRaw = emailLines.join("\r\n");
    const base64Safe = Buffer.from(emailRaw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64Safe,
      },
    });

    console.log(`✅ [Gmail Client] Email sent via Gmail API. ID: ${response.data.id}`);
    return { success: true, messageId: response.data.id || undefined };
  } catch (error: any) {
    console.error("❌ [Gmail Client] Failed to send email:", error);
    
    // Provide a detailed helpful troubleshooting prompt for DWD
    const errorMsg = error.message || "";
    if (errorMsg.includes("unauthorized_client") || errorMsg.includes("access_denied")) {
      return {
        success: false,
        error: "Google Workspace Domain-Wide Delegation is required for your Service Account to send mail. Please authorize Gmail scopes in your Google Admin console (https://admin.google.com).",
      };
    }
    
    return {
      success: false,
      error: error.message || "Unknown error occurred during email transmission.",
    };
  }
}

/**
 * Dispatches a threaded notification or alert card directly to a Google Chat Space via webhook.
 */
export async function sendGChatMessage(
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  const isMockMode = process.env.API_MODE === "MOCK";

  if (isMockMode) {
    console.log(`[Workspace API] (MOCK) Google Chat sent successfully:`);
    console.log(`  Content: "${messageText}"`);
    return { success: true };
  }

  try {
    const config = getWorkspaceConfig();
    
    if (!config.gchatWebhookUrl) {
      throw new Error(
        "❌ Google Chat integration is not configured.\n" +
        "Please set GOOGLE_WORKSPACE_GCHAT_WEBHOOK_URL in your .env.local file."
      );
    }
    
    const response = await fetch(config.gchatWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: messageText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Chat webhook returned HTTP ${response.status}: ${errorText}`);
    }

    console.log(`✅ [Google Chat Client] Webhook notification dispatched successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ [Google Chat Client] Failed to dispatch webhook:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred during Chat dispatch.",
    };
  }
}

/**
 * Books an event on the employee's Google Calendar by impersonating their email address.
 * startDateTime and endDateTime must be ISO-8601 strings (e.g. "2026-08-10T10:00:00Z").
 */
export async function scheduleCalendarEvent(
  userEmail: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> {
  const isMockMode = process.env.API_MODE === "MOCK";

  if (isMockMode) {
    console.log(`[Workspace API] (MOCK) Calendar event booked successfully:`);
    console.log(`  Calendar: ${userEmail}`);
    console.log(`  Summary:  ${summary}`);
    console.log(`  Desc:     ${description}`);
    console.log(`  Start:    ${startDateTime}`);
    console.log(`  End:      ${endDateTime}`);
    return {
      success: true,
      eventId: `mock-evt-${Date.now()}`,
      htmlLink: "https://calendar.google.com",
    };
  }

  try {
    const auth = getGoogleAuthClient(userEmail);
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: "America/New_York", // Standard NOAA region fallback
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/New_York",
        },
      },
    });

    console.log(`✅ [Calendar Client] Event created successfully: ${response.data.htmlLink}`);
    return {
      success: true,
      eventId: response.data.id || undefined,
      htmlLink: response.data.htmlLink || undefined,
    };
  } catch (error: any) {
    console.error("❌ [Calendar Client] Failed to create event:", error);

    const errorMsg = error.message || "";
    if (errorMsg.includes("unauthorized_client") || errorMsg.includes("access_denied")) {
      return {
        success: false,
        error: "Google Workspace Domain-Wide Delegation is required for Calendar API. Enable Calendar scopes in your Google Admin console.",
      };
    }

    return {
      success: false,
      error: error.message || "Unknown error occurred during calendar scheduling.",
    };
  }
}
