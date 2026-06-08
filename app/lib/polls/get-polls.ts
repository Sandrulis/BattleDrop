import { buildPollWithOptions } from "@/app/lib/polls/build-poll-with-options";
import { getVoteCountsForPoll } from "@/app/lib/polls/get-vote-counts-for-poll";
import type { SitePoll } from "@/app/lib/polls/poll-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getSitePolls(): Promise<SitePoll[]> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return [];

  const admin = createAdminClient();
  const { data: polls, error } = await admin
    .from("site_polls")
    .select("id, question, enabled, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error || !polls?.length) return [];

  const pollIds = polls.map((poll) => poll.id);
  const { data: options, error: optionsError } = await admin
    .from("site_poll_options")
    .select("id, poll_id, label, sort_order")
    .in("poll_id", pollIds);

  if (optionsError || !options) return [];

  const results: SitePoll[] = [];
  for (const poll of polls) {
    const pollOptions = options.filter((option) => option.poll_id === poll.id);
    const voteCounts = await getVoteCountsForPoll(poll.id);
    results.push(buildPollWithOptions(poll, pollOptions, voteCounts));
  }

  return results;
}
