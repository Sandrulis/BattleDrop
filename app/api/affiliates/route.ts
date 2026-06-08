import { NextResponse } from "next/server";
import { getAffiliateDashboard } from "@/app/lib/affiliates/get-affiliate-dashboard";
import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function GET() {
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

  try {
    const dashboard = await getAffiliateDashboard(user.id);
    return NextResponse.json(dashboard);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load affiliates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
