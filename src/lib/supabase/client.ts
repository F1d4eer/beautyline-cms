import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Return a real client only when env vars are present.
// Without them the public site still works — admin features are disabled.
export const supabase = (url && key)
  ? createClient<Database>(url, key)
  : null as unknown as ReturnType<typeof createClient<Database>>;

export const isSupabaseReady = Boolean(url && key);
