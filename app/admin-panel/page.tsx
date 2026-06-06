import Link from "next/link";
import { getAdminOverviewStats } from "@/app/lib/admin/get-overview-stats";
import { ADMIN_PANEL_NAV } from "@/app/lib/admin-panel-nav";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

const PLACEHOLDER_STATS = [
  { label: "This week entries", value: "15" },
  { label: "Open battles", value: "2" },
] as const;

export default async function AdminPanelOverviewPage() {
  const [{ siteName }, stats] = await Promise.all([
    getSiteSettings(),
    getAdminOverviewStats(),
  ]);

  const overviewStats = [
    { label: "Active users", value: String(stats.activeUsers) },
    { label: "Draft projects", value: String(stats.draftProjects) },
    ...PLACEHOLDER_STATS,
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Quick snapshot of {siteName} admin areas.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ADMIN_PANEL_NAV.filter((item) => !item.exact).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/50"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <i className={`fa-solid ${item.icon}`} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-900">{item.label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
