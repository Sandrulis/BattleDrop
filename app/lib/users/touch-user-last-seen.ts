import { createAdminClient } from "@/app/lib/supabase/admin";

export async function touchUserLastSeen(userId: string) {
  try {
    const admin = createAdminClient();
    await admin.rpc("touch_user_last_seen", { p_user_id: userId });
  } catch {
    // Session refresh should not fail if last_seen update fails.
  }
}

export { formatLastSeen } from "@/app/lib/site-settings/format-display-date";
