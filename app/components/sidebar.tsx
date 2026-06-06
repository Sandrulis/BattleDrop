import {
  hallOfFameEntries,
  hallOfFameMonth,
} from "../lib/mock-data";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

export async function Sidebar() {
  const { siteName } = await getSiteSettings();

  return (
    <aside className="flex flex-col gap-4">
      <div id="how" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">How {siteName} works</h3>
        <ol className="mt-3 space-y-3 text-xs leading-relaxed text-zinc-600">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              1
            </span>
            <span>
              Founders submit one product per week (€5 or 5 points). Battle
              starts at 20 projects.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              2
            </span>
            <span>
              Voting opens 24h after start. Anyone with a Google account can
              vote.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              3
            </span>
            <span>
              Weekly winner → monthly championship → December Grand Prix.
            </span>
          </li>
        </ol>
      </div>

      <div
        id="hall"
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Hall of Fame</h3>
          <span className="text-xs font-medium text-zinc-500">{hallOfFameMonth}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Top 5 each week — locked forever for that product.
        </p>
        <ul className="mt-3 space-y-2">
          {hallOfFameEntries.map(
            (name) => (
              <li
                key={name}
                className="flex items-center gap-2 text-xs font-medium text-zinc-700"
              >
                <span className="text-amber-500">★</span>
                {name}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Points & affiliates</h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Earn 1 point per referred project. Spend on entry, promoted spots, or
          save forever — no expiry.
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
        >
          Affiliate
        </button>
      </div>
    </aside>
  );
}
