import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export type UpvoteUserSuggestionResult = {
  upvotes: number;
  upvotedByViewer: true;
};

export async function upvoteUserSuggestion(
  suggestionId: string,
): Promise<UpvoteUserSuggestionResult> {
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

  const { error: insertError } = await admin.from("user_suggestion_upvotes").insert({
    suggestion_id: suggestionId,
    user_id: user.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("You already upvoted this suggestion.");
    }

    throw new Error(insertError.message);
  }

  const { count, error: countError } = await admin
    .from("user_suggestion_upvotes")
    .select("id", { count: "exact", head: true })
    .eq("suggestion_id", suggestionId);

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    upvotes: count ?? 1,
    upvotedByViewer: true,
  };
}
