import { createClient } from "@/app/lib/supabase/server";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import {
  resolveEffectiveCurrency,
  type UserCurrencyPreference,
} from "@/app/lib/site-settings/resolve-effective-currency-settings";
import {
  DEFAULT_SITE_SETTINGS,
  isCurrencyCode,
  type CurrencyCode,
} from "@/app/lib/site-settings-types";

type UserCurrencyPreferenceRow = {
  currency: CurrencyCode | null;
};

export type UserCurrencyPreferenceInput = {
  currency?: CurrencyCode | null;
};

function mapUserCurrencyPreferenceRow(
  row: UserCurrencyPreferenceRow,
): UserCurrencyPreference {
  return {
    currency: row.currency,
  };
}

export function normalizeUserCurrencyPreferenceInput(
  input: UserCurrencyPreferenceInput,
): UserCurrencyPreference {
  if (input.currency === null) {
    return { currency: null };
  }

  return {
    currency: isCurrencyCode(input.currency) ? input.currency : null,
  };
}

export async function getUserCurrencyPreference(
  userId: string,
): Promise<UserCurrencyPreference> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("currency")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { currency: null };
  }

  return mapUserCurrencyPreferenceRow(data as UserCurrencyPreferenceRow);
}

export async function getEffectiveCurrencyForUser(
  userId: string | null,
): Promise<CurrencyCode> {
  const siteSettings = await getSiteSettings();

  if (!userId) {
    return siteSettings.defaultCurrency;
  }

  const preference = await getUserCurrencyPreference(userId);
  return resolveEffectiveCurrency(siteSettings.defaultCurrency, preference);
}

export async function updateUserCurrencyPreference(
  userId: string,
  input: UserCurrencyPreferenceInput,
): Promise<UserCurrencyPreference> {
  const preference = normalizeUserCurrencyPreferenceInput(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({
      currency: preference.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("currency")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserCurrencyPreferenceRow(data as UserCurrencyPreferenceRow);
}

export function resolveEffectiveCurrencyFromSite(
  siteDefaultCurrency: CurrencyCode = DEFAULT_SITE_SETTINGS.defaultCurrency,
  userCurrency: CurrencyCode | null | undefined,
): CurrencyCode {
  return resolveEffectiveCurrency(siteDefaultCurrency, {
    currency: userCurrency ?? null,
  });
}
