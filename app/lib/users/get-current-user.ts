import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import { createClient } from "@/app/lib/supabase/server";
import type { AppUser } from "@/app/lib/types";

export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, full_name, avatar_url, is_admin, created_at, updated_at, last_seen, date_format, time_format, date_separator, currency, points",
    )
    .eq("id", authUser.id)
    .maybeSingle();

  if (error || !data) return null;

  return data;
}
