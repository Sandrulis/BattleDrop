"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { useAdminAlertCounts } from "@/app/components/admin-alert-counts-provider";
import { AdminCountBadge } from "@/app/components/admin-count-badge";
import { ADMIN_PANEL_NAV } from "@/app/lib/admin-panel-nav";
import { ADMIN_PANEL_ALERT_BADGE_KEYS } from "@/app/lib/admin-alerts/admin-alert-types";



function isActive(pathname: string, href: string, exact?: boolean) {

  if (exact) return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);

}



export function AdminPanelNav() {
  const pathname = usePathname();
  const { counts: alertCounts } = useAdminAlertCounts();



  return (

    <aside className="lg:sticky lg:top-[4.5rem] lg:self-start">

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-[#da552f]">

          Admin Panel

        </p>



        <nav aria-label="Admin panel sections" className="mt-4">

          <ul className="space-y-1">

            {ADMIN_PANEL_NAV.map((item) => {

              const active = isActive(pathname, item.href, item.exact);

              const badgeKey = ADMIN_PANEL_ALERT_BADGE_KEYS[item.href];

              const badgeCount = badgeKey ? alertCounts[badgeKey] : 0;



              return (

                <li key={item.href}>

                  <Link

                    href={item.href}

                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${

                      active

                        ? "bg-zinc-900 text-white"

                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"

                    }`}

                  >

                    <span className="flex min-w-0 items-center gap-2.5">

                      <i

                        className={`fa-solid ${item.icon} w-4 text-center text-[13px] ${

                          active ? "text-white/90" : "text-zinc-400"

                        }`}

                        aria-hidden

                      />

                      {item.label}

                    </span>

                    <AdminCountBadge count={badgeCount} />

                  </Link>

                </li>

              );

            })}

          </ul>

        </nav>

      </div>

    </aside>

  );

}

