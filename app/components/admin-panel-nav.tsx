"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_PANEL_NAV } from "@/app/lib/admin-panel-nav";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminPanelNav() {
  const pathname = usePathname();

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

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <i
                      className={`fa-solid ${item.icon} w-4 text-center text-[13px] ${
                        active ? "text-white/90" : "text-zinc-400"
                      }`}
                      aria-hidden
                    />
                    {item.label}
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
