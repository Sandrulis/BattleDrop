import Link from "next/link";
import { redirect } from "next/navigation";
import type { PublishBattleWeekInfo } from "@/app/components/publish-project-modal";
import { MyProjectsList } from "@/app/components/my-projects-list";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { formatBattleWeekRange } from "@/app/lib/battle-week";
import {
  getHomeBattleWeek,
  getPublishTargetWeek,
} from "@/app/lib/battle-week-settings/get-home-battle-week";
import {
  formatBattleStartHoursLabel,
  getBattleWeekTiming,
  resolveBattleWeekDisplayStatus,
  type BattleWeekDisplayStatus,
} from "@/app/lib/battle-week-status";
import { resolveProjectBattleWeek, projectMatchesBattleWeek } from "@/app/lib/projects/project-battle-week";
import { getUserProjects } from "@/app/lib/projects/get-user-projects";
import { userHasPublishedProjectInWeek } from "@/app/lib/projects/publish-project";
import { getPromotedSlotsForWeek } from "@/app/lib/promoted-slots/get-promoted-slots-for-week";
import { isPromotesEnabled } from "@/app/lib/promoted-slots/is-promotes-enabled";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getProductCommentCounts } from "@/app/lib/product-comments";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";

export const dynamic = "force-dynamic";

export default async function MyProjectsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/");

  const homeBattleWeek = await getHomeBattleWeek();
  const { battle, battleStartHoursFromWeekStart } = homeBattleWeek;
  const now = new Date();
  const publishTarget = await getPublishTargetWeek(homeBattleWeek);

  const [
    projects,
    promotedSlots,
    dateSettings,
    userHasPublishedForTargetWeek,
    siteSettings,
    promotesEnabled,
  ] = await Promise.all([
    getUserProjects(),
    getPromotedSlotsForWeek(battle.year, battle.week),
    getEffectiveDateTimeSettingsForUser(user.id),
    userHasPublishedProjectInWeek(
      user.id,
      publishTarget.year,
      publishTarget.week,
    ),
    getSiteSettings(),
    isPromotesEnabled(),
  ]);

  const publishBattleWeek: PublishBattleWeekInfo = {
    week: publishTarget.week,
    year: publishTarget.year,
    weekRangeLabel: formatBattleWeekRange(
      publishTarget.week,
      publishTarget.year,
      dateSettings,
    ),
    submitPrice: publishTarget.submitPrice,
    entryFeeLabel: formatDisplayPoints(publishTarget.submitPrice),
    minProjectsEnabled: publishTarget.minProjectsEnabled,
    projectsRequired: publishTarget.projectsRequired,
    battleStartHoursLabel: formatBattleStartHoursLabel(
      battleStartHoursFromWeekStart,
    ),
    appliesToNextWeek: publishTarget.appliesToNextWeek,
  };

  const inCurrentBattleWeekByProjectId = Object.fromEntries(
    projects.map((project) => [
      project.id,
      projectMatchesBattleWeek(project, battle.year, battle.week),
    ]),
  );

  const publishedBattleWeekByProjectId: Record<
    string,
    { week: number; year: number; weekRangeLabel: string }
  > = {};
  const publishedBattleWeekStatusByProjectId: Record<
    string,
    BattleWeekDisplayStatus
  > = {};

  const commentCountByProjectId = await getProductCommentCounts(
    projects.map((project) => project.id),
  );

  for (const project of projects) {
    if (project.status !== "published") continue;

    const battleWeek = resolveProjectBattleWeek(project);
    if (!battleWeek) continue;

    publishedBattleWeekByProjectId[project.id] = {
      week: battleWeek.week,
      year: battleWeek.year,
      weekRangeLabel: formatBattleWeekRange(
        battleWeek.week,
        battleWeek.year,
        dateSettings,
      ),
    };

    const timing = getBattleWeekTiming(
      battleWeek.year,
      battleWeek.week,
      battleStartHoursFromWeekStart,
    );
    publishedBattleWeekStatusByProjectId[project.id] =
      resolveBattleWeekDisplayStatus(now, timing);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              My Projects
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Your saved drafts and submitted products.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex cursor-pointer rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Submit product
          </Link>
        </div>

        <div className="mt-8">
          <MyProjectsList
            projects={projects}
            inCurrentBattleWeekByProjectId={inCurrentBattleWeekByProjectId}
            publishedBattleWeekByProjectId={publishedBattleWeekByProjectId}
            publishedBattleWeekStatusByProjectId={
              publishedBattleWeekStatusByProjectId
            }
            promotedSlots={promotedSlots}
            promotesEnabled={promotesEnabled}
            promoteDurationHours={siteSettings.promoteDurationHours}
            publishBattleWeek={publishBattleWeek}
            userHasPublishedForTargetWeek={userHasPublishedForTargetWeek}
            userPointsBalance={user.points}
            commentCountByProjectId={commentCountByProjectId}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
