import { NextResponse } from "next/server";
import { redeemShopUpvotes } from "@/app/lib/shop/redeem-shop-upvotes";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { points?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const points =
    typeof body.points === "number"
      ? body.points
      : typeof body.points === "string"
        ? Number(body.points)
        : Number.NaN;

  try {
    const result = await redeemShopUpvotes(user.id, points);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not redeem upvotes.";
    const status = message.includes("disabled") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
