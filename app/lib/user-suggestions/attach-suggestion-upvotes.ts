import {
  compareSuggestionsByPopularity,
  type UserSuggestion,
} from "@/app/lib/user-suggestions/suggestion-types";
import { createAdminClient } from "@/app/lib/supabase/admin";

type SuggestionUpvoteStats = {
  counts: Map<string, number>;
  viewerUpvotes: Set<string>;
};

async function fetchSuggestionUpvoteStats(
  suggestionIds: string[],
  viewerUserId?: string | null,
): Promise<SuggestionUpvoteStats> {
  const counts = new Map<string, number>();
  const viewerUpvotes = new Set<string>();

  if (suggestionIds.length === 0) {
    return { counts, viewerUpvotes };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_suggestion_upvotes")
    .select("suggestion_id, user_id")
    .in("suggestion_id", suggestionIds);

  if (error || !data) {
    return { counts, viewerUpvotes };
  }

  for (const row of data) {
    const suggestionId = row.suggestion_id as string;
    counts.set(suggestionId, (counts.get(suggestionId) ?? 0) + 1);

    if (viewerUserId && row.user_id === viewerUserId) {
      viewerUpvotes.add(suggestionId);
    }
  }

  return { counts, viewerUpvotes };
}

export async function attachSuggestionUpvotes(
  suggestions: UserSuggestion[],
  viewerUserId?: string | null,
): Promise<UserSuggestion[]> {
  if (suggestions.length === 0) return [];

  const stats = await fetchSuggestionUpvoteStats(
    suggestions.map((suggestion) => suggestion.id),
    viewerUserId,
  );

  return suggestions.map((suggestion) => ({
    ...suggestion,
    upvotes: stats.counts.get(suggestion.id) ?? 0,
    ...(stats.viewerUpvotes.has(suggestion.id) ? { upvotedByViewer: true } : {}),
  }));
}

export async function attachSuggestionUpvotesSorted(
  suggestions: UserSuggestion[],
  viewerUserId?: string | null,
): Promise<UserSuggestion[]> {
  const enriched = await attachSuggestionUpvotes(suggestions, viewerUserId);
  return [...enriched].sort(compareSuggestionsByPopularity);
}
