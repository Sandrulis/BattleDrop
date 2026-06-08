import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShopPanel } from "@/app/components/shop-panel";
import { ShopSidePanel } from "@/app/components/shop-side-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { getShopDashboard } from "@/app/lib/shop/get-shop-dashboard";
import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Shop",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [user, shopIntegrationEnabled] = await Promise.all([
    getCurrentAppUser(),
    isShopEnabled(),
  ]);

  if (!user) redirect("/");

  const dashboard = await getShopDashboard(user.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Shop
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
              Exchange comment upvotes and affiliate referrals for battle points.
            </p>

            <div className="mt-8">
              <ShopPanel
                initialDashboard={dashboard}
                shopIntegrationEnabled={shopIntegrationEnabled}
              />
            </div>
          </div>

          <ShopSidePanel user={user} dashboard={dashboard} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
