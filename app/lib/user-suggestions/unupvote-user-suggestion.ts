import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export type UnupvoteUserSuggestionResult = {
  upvotes: number;
  upvotedByViewer: false;
};

export async function unupvoteUserSuggestion(
  suggestionId: string,
): Promise<UnupvoteUserSuggestionResult> {
  const user = await getCurrentAppUser();
  if (!user) {
    throw new Error("Sign in required.");
  }

  const admin = createAdminClient();
  const { data: suggestion, error: suggestionError } = await admin
    .from("user_suggestions")
    .select("id, user_id")
    .eq("id", suggestionId)
    .maybeSingle();

  if (suggestionError) {
    throw new Error(suggestionError.message);
  }

  if (!suggestion) {
    throw new Error("Suggestion not found.");
  }

  if (suggestion.user_id === user.id) {
    throw new Error("You cannot upvote your own suggestion.");
  }

  const { data: deleted, error: deleteError } = await admin
    .from("user_suggestion_upvotes")
    .delete()
    .eq("suggestion_id", suggestionId)
    .eq("user_id", user.id)
    .select("id");

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!deleted?.length) {
    throw new Error("You have not upvoted this suggestion.");
  }

  const { count, error: countError } = await admin
    .from("user_suggestion_upvotes")
    .select("id", { count: "exact", head: true })
    .eq("suggestion_id", suggestionId);

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    upvotes: count ?? 0,
    upvotedByViewer: false,
  };
}
