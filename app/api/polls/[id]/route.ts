import { NextResponse } from "next/server";
import { updateSitePoll } from "@/app/lib/polls/update-poll";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UpdatePollBody = {
  enabled?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: UpdatePollBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const poll = await updateSitePoll(id, { enabled: body.enabled });
    return NextResponse.json(poll);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update poll.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
