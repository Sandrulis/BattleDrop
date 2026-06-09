export type UserSuggestionStatus = "new" | "reviewed" | "accepted" | "declined";

export type UserSuggestionRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: UserSuggestionStatus;
  created_at: string;
  updated_at: string;
};

export type UserSuggestionAuthor = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export type UserSuggestion = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: UserSuggestionStatus;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  upvotedByViewer?: boolean;
  user?: UserSuggestionAuthor;
};

export const USER_SUGGESTION_STATUSES: UserSuggestionStatus[] = [
  "new",
  "reviewed",
  "accepted",
  "declined",
];

export function formatUserSuggestionStatus(status: UserSuggestionStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "reviewed":
      return "Reviewed";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
  }
}

export function mapUserSuggestionRow(
  row: UserSuggestionRow,
  user?: UserSuggestionAuthor,
  upvotes = 0,
  upvotedByViewer?: boolean,
): UserSuggestion {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    upvotes,
    ...(upvotedByViewer ? { upvotedByViewer: true } : {}),
    user,
  };
}

export function compareSuggestionsByPopularity(
  a: UserSuggestion,
  b: UserSuggestion,
): number {
  if (b.upvotes !== a.upvotes) {
    return b.upvotes - a.upvotes;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
