import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { SupportPanel } from "@/app/components/support-panel";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getSupportTicketsForUser } from "@/app/lib/support-tickets/get-support-tickets-for-user";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Support",
};

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const [user, siteSettings] = await Promise.all([
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  if (!user) redirect("/");

  const [tickets] = await Promise.all([getSupportTicketsForUser()]);

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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Support
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
          Need help? Open a support ticket and track its status here.
        </p>

        <div className="mt-8">
          <SupportPanel initialTickets={tickets} dateSettings={dateSettings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
