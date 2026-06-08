export const POLL_INTEGRATION_KEY = "integration_poll";

export type SitePollRow = {
  id: string;
  question: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type SitePollOptionRow = {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
};

export type PollOption = {
  id: string;
  label: string;
  sortOrder: number;
  voteCount: number;
};

export type SitePoll = {
  id: string;
  question: string;
  enabled: boolean;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
};

export type HomePoll = SitePoll & {
  viewerOptionId: string | null;
};

export type CreateSitePollInput = {
  question: string;
  options: string[];
};

export type UpdateSitePollInput = {
  enabled?: boolean;
};
