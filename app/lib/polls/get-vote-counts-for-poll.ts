import { createAdminClient } from "@/app/lib/supabase/admin";

export async function getVoteCountsForPoll(pollId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_poll_votes")
    .select("option_id")
    .eq("poll_id", pollId);

  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.option_id, (counts.get(row.option_id) ?? 0) + 1);
  }

  return [...counts.entries()].map(([option_id, count]) => ({
    option_id,
    count,
  }));
}
