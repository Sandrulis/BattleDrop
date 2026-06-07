import { NextResponse } from "next/server";
import { getBattleWeekSettings } from "@/app/lib/battle-week-settings/get-battle-week-settings";
import {
  updateBattleWeekSettings,
  type UpdateBattleWeekSettingsInput,
} from "@/app/lib/battle-week-settings/update-battle-week-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type RouteContext = {
  params: Promise<{ year: string; week: string }>;
};

function parseRouteParams(yearParam: string, weekParam: string) {
  const year = Number.parseInt(yearParam, 10);
  const week = Number.parseInt(weekParam, 10);

  if (!Number.isInteger(year) || !Number.isInteger(week)) {
    return null;
  }

  return { year, week };
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentAppUser();
  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { year: yearParam, week: weekParam } = await context.params;
  const params = parseRouteParams(yearParam, weekParam);

  if (!params) {
    return NextResponse.json({ error: "Invalid year or week." }, { status: 400 });
  }

  try {
    const settings = await getBattleWeekSettings(params.year, params.week);
    return NextResponse.json(settings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load battle settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentAppUser();
  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { year: yearParam, week: weekParam } = await context.params;
  const params = parseRouteParams(yearParam, weekParam);

  if (!params) {
    return NextResponse.json({ error: "Invalid year or week." }, { status: 400 });
  }

  let body: UpdateBattleWeekSettingsInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const settings = await updateBattleWeekSettings(
      params.year,
      params.week,
      body,
    );
    return NextResponse.json(settings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save battle settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
