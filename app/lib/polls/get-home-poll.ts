import { buildPollWithOptions } from "@/app/lib/polls/build-poll-with-options";
import { getVoteCountsForPoll } from "@/app/lib/polls/get-vote-counts-for-poll";
import type { HomePoll } from "@/app/lib/polls/poll-types";
import { isPollEnabled } from "@/app/lib/polls/is-poll-enabled";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getHomePoll(): Promise<HomePoll | null> {
  if (!(await isPollEnabled())) return null;

  const admin = createAdminClient();
  const { data: poll, error } = await admin
    .from("site_polls")
    .select("id, question, enabled, created_at, updated_at")
    .eq("enabled", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !poll) return null;

  const { data: options, error: optionsError } = await admin
    .from("site_poll_options")
    .select("id, poll_id, label, sort_order")
    .eq("poll_id", poll.id);

  if (optionsError || !options?.length) return null;

  const voteCounts = await getVoteCountsForPoll(poll.id);
  const basePoll = buildPollWithOptions(poll, options, voteCounts);

  const currentUser = await getCurrentAppUser();
  let viewerOptionId: string | null = null;

  if (currentUser) {
    const { data: vote } = await admin
      .from("site_poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    viewerOptionId = vote?.option_id ?? null;
  }

  return {
    ...basePoll,
    viewerOptionId,
  };
}
