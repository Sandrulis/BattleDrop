import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/app/lib/supabase/admin";

function profileFromAuthUser(authUser: User) {
  const now = new Date().toISOString();

  return {
    email: authUser.email ?? null,
    full_name: (authUser.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
    updated_at: now,
    last_seen: now,
  };
}

export async function syncUserFromAuth(authUser: User) {
  const admin = createAdminClient();
  const profile = profileFromAuthUser(authUser);

  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("users")
      .update(profile)
      .eq("id", authUser.id);

    if (error) throw error;
    return;
  }

  const { error } = await admin.from("users").insert({
    id: authUser.id,
    ...profile,
    is_admin: false,
  });

  if (error) throw error;
}
