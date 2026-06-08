import { NextResponse } from "next/server";
import { voteOnPoll } from "@/app/lib/polls/vote-on-poll";

type VoteBody = {
  optionId?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: pollId } = await params;

  let body: VoteBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const optionId = body.optionId?.trim();
  if (!optionId) {
    return NextResponse.json({ error: "Answer option is required." }, { status: 400 });
  }

  try {
    const poll = await voteOnPoll(pollId, optionId);
    return NextResponse.json(poll);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit vote.";
    const status = message.includes("Sign in")
      ? 401
      : message.includes("already voted")
        ? 400
        : message.includes("not found") || message.includes("Invalid")
          ? 404
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
