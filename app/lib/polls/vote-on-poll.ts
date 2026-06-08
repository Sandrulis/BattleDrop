import type { HomePoll } from "@/app/lib/polls/poll-types";
import { buildPollWithOptions } from "@/app/lib/polls/build-poll-with-options";
import { getVoteCountsForPoll } from "@/app/lib/polls/get-vote-counts-for-poll";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function voteOnPoll(
  pollId: string,
  optionId: string,
): Promise<HomePoll> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    throw new Error("Sign in required.");
  }

  const admin = createAdminClient();

  const { data: poll, error: pollError } = await admin
    .from("site_polls")
    .select("id, question, enabled, created_at, updated_at")
    .eq("id", pollId)
    .eq("enabled", true)
    .maybeSingle();

  if (pollError) {
    throw new Error(pollError.message);
  }

  if (!poll) {
    throw new Error("Poll not found or not active.");
  }

  const { data: option, error: optionError } = await admin
    .from("site_poll_options")
    .select("id")
    .eq("id", optionId)
    .eq("poll_id", pollId)
    .maybeSingle();

  if (optionError) {
    throw new Error(optionError.message);
  }

  if (!option) {
    throw new Error("Invalid answer option.");
  }

  const { data: existingVote } = await admin
    .from("site_poll_votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (existingVote) {
    throw new Error("You already voted in this poll.");
  }

  const { error: insertError } = await admin.from("site_poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: currentUser.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("You already voted in this poll.");
    }
    throw new Error(insertError.message);
  }

  const { data: options, error: optionsError } = await admin
    .from("site_poll_options")
    .select("id, poll_id, label, sort_order")
    .eq("poll_id", pollId);

  if (optionsError || !options) {
    throw new Error(optionsError?.message ?? "Could not load poll options.");
  }

  const voteCounts = await getVoteCountsForPoll(pollId);
  const basePoll = buildPollWithOptions(poll, options, voteCounts);

  return {
    ...basePoll,
    viewerOptionId: optionId,
  };
}
