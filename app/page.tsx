import { BattleHero } from "./components/battle-hero";
import { MonthBattleBanner } from "./components/month-battle-banner";
import { ProductFeed } from "./components/product-feed";
import { Sidebar } from "./components/sidebar";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { getHomeBattleWeek } from "./lib/battle-week-settings/get-home-battle-week";
import { prepareProductFeedOrder } from "./lib/build-leaderboard";
import { getBattleWeekProducts } from "./lib/projects/get-battle-week-products";
import { getPromotedSlotsForWeek } from "./lib/promoted-slots/get-promoted-slots-for-week";

export default async function Home() {
  const homeBattleWeek = await getHomeBattleWeek();
  const { battle, battleStartHoursFromWeekStart, submitPrice, timing } =
    homeBattleWeek;

  const [products, bookedPromotedSlots] = await Promise.all([
    getBattleWeekProducts(battle.year, battle.week),
    getPromotedSlotsForWeek(battle.year, battle.week),
  ]);

  const displayProducts = prepareProductFeedOrder(
    products,
    homeBattleWeek.shuffleBeforeVoting,
  );

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
        <MonthBattleBanner />
        <BattleHero
          battle={battle}
          battleStartHoursFromWeekStart={battleStartHoursFromWeekStart}
          submitPrice={submitPrice}
          timing={timing}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <ProductFeed
            initialProducts={displayProducts}
            bookedPromotedSlots={bookedPromotedSlots}
            shuffleBeforeVoting={homeBattleWeek.shuffleBeforeVoting}
            timing={timing}
          />
          <Sidebar homeBattleWeek={homeBattleWeek} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
