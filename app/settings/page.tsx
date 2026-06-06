import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsSidePanel } from "@/app/components/settings-side-panel";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { UserSettingsForm } from "@/app/components/user-settings-form";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [user, siteSettings] = await Promise.all([
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  if (!user) redirect("/");

  const preferences = {
    dateFormat: user.date_format,
    timeFormat: user.time_format,
    dateSeparator: user.date_separator,
  };

  const effectiveSettings = resolveEffectiveDateTimeSettings(
    {
      dateFormat: siteSettings.dateFormat,
      timeFormat: siteSettings.timeFormat,
      dateSeparator: siteSettings.dateSeparator,
    },
    preferences,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Settings
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
              Personal display preferences for {user.full_name ?? user.email}.
            </p>

            <div className="mt-8">
              <UserSettingsForm
                initialEffectiveSettings={effectiveSettings}
                initialPreferences={preferences}
              />
            </div>
          </div>

          <SettingsSidePanel user={user} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
