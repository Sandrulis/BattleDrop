import { BattleHero } from "./components/battle-hero";
import { MonthBattleBanner } from "./components/month-battle-banner";
import { ProductFeed } from "./components/product-feed";
import { Sidebar } from "./components/sidebar";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { currentBattle, products } from "./lib/mock-data";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
        <MonthBattleBanner />
        <BattleHero battle={currentBattle} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <ProductFeed initialProducts={products} />
          <Sidebar />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
