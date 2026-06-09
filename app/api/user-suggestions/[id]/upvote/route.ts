import { NextResponse } from "next/server";
import { unupvoteUserSuggestion } from "@/app/lib/user-suggestions/unupvote-user-suggestion";
import { upvoteUserSuggestion } from "@/app/lib/user-suggestions/upvote-user-suggestion";

function resolveSuggestionVoteErrorStatus(message: string) {
  if (message === "Sign in required.") return 401;
  if (message === "Suggestion not found.") return 404;
  if (
    message === "You cannot upvote your own suggestion." ||
    message === "You already upvoted this suggestion." ||
    message === "You have not upvoted this suggestion."
  ) {
    return 400;
  }

  return 500;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: suggestionId } = await params;
    const result = await upvoteUserSuggestion(suggestionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upvote suggestion.";
    return NextResponse.json(
      { error: message },
      { status: resolveSuggestionVoteErrorStatus(message) },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: suggestionId } = await params;
    const result = await unupvoteUserSuggestion(suggestionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove upvote.";
    return NextResponse.json(
      { error: message },
      { status: resolveSuggestionVoteErrorStatus(message) },
    );
  }
}
