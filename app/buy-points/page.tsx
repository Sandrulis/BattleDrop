import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BuyPointsPanel } from "@/app/components/buy-points-panel";
import { BuyPointsSidePanel } from "@/app/components/buy-points-side-panel";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { resolveEffectiveCurrency } from "@/app/lib/site-settings/resolve-effective-currency-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Buy points",
};

type BuyPointsPageProps = {
  searchParams: Promise<{ return?: string }>;
};

function resolveReturnPath(returnParam: string | undefined): string {
  if (!returnParam || !returnParam.startsWith("/") || returnParam.startsWith("//")) {
    return "/my-projects";
  }

  return returnParam;
}

export default async function BuyPointsPage({ searchParams }: BuyPointsPageProps) {
  const [{ return: returnParam }, user, siteSettings] = await Promise.all([
    searchParams,
    getCurrentAppUser(),
    getSiteSettings(),
  ]);

  if (!user) redirect("/");

  const currency = resolveEffectiveCurrency(siteSettings.defaultCurrency, {
    currency: user.currency,
  });

  const returnTo = resolveReturnPath(returnParam);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={returnTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
        >
          <span aria-hidden>←</span> Back
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Buy points
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
              Top up your balance to publish and promote products in the battle.
            </p>

            <div className="mt-8">
              <BuyPointsPanel balance={user.points} currency={currency} />
            </div>
          </div>

          <BuyPointsSidePanel user={user} returnTo={returnTo} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
