import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { formatLastSeen } from "@/app/lib/site-settings/format-display-date";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";
import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import { createAdminClient } from "@/app/lib/supabase/admin";
import type { ProductComment } from "./types";

const DEMO_COMMENTS_BY_PRODUCT: Record<string, ProductComment[]> = {
  "1": [
    {
      id: "c1",
      author: "@devdan",
      authorUserId: "demo-devdan",
      authorTotalUpvotes: 18,
      body: "Finally a changelog tool that doesn't feel like an afterthought. The weekly digest emails are gorgeous.",
      createdAt: "2h ago",
      likes: 12,
      replies: [
        {
          id: "c1-r1",
          author: "@lena_k",
          authorUserId: "demo-lena",
          authorTotalUpvotes: 9,
          body: "Thanks! We spent a lot of time on the email templates — glad it's paying off.",
          createdAt: "1h ago",
          likes: 6,
        },
      ],
    },
    {
      id: "c2",
      author: "@priya_s",
      authorUserId: "demo-priya",
      authorTotalUpvotes: 14,
      body: "We switched from a Notion page to OrbitKit last month — open rates on updates went from 9% to 41%.",
      createdAt: "5h ago",
      likes: 8,
    },
  ],
  "2": [
    {
      id: "c4",
      author: "@joel_r",
      authorUserId: "demo-joel",
      authorTotalUpvotes: 11,
      body: "Rollback in production without waking up the on-call team. This should be standard everywhere.",
      createdAt: "3h ago",
      likes: 9,
    },
  ],
};

type CommentUpvoteStats = {
  counts: Map<string, number>;
  viewerUpvotes: Set<string>;
  firstUpvoters: Map<
    string,
    { avatarUrl: string | null; name: string }
  >;
};

type CommentAuthor = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type UpvoteUser = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type ProjectCommentRow = {
  id: string;
  project_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  users: CommentAuthor | CommentAuthor[] | null;
};

function isDemoProductId(productId: string) {
  return /^\d+$/.test(productId);
}

function resolveCommentAuthor(users: CommentAuthor | CommentAuthor[] | null) {
  const user = Array.isArray(users) ? (users[0] ?? null) : users;
  return formatMakerHandle(user ?? { full_name: null, email: null });
}

function countCommentTree(comments: ProductComment[]): number {
  return comments.reduce((total, comment) => {
    const replies = comment.replies ? countCommentTree(comment.replies) : 0;
    return total + 1 + replies;
  }, 0);
}

function resolveUpvoterName(users: UpvoteUser | UpvoteUser[] | null) {
  const user = Array.isArray(users) ? (users[0] ?? null) : users;
  return formatMakerHandle(user ?? { full_name: null, email: null });
}

export async function getUserCommentUpvoteCounts(
  userIds: string[],
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  const uniqueIds = [...new Set(userIds)];

  for (const id of uniqueIds) {
    totals.set(id, 0);
  }

  if (uniqueIds.length === 0 || !isSupabaseConfigured()) {
    return totals;
  }

  const admin = createAdminClient();
  const { data: comments, error: commentsError } = await admin
    .from("project_comments")
    .select("id, user_id")
    .in("user_id", uniqueIds);

  if (commentsError || !comments?.length) {
    return totals;
  }

  const commentToAuthor = new Map<string, string>();
  for (const row of comments) {
    commentToAuthor.set(row.id as string, row.user_id as string);
  }

  const { data: upvotes, error: upvotesError } = await admin
    .from("project_comment_upvotes")
    .select("comment_id")
    .in("comment_id", [...commentToAuthor.keys()]);

  if (upvotesError || !upvotes) {
    return totals;
  }

  for (const row of upvotes) {
    const authorId = commentToAuthor.get(row.comment_id as string);
    if (authorId) {
      totals.set(authorId, (totals.get(authorId) ?? 0) + 1);
    }
  }

  return totals;
}

export async function getUserCommentUpvoteCount(
  userId: string,
): Promise<number> {
  const totals = await getUserCommentUpvoteCounts([userId]);
  return totals.get(userId) ?? 0;
}

async function fetchCommentUpvoteStats(
  commentIds: string[],
  viewerUserId?: string | null,
): Promise<CommentUpvoteStats> {
  const counts = new Map<string, number>();
  const viewerUpvotes = new Set<string>();
  const firstUpvoters = new Map<
    string,
    { avatarUrl: string | null; name: string }
  >();

  if (commentIds.length === 0 || !isSupabaseConfigured()) {
    return { counts, viewerUpvotes, firstUpvoters };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_comment_upvotes")
    .select(
      "comment_id, user_id, created_at, users ( full_name, email, avatar_url )",
    )
    .in("comment_id", commentIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return { counts, viewerUpvotes, firstUpvoters };
  }

  for (const row of data) {
    const commentId = row.comment_id as string;
    counts.set(commentId, (counts.get(commentId) ?? 0) + 1);
    if (!firstUpvoters.has(commentId)) {
      const users = row.users as UpvoteUser | UpvoteUser[] | null;
      const user = Array.isArray(users) ? (users[0] ?? null) : users;
      firstUpvoters.set(commentId, {
        avatarUrl: user?.avatar_url ?? null,
        name: resolveUpvoterName(users),
      });
    }
    if (viewerUserId && row.user_id === viewerUserId) {
      viewerUpvotes.add(commentId);
    }
  }

  return { counts, viewerUpvotes, firstUpvoters };
}

function buildCommentTree(
  rows: ProjectCommentRow[],
  dateSettings: SiteDateTimeSettings,
  upvoteStats: CommentUpvoteStats,
  authorUpvoteTotals: Map<string, number>,
  viewerUserId?: string | null,
): ProductComment[] {
  const byParent = new Map<string | null, ProjectCommentRow[]>();

  for (const row of rows) {
    const key = row.parent_id;
    const bucket = byParent.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      byParent.set(key, [row]);
    }
  }

  function build(parentId: string | null): ProductComment[] {
    const children = byParent.get(parentId) ?? [];

    return children
      .sort((left, right) => left.created_at.localeCompare(right.created_at))
      .map((row) => {
        const replies = build(row.id);
        const upvotedByViewer = viewerUserId
          ? upvoteStats.viewerUpvotes.has(row.id)
          : false;

        const likes = upvoteStats.counts.get(row.id) ?? 0;
        const firstUpvoter = upvoteStats.firstUpvoters.get(row.id);
        const users = row.users as CommentAuthor | CommentAuthor[] | null;
        const author = Array.isArray(users) ? (users[0] ?? null) : users;

        return {
          id: row.id,
          author: resolveCommentAuthor(row.users),
          authorUserId: row.user_id,
          authorAvatarUrl: author?.avatar_url ?? null,
          authorDisplayName:
            author?.full_name?.trim() || resolveCommentAuthor(row.users),
          authorTotalUpvotes: authorUpvoteTotals.get(row.user_id) ?? 0,
          body: row.body,
          createdAt: formatLastSeen(row.created_at, dateSettings),
          likes,
          ...(firstUpvoter && likes > 0
            ? {
                firstUpvoterAvatarUrl: firstUpvoter.avatarUrl,
                firstUpvoterName: firstUpvoter.name,
              }
            : {}),
          ...(upvotedByViewer ? { upvotedByViewer: true } : {}),
          ...(replies.length > 0 ? { replies } : {}),
        };
      });
  }

  return build(null);
}

async function fetchProjectCommentRows(
  projectId: string,
): Promise<ProjectCommentRow[]> {
  if (!isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_comments")
    .select(
      "id, project_id, user_id, parent_id, body, created_at, users ( full_name, email, avatar_url )",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as ProjectCommentRow[];
}

export async function getProductCommentCount(
  productId: string,
): Promise<number> {
  if (isDemoProductId(productId)) {
    const comments = DEMO_COMMENTS_BY_PRODUCT[productId];
    if (!comments) return 0;
    return countCommentTree(comments);
  }

  if (!isSupabaseConfigured()) return 0;

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("project_comments")
    .select("id", { count: "exact", head: true })
    .eq("project_id", productId);

  if (error || count == null) return 0;
  return count;
}

export async function getProductCommentCounts(
  projectIds: string[],
): Promise<Record<string, number>> {
  if (projectIds.length === 0) return {};

  const uniqueIds = [...new Set(projectIds)];
  const entries = await Promise.all(
    uniqueIds.map(
      async (id) => [id, await getProductCommentCount(id)] as const,
    ),
  );

  return Object.fromEntries(entries);
}

export async function enrichProductsWithCommentCounts<
  T extends { id: string; comments?: number },
>(products: T[]): Promise<T[]> {
  if (products.length === 0) return products;

  const counts = await getProductCommentCounts(products.map((product) => product.id));
  return products.map((product) => ({
    ...product,
    comments: counts[product.id] ?? 0,
  }));
}

export async function getProductComments(
  productId: string,
  dateSettings: SiteDateTimeSettings,
  viewerUserId?: string | null,
): Promise<ProductComment[]> {
  if (isDemoProductId(productId)) {
    return DEMO_COMMENTS_BY_PRODUCT[productId] ?? [];
  }

  const rows = await fetchProjectCommentRows(productId);
  const authorIds = [...new Set(rows.map((row) => row.user_id))];
  const [upvoteStats, authorUpvoteTotals] = await Promise.all([
    fetchCommentUpvoteStats(
      rows.map((row) => row.id),
      viewerUserId,
    ),
    getUserCommentUpvoteCounts(authorIds),
  ]);
  return buildCommentTree(
    rows,
    dateSettings,
    upvoteStats,
    authorUpvoteTotals,
    viewerUserId,
  );
}
