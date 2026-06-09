import { attachSuggestionUpvotesSorted } from "@/app/lib/user-suggestions/attach-suggestion-upvotes";
import {
  mapUserSuggestionRow,
  type UserSuggestion,
  type UserSuggestionAuthor,
  type UserSuggestionRow,
} from "@/app/lib/user-suggestions/suggestion-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UserSuggestionRowWithUser = UserSuggestionRow & {
  users: UserSuggestionAuthor | UserSuggestionAuthor[] | null;
};

function mapUserRelation(
  users: UserSuggestionAuthor | UserSuggestionAuthor[] | null,
): UserSuggestionAuthor | undefined {
  if (!users) return undefined;
  return Array.isArray(users) ? users[0] : users;
}

export async function getUserSuggestionsForAdmin(): Promise<UserSuggestion[]> {
  const user = await getCurrentAppUser();
  if (!user?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_suggestions")
    .select(
      "id, user_id, title, description, status, created_at, updated_at, users ( id, full_name, email, avatar_url )",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const suggestions = (data as UserSuggestionRowWithUser[]).map((row) =>
    mapUserSuggestionRow(row, mapUserRelation(row.users)),
  );

  return attachSuggestionUpvotesSorted(suggestions);
}
