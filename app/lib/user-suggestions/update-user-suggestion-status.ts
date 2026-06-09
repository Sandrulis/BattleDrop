import {
  mapUserSuggestionRow,
  type UserSuggestion,
  type UserSuggestionStatus,
} from "@/app/lib/user-suggestions/suggestion-types";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function updateUserSuggestionStatus(
  suggestionId: string,
  status: UserSuggestionStatus,
): Promise<UserSuggestion> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_suggestions")
    .update({ status })
    .eq("id", suggestionId)
    .select("id, user_id, title, description, status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update suggestion.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "user_suggestion.update_status",
    entityType: "user_suggestion",
    entityId: suggestionId,
    metadata: { status },
  });

  return mapUserSuggestionRow(data);
}
