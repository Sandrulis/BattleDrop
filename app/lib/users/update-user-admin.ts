import { createAdminClient } from "@/app/lib/supabase/admin";
import type { AppUser } from "@/app/lib/types";

export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean,
): Promise<AppUser | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId)
    .select(
      "id, email, full_name, avatar_url, is_admin, created_at, updated_at, last_seen, date_format, time_format, date_separator",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("User not found.");
  }

  return data;
}
