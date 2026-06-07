import { createAdminClient } from "@/app/lib/supabase/admin";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import type { AppUser } from "@/app/lib/types";

export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean,
): Promise<AppUser | null> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId)
    .select(
      "id, email, full_name, avatar_url, is_admin, created_at, updated_at, last_seen, date_format, time_format, date_separator, currency, points",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("User not found.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "user.admin.update",
    entityType: "user",
    entityId: userId,
    metadata: { isAdmin },
  });

  return data;
}
