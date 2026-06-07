import Link from "next/link";

import { PointsBalanceLink } from "@/app/components/points-balance-link";
import { UserAvatar } from "@/app/components/user-avatar";

import type { HomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";

import { formatBattleStartHoursLabel } from "@/app/lib/battle-week-status";

import { formatDisplayDate } from "@/app/lib/site-settings/format-display-date";

import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";

import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";

import type { EditProjectData, ProjectStatus } from "@/app/lib/types";



function statusLabel(status: ProjectStatus) {

  if (status === "draft") return "Draft";

  if (status === "published") return "Published";

  return "Archived";

}



type SubmitSidePanelProps = {

  project?: EditProjectData;

  homeBattleWeek: HomeBattleWeek;

};



export async function SubmitSidePanel({

  project,

  homeBattleWeek,

}: SubmitSidePanelProps) {

  const user = await getCurrentAppUser();

  const dateSettings = await getEffectiveDateTimeSettingsForUser(user?.id ?? null);

  const { battle, battleStartHoursFromWeekStart, submitPrice } = homeBattleWeek;

  const entryFeeLabel = formatDisplayPoints(submitPrice);

  const battleStartHoursLabel = formatBattleStartHoursLabel(

    battleStartHoursFromWeekStart,

  );



  return (

    <aside className="flex flex-col gap-4">

      {user ? (

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

          <h3 className="text-sm font-semibold text-zinc-900">Your account</h3>

          <div className="mt-3 flex items-center gap-3">

            <UserAvatar

              src={user.avatar_url}

              name={user.full_name ?? user.email ?? "Founder"}

              imgClassName="h-10 w-10 rounded-lg object-cover"

              fallbackClassName="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200 text-sm font-medium text-zinc-700"

            />

            <div className="min-w-0">

              <p className="truncate text-sm font-medium text-zinc-900">

                {user.full_name ?? "Founder"}

              </p>

              <p className="truncate text-xs text-zinc-500">{user.email}</p>

            </div>

          </div>

          <div className="mt-4">
            <PointsBalanceLink points={user.points} returnTo="/submit" />
          </div>

        </div>

      ) : (

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

          <h3 className="text-sm font-semibold text-zinc-900">Sign in</h3>

          <p className="mt-2 text-xs leading-relaxed text-zinc-600">

            Log in to track submissions and manage your projects from one place.

          </p>

          <Link

            href="/"

            className="mt-3 inline-block text-xs font-medium text-[#da552f] hover:underline"

          >

            Sign in from the header →

          </Link>

        </div>

      )}



      {project ? (

        <>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-zinc-900">This project</h3>

            <div className="mt-3 flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">

                {project.favicon ? (

                  // eslint-disable-next-line @next/next/no-img-element

                  <img

                    src={project.favicon}

                    alt=""

                    className="h-7 w-7 object-contain"

                  />

                ) : (

                  <span className="text-sm font-semibold text-zinc-400">

                    {project.name.charAt(0).toUpperCase()}

                  </span>

                )}

              </div>

              <div className="min-w-0">

                <p className="text-sm font-medium text-zinc-900">{project.name}</p>

                <span className="mt-1 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">

                  {statusLabel(project.status)}

                </span>

              </div>

            </div>

            <dl className="mt-4 space-y-2 text-xs">

              <div>

                <dt className="text-zinc-500">Project URL</dt>

                <dd className="mt-0.5 break-all">

                  <a

                    href={project.url}

                    target="_blank"

                    rel="noreferrer"

                    className="font-medium text-[#da552f] hover:underline"

                  >

                    {project.url}

                  </a>

                </dd>

              </div>

              <div className="flex justify-between gap-4">

                <dt className="text-zinc-500">Saved</dt>

                <dd className="font-medium text-zinc-900">

                  {formatDisplayDate(project.createdAt, dateSettings)}

                </dd>

              </div>

              <div className="flex justify-between gap-4">

                <dt className="text-zinc-500">Last updated</dt>

                <dd className="font-medium text-zinc-900">

                  {formatDisplayDate(project.updatedAt, dateSettings)}

                </dd>

              </div>

            </dl>

          </div>



          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-zinc-900">What&apos;s next</h3>

            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-600">

              <li>1. Update your product details</li>

              <li>2. Save changes to your draft</li>

              <li>3. Publish from My Projects when ready</li>

            </ol>

            <Link

              href="/my-projects"

              className="mt-4 inline-block text-xs font-medium text-[#da552f] hover:underline"

            >

              Back to My Projects →

            </Link>

          </div>

        </>

      ) : (

        <>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-zinc-900">Submission steps</h3>

            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-600">

              <li>1. Paste your project URL</li>

              <li>2. Review details and save as draft</li>

              <li>3. Publish from My Projects when ready</li>

            </ol>

          </div>



          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-zinc-900">

              Week {battle.week}, {battle.year}

            </h3>

            <dl className="mt-3 space-y-2 text-xs">

              <div className="flex justify-between gap-4">

                <dt className="text-zinc-500">Entry fee</dt>

                <dd className="font-medium text-zinc-900">{entryFeeLabel}</dd>

              </div>

              {battle.minProjectsEnabled ? (

                <div className="flex justify-between gap-4">

                  <dt className="text-zinc-500">Battle starts at</dt>

                  <dd className="font-medium text-zinc-900">

                    {battle.projectsRequired} projects

                  </dd>

                </div>

              ) : null}

              <div className="flex justify-between gap-4">

                <dt className="text-zinc-500">Voting opens</dt>

                <dd className="font-medium text-zinc-900">

                  {battleStartHoursLabel} after week start

                </dd>

              </div>

            </dl>

          </div>

        </>

      )}

    </aside>

  );

}

