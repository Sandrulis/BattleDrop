import { NextResponse } from "next/server";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import {
  normalizeUserDateTimePreferencesInput,
  updateUserDateTimePreferences,
  type UserDateTimePreferencesInput,
} from "@/app/lib/users/user-date-time-preferences";

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const siteSettings = await getSiteSettings();
  const preferences = {
    dateFormat: user.date_format,
    timeFormat: user.time_format,
    dateSeparator: user.date_separator,
  };

  return NextResponse.json({
    preferences,
    effective: resolveEffectiveDateTimeSettings(
      {
        dateFormat: siteSettings.dateFormat,
        timeFormat: siteSettings.timeFormat,
        dateSeparator: siteSettings.dateSeparator,
      },
      preferences,
    ),
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: UserDateTimePreferencesInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const siteSettings = await getSiteSettings();
    const preferences = await updateUserDateTimePreferences(user.id, body);

    return NextResponse.json({
      preferences: normalizeUserDateTimePreferencesInput(preferences),
      effective: resolveEffectiveDateTimeSettings(
        {
          dateFormat: siteSettings.dateFormat,
          timeFormat: siteSettings.timeFormat,
          dateSeparator: siteSettings.dateSeparator,
        },
        preferences,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
