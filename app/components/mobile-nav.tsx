"use client";

import Link from "next/link";
import { headerIconButtonClassName } from "@/app/components/header-control-styles";

const mobileNavLinkClassName =
  "inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50";

type MobileNavProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function MobileNav({ open, onToggle, onClose }: MobileNavProps) {
  return (
    <div className="relative flex shrink-0 items-center md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className={`${headerIconButtonClassName} cursor-pointer text-zinc-700 transition-colors hover:bg-zinc-50`}
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
            className="fixed left-0 right-0 top-14 z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg"
          >
            <ul className="space-y-2">
              <li>
                <Link
                  href="/archive"
                  onClick={onClose}
                  className={mobileNavLinkClassName}
                >
                  <i className="fas fa-calendar text-[11px] text-zinc-500" aria-hidden />
                  Archive
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  onClick={onClose}
                  className={mobileNavLinkClassName}
                >
                  <i className="fas fa-plus text-[11px] text-zinc-500" aria-hidden />
                  Submit product
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg className="block size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="block size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
