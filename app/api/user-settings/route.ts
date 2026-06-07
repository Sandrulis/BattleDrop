import { NextResponse } from "next/server";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { resolveEffectiveCurrency } from "@/app/lib/site-settings/resolve-effective-currency-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import {
  normalizeUserCurrencyPreferenceInput,
  updateUserCurrencyPreference,
  type UserCurrencyPreferenceInput,
} from "@/app/lib/users/user-currency-preferences";
import {
  normalizeUserDateTimePreferencesInput,
  updateUserDateTimePreferences,
  type UserDateTimePreferencesInput,
} from "@/app/lib/users/user-date-time-preferences";

type UserSettingsPatchBody = UserDateTimePreferencesInput &
  UserCurrencyPreferenceInput;

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const siteSettings = await getSiteSettings();
  const dateTimePreferences = {
    dateFormat: user.date_format,
    timeFormat: user.time_format,
    dateSeparator: user.date_separator,
  };
  const currencyPreference = {
    currency: user.currency,
  };

  return NextResponse.json({
    preferences: {
      ...dateTimePreferences,
      ...currencyPreference,
    },
    effective: resolveEffectiveDateTimeSettings(
      {
        dateFormat: siteSettings.dateFormat,
        timeFormat: siteSettings.timeFormat,
        dateSeparator: siteSettings.dateSeparator,
      },
      dateTimePreferences,
    ),
    effectiveCurrency: resolveEffectiveCurrency(
      siteSettings.defaultCurrency,
      currencyPreference,
    ),
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: UserSettingsPatchBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const siteSettings = await getSiteSettings();
    const hasDateTimeFields =
      body.dateFormat !== undefined ||
      body.timeFormat !== undefined ||
      body.dateSeparator !== undefined;

    const dateTimePreferences = hasDateTimeFields
      ? await updateUserDateTimePreferences(user.id, body)
      : {
          dateFormat: user.date_format,
          timeFormat: user.time_format,
          dateSeparator: user.date_separator,
        };

    const currencyPreference =
      body.currency !== undefined
        ? await updateUserCurrencyPreference(user.id, body)
        : { currency: user.currency };

    const normalizedCurrency = normalizeUserCurrencyPreferenceInput(currencyPreference);

    return NextResponse.json({
      preferences: {
        ...normalizeUserDateTimePreferencesInput(dateTimePreferences),
        ...normalizedCurrency,
      },
      effective: resolveEffectiveDateTimeSettings(
        {
          dateFormat: siteSettings.dateFormat,
          timeFormat: siteSettings.timeFormat,
          dateSeparator: siteSettings.dateSeparator,
        },
        dateTimePreferences,
      ),
      effectiveCurrency: resolveEffectiveCurrency(
        siteSettings.defaultCurrency,
        normalizedCurrency,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
