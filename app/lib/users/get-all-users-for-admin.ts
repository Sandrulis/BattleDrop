import { createAdminClient } from "@/app/lib/supabase/admin";
import type { AppUser } from "@/app/lib/types";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export function getUserDisplayName(user: Pick<AppUser, "full_name" | "email">) {
  return user.full_name?.trim() || user.email || "Unknown user";
}

export async function getAllUsersForAdmin(): Promise<AppUser[]> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select(
      "id, email, full_name, avatar_url, is_admin, created_at, updated_at, last_seen, date_format, time_format, date_separator",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return [...data].sort((a, b) =>
    getUserDisplayName(a).localeCompare(getUserDisplayName(b), undefined, {
      sensitivity: "base",
    }),
  );
}
