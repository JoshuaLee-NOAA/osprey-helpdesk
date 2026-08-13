import { z } from "zod";

const isServer = typeof window === "undefined";

// Core environment variables required for Next.js and LLM Gateway startup
const coreEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk Publishable Key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk Secret Key is required"),
  AI_GATEWAY_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

// Parse and validate core startup credentials on server side
if (isServer) {
  const parsedCore = coreEnvSchema.safeParse(process.env);
  if (!parsedCore.success) {
    console.error("❌ OSPREY STARTUP ERROR: Missing core credentials inside .env.local!");
    console.error(JSON.stringify(parsedCore.error.format(), null, 2));
  }
}

export const coreConfig = isServer ? coreEnvSchema.safeParse(process.env).data || null : null;

/**
 * Validates and retrieves Supabase credentials.
 * Throws explicit errors with setup links if variables are missing.
 */
export function getSupabaseConfig() {
  const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "Supabase service role key must be a valid token"),
  });

  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "❌ Supabase Integration Error:\n" +
      "Missing Supabase variables inside your .env.local.\n" +
      "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n" +
      "See instructions: https://supabase.com/dashboard"
    );
  }
  return result.data;
}

/**
 * Validates and retrieves Jira Cloud credentials.
 * Throws explicit errors with setup links if variables are missing.
 */
export function getJiraConfig() {
  const schema = z.object({
    JIRA_HOST: z.string().url("Jira host must be a valid URL (e.g. https://your-domain.atlassian.net)"),
    JIRA_USER_EMAIL: z.string().email("Invalid Jira user email address"),
    JIRA_API_TOKEN: z.string().min(1, "Jira API Token is required"),
    JIRA_PROJECT_KEY: z.string().min(2, "Jira Project Key must be at least 2 characters (e.g. OSP)"),
  });

  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "❌ Jira Cloud Integration Error:\n" +
      "Missing Jira variables inside your .env.local.\n" +
      "Please set JIRA_HOST, JIRA_USER_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY.\n" +
      "Get your Jira API token from: https://id.atlassian.com/manage-profile/security/api-tokens"
    );
  }
  return result.data;
}

/**
 * Validates and retrieves Google Workspace credentials.
 * Throws explicit errors with setup links if variables are missing.
 */
export function getWorkspaceConfig() {
  const schema = z.object({
    GOOGLE_WORKSPACE_GCHAT_WEBHOOK_URL: z.string().url("Invalid Google Chat Webhook URL").optional(),
    GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: z.string().min(50, "Google Service Account key must be a valid base64-encoded string").optional(),
  });

  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "❌ Google Workspace Integration Error:\n" +
      "Invalid Workspace configuration variables in .env.local."
    );
  }

  let credentials = null;
  if (result.data.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      const jsonString = Buffer.from(result.data.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8");
      credentials = JSON.parse(jsonString);
    } catch (err) {
      throw new Error(
        "❌ Google Workspace Integration Error:\n" +
        "Failed to decode or parse GOOGLE_SERVICE_ACCOUNT_JSON_BASE64. Ensure it is a valid base64-encoded JSON key file."
      );
    }
  }

  return {
    gchatWebhookUrl: result.data.GOOGLE_WORKSPACE_GCHAT_WEBHOOK_URL,
    credentials,
  };
}

/**
 * Validates and retrieves Google Cloud Platform billing and org identifiers.
 * Throws explicit errors with setup links if variables are missing.
 */
export function getGcpConfig() {
  const schema = z.object({
    GCP_ORGANIZATION_ID: z.string().regex(/^\d+$/, "GCP Organization ID must be a numeric string"),
    GCP_BILLING_ACCOUNT_ID: z.string().regex(/^[0-9A-F]{6}-[0-9A-F]{6}-[0-9A-F]{6}$/i, "Invalid GCP Billing Account ID format (AAAAAA-BBBBBB-CCCCCC)"),
    GCP_DEFAULT_REGION: z.string().default("us-central1"),
    GCP_DEFAULT_ZONE: z.string().default("us-central1-a"),
  });

  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "❌ Google Cloud (GCP) DevOps Configuration Error:\n" +
      "Missing GCP variables inside your .env.local.\n" +
      "Please set GCP_ORGANIZATION_ID, GCP_BILLING_ACCOUNT_ID, GCP_DEFAULT_REGION, and GCP_DEFAULT_ZONE.\n" +
      "Locate these IDs on your Google Cloud Console."
    );
  }
  return result.data;
}
