import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Lazy initiator for the administrative Supabase client.
 * This ensures the client is only instantiated on-demand when requested by a server-side route,
 * preventing Next.js build-time failures if the environment variables are not yet present.
 */
let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getSupabaseConfig();
  cachedClient = createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false, // Server-side environment, no need to persist cookie sessions
    },
  });

  return cachedClient;
}
