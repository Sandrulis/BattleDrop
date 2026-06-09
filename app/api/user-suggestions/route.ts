import { NextResponse } from "next/server";
import { createUserSuggestion } from "@/app/lib/user-suggestions/create-user-suggestion";

type CreateUserSuggestionBody = {
  title?: string;
  description?: string;
};

export async function POST(request: Request) {
  let body: CreateUserSuggestionBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = body.title?.trim();
  const description = body.description?.trim() ?? "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  try {
    const suggestion = await createUserSuggestion(title, description);
    return NextResponse.json(suggestion);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit suggestion.";
    const status = message === "Sign in required." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
