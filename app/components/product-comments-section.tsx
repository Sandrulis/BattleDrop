"use client";

import { useEffect, useState } from "react";
import type { ProductComment } from "@/app/lib/types";
import {
  appendCommentToTree,
  updateCommentInTree,
  updateCommentsByAuthorInTree,
} from "@/app/lib/product-comments-client";
import { CommentThread } from "./comment-thread";
import { Toast, useToast } from "./toast";

type ProductCommentsSectionProps = {
  projectId: string;
  initialComments: ProductComment[];
  initialCount: number;
  isSignedIn: boolean;
  currentUserId: string | null;
  currentUserAvatarUrl?: string | null;
  currentUserName?: string | null;
  commentsEnabled: boolean;
  onCommentCountChange?: (count: number) => void;
};

export function ProductCommentsSection({
  projectId,
  initialComments,
  initialCount,
  isSignedIn,
  currentUserId,
  currentUserAvatarUrl = null,
  currentUserName = null,
  commentsEnabled,
  onCommentCountChange,
}: ProductCommentsSectionProps) {
  const { toast, showToast, dismissToast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [body, setBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [upvotingCommentId, setUpvotingCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setComments(initialComments);
    setCommentCount(initialCount);
  }, [initialComments, initialCount]);

  useEffect(() => {
    onCommentCountChange?.(commentCount);
  }, [commentCount, onCommentCountChange]);

  async function submitComment(
    text: string,
    parentId: string | null,
    mode: "root" | "reply",
  ) {
    const trimmed = text.trim();
    if (!trimmed) {
      showToast("Comment cannot be empty.", "error");
      return;
    }

    if (mode === "root") setSubmitting(true);
    else setReplySubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          parentId,
        }),
      });

      const payload = (await response.json()) as {
        comment?: ProductComment;
        error?: string;
      };

      if (!response.ok || !payload.comment) {
        showToast(payload.error ?? "Could not post comment.", "error");
        return;
      }

      setComments((current) =>
        appendCommentToTree(current, payload.comment!, parentId),
      );
      setCommentCount((current) => current + 1);

      if (mode === "root") {
        setBody("");
      } else {
        setReplyBody("");
        setReplyToId(null);
      }

      showToast("Comment posted.", "success");
    } catch {
      showToast("Could not post comment.", "error");
    } finally {
      if (mode === "root") setSubmitting(false);
      else setReplySubmitting(false);
    }
  }

  async function upvoteComment(commentId: string) {
    const previousComments = comments;
    const targetComment = findCommentInTree(comments, commentId);
    const authorUserId = targetComment?.authorUserId;

    setComments((current) => {
      const withLikes = updateCommentInTree(current, commentId, (comment) => {
        const nextLikes = comment.likes + 1;
        const isFirstUpvote = comment.likes === 0;

        return {
          ...comment,
          likes: nextLikes,
          upvotedByViewer: true,
          ...(isFirstUpvote && currentUserName
            ? {
                firstUpvoterAvatarUrl: currentUserAvatarUrl,
                firstUpvoterName: currentUserName,
              }
            : {}),
        };
      });

      if (!authorUserId) return withLikes;

      return updateCommentsByAuthorInTree(
        withLikes,
        authorUserId,
        (comment) => ({
          ...comment,
          authorTotalUpvotes: (comment.authorTotalUpvotes ?? 0) + 1,
        }),
      );
    });
    setUpvotingCommentId(commentId);

    try {
      const response = await fetch(`/api/project-comments/${commentId}/upvote`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        likes?: number;
        upvotedByViewer?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setComments(previousComments);
        showToast(payload.error ?? "Could not upvote comment.", "error");
        return;
      }

      if (payload.likes != null) {
        setComments((current) =>
          updateCommentInTree(current, commentId, (comment) => ({
            ...comment,
            likes: payload.likes!,
            upvotedByViewer: payload.upvotedByViewer ?? true,
          })),
        );
      }
    } catch {
      setComments(previousComments);
      showToast("Could not upvote comment.", "error");
    } finally {
      setUpvotingCommentId(null);
    }
  }

  const formDisabled = !commentsEnabled || !isSignedIn || submitting;

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">
          Comments
          <span className="ml-2 text-base font-normal text-zinc-400">
            {commentCount}
          </span>
        </h2>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            !commentsEnabled
              ? "Publish this project to enable comments."
              : isSignedIn
                ? "Add a comment…"
                : "Add a comment… Sign in with Google to post"
          }
          rows={3}
          disabled={formDisabled}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-70"
        />
        {commentsEnabled && isSignedIn ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => submitComment(body, null, "root")}
              disabled={formDisabled || !body.trim()}
              className="rounded-lg bg-[#da552f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c44a28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-400">
            {!commentsEnabled
              ? "Only published projects accept comments."
              : "Sign in from the header to join the discussion."}
          </p>
        )}
      </div>

      {comments.length > 0 ? (
        <div className="mt-6">
          <CommentThread
            comments={comments}
            currentUserId={currentUserId}
            currentUserAvatarUrl={currentUserAvatarUrl}
            currentUserName={currentUserName}
            isSignedIn={isSignedIn}
            upvoteEnabled={commentsEnabled}
            upvotingCommentId={upvotingCommentId}
            onUpvote={isSignedIn ? upvoteComment : undefined}
            replyToId={replyToId}
            onReply={
              commentsEnabled && isSignedIn
                ? (commentId) => {
                    setReplyToId(commentId);
                    setReplyBody("");
                  }
                : undefined
            }
            onCancelReply={() => {
              setReplyToId(null);
              setReplyBody("");
            }}
            replyBody={replyBody}
            onReplyBodyChange={setReplyBody}
            onSubmitReply={(commentId) =>
              submitComment(replyBody, commentId, "reply")
            }
            replySubmitting={replySubmitting}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">
          No comments yet. Be the first to share feedback on this launch.
        </p>
      )}
    </section>
  );
}

function findCommentInTree(
  comments: ProductComment[],
  commentId: string,
): ProductComment | null {
  for (const comment of comments) {
    if (comment.id === commentId) return comment;
    if (comment.replies?.length) {
      const found = findCommentInTree(comment.replies, commentId);
      if (found) return found;
    }
  }
  return null;
}
