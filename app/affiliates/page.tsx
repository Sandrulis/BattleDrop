import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AffiliatesPanel } from "@/app/components/affiliates-panel";
import { AffiliatesSidePanel } from "@/app/components/affiliates-side-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { getAffiliateDashboard } from "@/app/lib/affiliates/get-affiliate-dashboard";
import { isAffiliatesEnabled } from "@/app/lib/affiliates/is-affiliates-enabled";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Affiliates",
};

export const dynamic = "force-dynamic";

export default async function AffiliatesPage() {
  const [user, affiliatesEnabled, siteSettings] = await Promise.all([
    getCurrentAppUser(),
    isAffiliatesEnabled(),
    getSiteSettings(),
  ]);

  if (!user) redirect("/");
  if (!affiliatesEnabled) redirect("/");

  const [dashboard] = await Promise.all([getAffiliateDashboard(user.id)]);

  const dateSettings = resolveEffectiveDateTimeSettings(
    {
      dateFormat: siteSettings.dateFormat,
      timeFormat: siteSettings.timeFormat,
      dateSeparator: siteSettings.dateSeparator,
    },
    {
      dateFormat: user.date_format,
      timeFormat: user.time_format,
      dateSeparator: user.date_separator,
    },
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Affiliates
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
              Invite founders with your personal link and track who joined.
            </p>

            <div className="mt-8">
              <AffiliatesPanel
                initialDashboard={dashboard}
                dateSettings={dateSettings}
              />
            </div>
          </div>

          <AffiliatesSidePanel user={user} dashboard={dashboard} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
