import { BattleHero } from "./components/battle-hero";
import { MonthBattleBanner } from "./components/month-battle-banner";
import { YearBattleBanner } from "./components/year-battle-banner";
import { ProductFeed } from "./components/product-feed";
import { Sidebar } from "./components/sidebar";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { buildAffiliateLink } from "./lib/affiliates/build-affiliate-link";
import { ensureAffiliateCode } from "./lib/affiliates/ensure-affiliate-code";
import { isAffiliatesEnabled } from "./lib/affiliates/is-affiliates-enabled";
import { getHomeBattleWeek } from "./lib/battle-week-settings/get-home-battle-week";
import { getShopSettings } from "./lib/shop/get-shop-settings";
import { prepareProductFeedOrder } from "./lib/build-leaderboard";
import { getHomePoll } from "./lib/polls/get-home-poll";
import { enrichProductsWithCommentCounts } from "./lib/product-comments";
import { getBattleWeekProducts } from "./lib/projects/get-battle-week-products";
import { getPromotedSlotsForWeek } from "./lib/promoted-slots/get-promoted-slots-for-week";
import { formatBattleWeekRange } from "./lib/battle-week";
import { getCurrentAppUser } from "./lib/users/get-current-user";
import { getEffectiveCurrencyForUser } from "./lib/users/user-currency-preferences";
import { getEffectiveDateTimeSettingsForUser } from "./lib/users/user-date-time-preferences";
import { formatDisplayMoney } from "./lib/site-settings/format-display-money";
import { getPreviousWeekHallOfFame } from "./lib/hall-of-fame/get-previous-week-hall-of-fame";

export default async function Home() {
  const homeBattleWeek = await getHomeBattleWeek();
  const { battle, battleStartHoursFromWeekStart, submitPrice, winnerMoneyPrice, timing } =
    homeBattleWeek;

  const [
    battleWeekProducts,
    bookedPromotedSlots,
    poll,
    currentUser,
    affiliatesEnabled,
    shopSettings,
    previousWeekHallOfFame,
  ] = await Promise.all([
    getBattleWeekProducts(battle.year, battle.week),
    getPromotedSlotsForWeek(battle.year, battle.week),
    getHomePoll(),
    getCurrentAppUser(),
    isAffiliatesEnabled(),
    getShopSettings(),
    getPreviousWeekHallOfFame(battle.year, battle.week),
  ]);
  const products = await enrichProductsWithCommentCounts(battleWeekProducts);

  const displayProducts = prepareProductFeedOrder(
    products,
    homeBattleWeek.shuffleBeforeVoting,
  );
  const dateSettings = await getEffectiveDateTimeSettingsForUser(
    currentUser?.id ?? null,
  );
  const weekRangeLabel = formatBattleWeekRange(
    battle.week,
    battle.year,
    dateSettings,
  );
  const currency = await getEffectiveCurrencyForUser(currentUser?.id ?? null);
  const winnerMoneyPriceLabel =
    winnerMoneyPrice > 0
      ? formatDisplayMoney(winnerMoneyPrice, currency)
      : null;
  const affiliateLink =
    affiliatesEnabled && currentUser
      ? buildAffiliateLink(await ensureAffiliateCode(currentUser.id))
      : undefined;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
        <YearBattleBanner />
        <MonthBattleBanner />
        <BattleHero
          battle={battle}
          battleStartHoursFromWeekStart={battleStartHoursFromWeekStart}
          submitPrice={submitPrice}
          winnerMoneyPriceLabel={winnerMoneyPriceLabel}
          timing={timing}
          weekRangeLabel={weekRangeLabel}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <ProductFeed
            initialProducts={displayProducts}
            bookedPromotedSlots={bookedPromotedSlots}
            shuffleBeforeVoting={homeBattleWeek.shuffleBeforeVoting}
            timing={timing}
            currentUserId={currentUser?.id ?? null}
          />
          <Sidebar
            homeBattleWeek={homeBattleWeek}
            poll={poll}
            previousWeekHallOfFame={previousWeekHallOfFame}
            isSignedIn={currentUser !== null}
            affiliatesEnabled={affiliatesEnabled}
            affiliatesPerPoint={
              affiliatesEnabled ? shopSettings.affiliatesPerPoint : undefined
            }
            affiliateLink={affiliateLink}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
