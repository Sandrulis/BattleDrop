import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { SuggestionsPanel } from "@/app/components/suggestions-panel";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveDateTimeSettings } from "@/app/lib/site-settings/resolve-effective-date-time-settings";
import { getUserSuggestionsFeed } from "@/app/lib/user-suggestions/get-user-suggestions-feed";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Suggestions",
};

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  const [user, siteSettings] = await Promise.all([
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  if (!user) redirect("/");

  const [suggestions] = await Promise.all([getUserSuggestionsFeed()]);

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
          Suggestions
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
          Share feature ideas, browse what others suggest, and upvote the ideas you
          want most.
        </p>

        <div className="mt-8">
          <SuggestionsPanel
            initialSuggestions={suggestions}
            currentUserId={user.id}
            dateSettings={dateSettings}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
