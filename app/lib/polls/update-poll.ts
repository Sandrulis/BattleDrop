import type { SitePoll, UpdateSitePollInput } from "@/app/lib/polls/poll-types";
import { buildPollWithOptions } from "@/app/lib/polls/build-poll-with-options";
import { getVoteCountsForPoll } from "@/app/lib/polls/get-vote-counts-for-poll";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function updateSitePoll(
  pollId: string,
  input: UpdateSitePollInput,
): Promise<SitePoll> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();

  if (input.enabled === true) {
    await admin
      .from("site_polls")
      .update({ enabled: false })
      .neq("id", pollId)
      .eq("enabled", true);
  }

  const updates: { enabled?: boolean } = {};
  if (input.enabled !== undefined) {
    updates.enabled = input.enabled;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No changes to apply.");
  }

  const { data: poll, error } = await admin
    .from("site_polls")
    .update(updates)
    .eq("id", pollId)
    .select("id, question, enabled, created_at, updated_at")
    .maybeSingle();

  if (error || !poll) {
    throw new Error(error?.message ?? "Poll not found.");
  }

  const { data: options, error: optionsError } = await admin
    .from("site_poll_options")
    .select("id, poll_id, label, sort_order")
    .eq("poll_id", pollId);

  if (optionsError || !options) {
    throw new Error(optionsError?.message ?? "Could not load poll options.");
  }

  const voteCounts = await getVoteCountsForPoll(pollId);

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_poll.update",
    entityType: "site_poll",
    entityId: poll.id,
    metadata: { enabled: poll.enabled },
  });

  return buildPollWithOptions(poll, options, voteCounts);
}
