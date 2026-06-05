import type { ProductComment } from "../lib/types";

type CommentThreadProps = {
  comments: ProductComment[];
  depth?: number;
};

export function CommentThread({ comments, depth = 0 }: CommentThreadProps) {
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
          <CommentItem comment={comment} depth={depth} isLast={index === comments.length - 1} />
        </li>
      ))}
    </ul>
  );
}

function CommentItem({
  comment,
  depth,
  isLast,
}: {
  comment: ProductComment;
  depth: number;
  isLast: boolean;
}) {
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
          {comment.author.charAt(1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900">
              {comment.author}
            </span>
            <span className="text-xs text-zinc-400">{comment.createdAt}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-700">
            {comment.body}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              ▲ {comment.likes}
            </button>
            <button
              type="button"
              className="text-xs font-medium text-zinc-500 hover:text-[#da552f]"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div
          className={`relative ml-11 border-l-2 border-zinc-200 pl-4 ${
            isLast ? "pb-0" : ""
          }`}
        >
          <CommentThread comments={comment.replies!} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}
