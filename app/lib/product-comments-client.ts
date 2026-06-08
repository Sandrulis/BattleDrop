import type { ProductComment } from "./types";

export function updateCommentInTree(
  comments: ProductComment[],
  commentId: string,
  updater: (comment: ProductComment) => ProductComment,
): ProductComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      };
    }

    return comment;
  });
}

export function updateCommentsByAuthorInTree(
  comments: ProductComment[],
  authorUserId: string,
  updater: (comment: ProductComment) => ProductComment,
): ProductComment[] {
  return comments.map((comment) => {
    const nextComment =
      comment.authorUserId === authorUserId ? updater(comment) : comment;

    if (nextComment.replies?.length) {
      return {
        ...nextComment,
        replies: updateCommentsByAuthorInTree(
          nextComment.replies,
          authorUserId,
          updater,
        ),
      };
    }

    return nextComment;
  });
}

export function appendCommentToTree(
  comments: ProductComment[],
  newComment: ProductComment,
  parentId: string | null,
): ProductComment[] {
  if (!parentId) {
    return [...comments, newComment];
  }

  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), newComment],
      };
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: appendCommentToTree(comment.replies, newComment, parentId),
      };
    }

    return comment;
  });
}
