import {
  EMPTY_ADMIN_ALERT_COUNTS,
  type AdminAlertCounts,
} from "@/app/lib/admin-alerts/admin-alert-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getAdminAlertCounts(): Promise<AdminAlertCounts> {
  const user = await getCurrentAppUser();
  if (!user?.is_admin) {
    return EMPTY_ADMIN_ALERT_COUNTS;
  }

  const admin = createAdminClient();
  const [supportResult, suggestionsResult] = await Promise.all([
    admin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    admin
      .from("user_suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    support: supportResult.count ?? 0,
    suggestions: suggestionsResult.count ?? 0,
  };
}
