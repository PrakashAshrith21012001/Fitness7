import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * One Supabase client for the app, or `null` in local mode.
 *
 * Local mode = no EXPO_PUBLIC_SUPABASE_URL in mobile/.env. The app then runs
 * exactly as the prototype did (session on the phone, nothing verified), so
 * `expo export`, screenshots and the owner demo never need keys.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)?.trim();

export const isConfigured = !!url && !!key;

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (client) return client;
  client = createClient(url!, key!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Native has no URL to read a session from; on web the OAuth redirect lands here.
      detectSessionInUrl: Platform.OS === "web",
    },
  });
  // Refresh the token only while the app is in the foreground (Supabase's own recommendation).
  if (Platform.OS !== "web") {
    AppState.addEventListener("change", (state) => {
      if (state === "active") client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}

/** Current access token for calls to the site's API, or null when signed out / local mode. */
export async function accessToken(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.access_token ?? null;
}
