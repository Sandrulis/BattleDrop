"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/#month", label: "This Month" },
  { href: "/#battle", label: "This week" },
  { href: "/archive", label: "Archive" },
] as const;

type MobileNavProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function MobileNav({ open, onToggle, onClose }: MobileNavProps) {
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 top-14 z-40 bg-black/20"
            onClick={onClose}
          />
          <nav
            id="mobile-nav-panel"
            className="absolute left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/submit"
              onClick={onClose}
              className="mt-3 block w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Submit product
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
