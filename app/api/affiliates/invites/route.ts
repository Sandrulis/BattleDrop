import { NextResponse } from "next/server";
import { createAffiliateInvite } from "@/app/lib/affiliates/create-affiliate-invite";
import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type CreateInviteBody = {
  email?: string;
};

export async function POST(request: Request) {
  if (!(await isAffiliatesEnabled())) {
    return NextResponse.json(
      { error: "Affiliates are not available." },
      { status: 404 },
    );
  }

  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: CreateInviteBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const invite = await createAffiliateInvite(
      user.id,
      user.email,
      body.email ?? "",
    );
    return NextResponse.json({ invite });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create invite.";
    const status =
      message.includes("required") ||
      message.includes("valid") ||
      message.includes("cannot") ||
      message.includes("already")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
