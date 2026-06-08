"use client";

import type { ProductComment } from "../lib/types";
import { AuthorUpvoteBadge } from "./author-upvote-badge";
import { UserAvatar } from "./user-avatar";

type CommentThreadProps = {
  comments: ProductComment[];
  depth?: number;
  currentUserId?: string | null;
  currentUserAvatarUrl?: string | null;
  currentUserName?: string | null;
  isSignedIn?: boolean;
  upvoteEnabled?: boolean;
  upvotingCommentId?: string | null;
  onUpvote?: (commentId: string) => void;
  replyToId?: string | null;
  onReply?: (commentId: string) => void;
  onCancelReply?: () => void;
  replyBody?: string;
  onReplyBodyChange?: (value: string) => void;
  onSubmitReply?: (commentId: string) => void;
  replySubmitting?: boolean;
};

const authorAvatarClass =
  "h-8 w-8 rounded-lg object-cover";
const authorFallbackClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-xs font-medium text-zinc-700";
const upvoterAvatarClass =
  "h-6 w-6 rounded-lg object-cover ring-2 ring-white";
const upvoterFallbackClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[10px] font-bold text-amber-700 ring-2 ring-white";

export function CommentThread({
  comments,
  depth = 0,
  currentUserId = null,
  currentUserAvatarUrl = null,
  currentUserName = null,
  isSignedIn = false,
  upvoteEnabled = false,
  upvotingCommentId = null,
  onUpvote,
  replyToId = null,
  onReply,
  onCancelReply,
  replyBody = "",
  onReplyBodyChange,
  onSubmitReply,
  replySubmitting = false,
}: CommentThreadProps) {
  return (
    <ul className={depth === 0 ? "space-y-0" : "mt-3 space-y-3"}>
      {comments.map((comment, index) => (
        <li
          key={comment.id}
          className={
            depth === 0
              ? "border-b border-zinc-100 py-4 last:border-b-0"
              : "relative"
          }
        >
          {depth > 0 && (
            <span
              className="absolute -left-4 top-0 bottom-0 w-px bg-zinc-200"
              aria-hidden
            />
          )}
          <CommentItem
            comment={comment}
            depth={depth}
            isLast={index === comments.length - 1}
            currentUserId={currentUserId}
            currentUserAvatarUrl={currentUserAvatarUrl}
            currentUserName={currentUserName}
            isSignedIn={isSignedIn}
            upvoteEnabled={upvoteEnabled}
            upvotingCommentId={upvotingCommentId}
            onUpvote={onUpvote}
            replyToId={replyToId}
            onReply={onReply}
            onCancelReply={onCancelReply}
            replyBody={replyBody}
            onReplyBodyChange={onReplyBodyChange}
            onSubmitReply={onSubmitReply}
            replySubmitting={replySubmitting}
          />
        </li>
      ))}
    </ul>
  );
}

function CommentUpvoteBadge({
  comment,
  currentUserId,
  isSignedIn,
  upvoteEnabled,
  onUpvote,
}: {
  comment: ProductComment;
  currentUserId: string | null;
  isSignedIn: boolean;
  upvoteEnabled: boolean;
  onUpvote?: (commentId: string) => void;
}) {
  const isOwnComment =
    currentUserId != null && comment.authorUserId === currentUserId;
  const hasUpvoted = comment.upvotedByViewer === true;
  const canUpvote =
    upvoteEnabled &&
    isSignedIn &&
    !isOwnComment &&
    !hasUpvoted &&
    onUpvote != null;
  const label = isOwnComment
    ? `${comment.likes} upvotes on your comment`
    : hasUpvoted
      ? `You upvoted · ${comment.likes} upvotes`
      : comment.likes > 0
        ? `${comment.likes} upvotes`
        : "Upvote comment";

  return (
    <button
      type="button"
      onClick={canUpvote ? () => onUpvote(comment.id) : undefined}
      disabled={!canUpvote}
      aria-label={label}
      className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
        isOwnComment
          ? "cursor-default text-zinc-400"
          : hasUpvoted
            ? "cursor-default text-[#da552f]"
            : canUpvote
              ? "text-zinc-400 hover:text-[#da552f]"
              : "cursor-default text-zinc-400"
      } disabled:opacity-60`}
    >
      <i
        className={`fas fa-star text-[11px] ${
          hasUpvoted || (isOwnComment && comment.likes > 0)
            ? "text-[#da552f]"
            : ""
        }`}
        aria-hidden
      />
      {comment.likes > 0 ? <span>{comment.likes}</span> : null}
    </button>
  );
}

function CommentItem({
  comment,
  depth,
  isLast,
  currentUserId,
  currentUserAvatarUrl,
  currentUserName,
  isSignedIn,
  upvoteEnabled,
  upvotingCommentId,
  onUpvote,
  replyToId,
  onReply,
  onCancelReply,
  replyBody,
  onReplyBodyChange,
  onSubmitReply,
  replySubmitting,
}: {
  comment: ProductComment;
  depth: number;
  isLast: boolean;
  currentUserId: string | null;
  currentUserAvatarUrl: string | null;
  currentUserName: string | null;
  isSignedIn: boolean;
  upvoteEnabled: boolean;
  upvotingCommentId: string | null;
  onUpvote?: (commentId: string) => void;
  replyToId: string | null;
  onReply?: (commentId: string) => void;
  onCancelReply?: () => void;
  replyBody: string;
  onReplyBodyChange?: (value: string) => void;
  onSubmitReply?: (commentId: string) => void;
  replySubmitting: boolean;
}) {
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isReplying = replyToId === comment.id;
  const showFirstUpvoter =
    comment.likes > 0 &&
    comment.firstUpvoterName != null &&
    comment.firstUpvoterName.length > 0;

  return (
    <div>
      <div className="flex items-start gap-3">
        <UserAvatar
          src={comment.authorAvatarUrl}
          name={comment.authorDisplayName ?? comment.author}
          imgClassName={authorAvatarClass}
          fallbackClassName={authorFallbackClass}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900">
              {comment.author}
            </span>
            {comment.authorTotalUpvotes != null ? (
              <AuthorUpvoteBadge count={comment.authorTotalUpvotes} />
            ) : null}
            <span className="text-xs text-zinc-400">{comment.createdAt}</span>
            {showFirstUpvoter ? (
              <UserAvatar
                src={comment.firstUpvoterAvatarUrl}
                name={comment.firstUpvoterName!}
                imgClassName={upvoterAvatarClass}
                fallbackClassName={upvoterFallbackClass}
              />
            ) : null}
            <CommentUpvoteBadge
              comment={comment}
              currentUserId={currentUserId}
              isSignedIn={isSignedIn}
              upvoteEnabled={upvoteEnabled}
              onUpvote={onUpvote}
            />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-700">
            {comment.body}
          </p>
          {onReply ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="text-xs font-medium text-zinc-500 hover:text-[#da552f]"
              >
                Reply
              </button>
            </div>
          ) : null}

          {isReplying && onReplyBodyChange && onSubmitReply && onCancelReply ? (
            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <textarea
                value={replyBody}
                onChange={(event) => onReplyBodyChange(event.target.value)}
                rows={2}
                placeholder="Write a reply…"
                disabled={replySubmitting}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelReply}
                  disabled={replySubmitting}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={replySubmitting || !replyBody.trim()}
                  className="rounded-lg bg-[#da552f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c44a28] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {replySubmitting ? "Posting…" : "Post reply"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {hasReplies && (
        <div
          className={`relative ml-11 border-l-2 border-zinc-200 pl-4 ${
            isLast ? "pb-0" : ""
          }`}
        >
          <CommentThread
            comments={comment.replies!}
            depth={depth + 1}
            currentUserId={currentUserId}
            currentUserAvatarUrl={currentUserAvatarUrl}
            currentUserName={currentUserName}
            isSignedIn={isSignedIn}
            upvoteEnabled={upvoteEnabled}
            upvotingCommentId={upvotingCommentId}
            onUpvote={onUpvote}
            replyToId={replyToId}
            onReply={onReply}
            onCancelReply={onCancelReply}
            replyBody={replyBody}
            onReplyBodyChange={onReplyBodyChange}
            onSubmitReply={onSubmitReply}
            replySubmitting={replySubmitting}
          />
        </div>
      )}
    </div>
  );
}
