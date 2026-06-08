import type {
  PollOption,
  SitePoll,
  SitePollOptionRow,
  SitePollRow,
} from "@/app/lib/polls/poll-types";

type VoteCountRow = {
  option_id: string;
  count: number;
};

export function buildPollWithOptions(
  poll: SitePollRow,
  optionRows: SitePollOptionRow[],
  voteCounts: VoteCountRow[],
): SitePoll {
  const countByOption = new Map(
    voteCounts.map((row) => [row.option_id, row.count]),
  );

  const options: PollOption[] = optionRows
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      id: row.id,
      label: row.label,
      sortOrder: row.sort_order,
      voteCount: countByOption.get(row.id) ?? 0,
    }));

  const totalVotes = options.reduce((sum, option) => sum + option.voteCount, 0);

  return {
    id: poll.id,
    question: poll.question,
    enabled: poll.enabled,
    options,
    totalVotes,
    createdAt: poll.created_at,
    updatedAt: poll.updated_at,
  };
}
