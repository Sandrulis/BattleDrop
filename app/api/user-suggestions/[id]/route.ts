import { NextResponse } from "next/server";
import {
  USER_SUGGESTION_STATUSES,
  type UserSuggestionStatus,
} from "@/app/lib/user-suggestions/suggestion-types";
import { updateUserSuggestionStatus } from "@/app/lib/user-suggestions/update-user-suggestion-status";

type UpdateUserSuggestionBody = {
  status?: UserSuggestionStatus;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: UpdateUserSuggestionBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const status = body.status;

  if (!status || !USER_SUGGESTION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const suggestion = await updateUserSuggestionStatus(id, status);
    return NextResponse.json(suggestion);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update suggestion.";
    const statusCode = message === "Admin access required." ? 403 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
