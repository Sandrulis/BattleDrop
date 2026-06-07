"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_BATTLES_NAV } from "@/app/lib/admin-battles-nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminBattlesSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Battle types"
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {ADMIN_BATTLES_NAV.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex min-h-[7.5rem] cursor-pointer flex-col justify-between rounded-2xl border p-5 shadow-sm transition-colors sm:min-h-[8.5rem] sm:p-6 ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50/80"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${
                active
                  ? "bg-white/10 text-white"
                  : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
              }`}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden />
            </span>
            <span>
              <span className="block text-xl font-semibold tracking-tight sm:text-2xl">
                {item.label}
              </span>
              <span
                className={`mt-1 block text-sm leading-snug ${
                  active ? "text-white/75" : "text-zinc-500"
                }`}
              >
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
