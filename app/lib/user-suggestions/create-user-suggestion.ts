import {
  mapUserSuggestionRow,
  type UserSuggestion,
} from "@/app/lib/user-suggestions/suggestion-types";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function createUserSuggestion(
  title: string,
  description: string,
): Promise<UserSuggestion> {
  const user = await getCurrentAppUser();
  if (!user) {
    throw new Error("Sign in required.");
  }

  assertMaxLength(title, INPUT_LIMITS.suggestionTitle, "Title");
  assertMaxLength(description, INPUT_LIMITS.suggestionDescription, "Description");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_suggestions")
    .insert({
      user_id: user.id,
      title,
      description,
    })
    .select("id, user_id, title, description, status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not submit suggestion.");
  }

  return mapUserSuggestionRow(data, undefined, 0);
}
