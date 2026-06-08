import { NextResponse } from "next/server";
import { createSitePoll } from "@/app/lib/polls/create-poll";
import { getSitePolls } from "@/app/lib/polls/get-polls";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type CreatePollBody = {
  question?: string;
  options?: string[];
};

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const polls = await getSitePolls();
  return NextResponse.json({ polls });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: CreatePollBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const poll = await createSitePoll({
      question: body.question ?? "",
      options: body.options ?? [],
    });
    return NextResponse.json(poll);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create poll.";
    const status =
      message.includes("required") ||
      message.includes("must") ||
      message.includes("At least") ||
      message.includes("At most") ||
      message.includes("unique")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
