"use client";

import { useEffect, useState } from "react";
import {
  ACCEPT_ALL_COOKIE_PREFERENCES,
  COOKIE_CATEGORIES,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieCategoryKey,
  type CookiePreferences,
} from "@/app/lib/cookie-consent/cookie-consent-types";

type CookieConsentPopupProps = {
  initialPreferences: CookiePreferences;
  showPrivacyLink: boolean;
  requireChoice: boolean;
  onSave: (preferences: CookiePreferences) => void;
  onClose: () => void;
};

function CookieToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da552f]/30 ${
        disabled
          ? "cursor-not-allowed bg-zinc-200"
          : checked
            ? "cursor-pointer bg-[#da552f]"
            : "cursor-pointer bg-zinc-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function CookieConsentPopup({
  initialPreferences,
  showPrivacyLink,
  requireChoice,
  onSave,
  onClose,
}: CookieConsentPopupProps) {
  const [preferences, setPreferences] =
    useState<CookiePreferences>(initialPreferences);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const updatePreference = (key: CookieCategoryKey, enabled: boolean) => {
    setPreferences((current) => ({ ...current, [key]: enabled }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {requireChoice ? (
        <div className="absolute inset-0 bg-zinc-900/45" aria-hidden />
      ) : (
        <button
          type="button"
          aria-label="Close cookie preferences"
          className="absolute inset-0 bg-zinc-900/45"
          onClick={onClose}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        className="relative flex max-h-[min(90vh,760px)] w-full max-w-[37.8rem] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#da552f]/10 text-[#da552f]"
              aria-hidden
            >
              <i className="fas fa-cookie-bite text-xl" />
            </div>
            <div className="min-w-0">
              <h2
                id="cookie-consent-title"
                className="text-xl font-semibold tracking-tight text-zinc-900"
              >
                Cookie settings
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Choose which cookies BattleDrop may use. Necessary cookies are
                always active. You can change these settings at any time.
              </p>
            </div>
          </div>
          {!requireChoice ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <i className="fas fa-xmark" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
          {COOKIE_CATEGORIES.map((category) => {
            const isRequired = category.required === true;
            const checked = isRequired
              ? true
              : preferences[category.key as CookieCategoryKey];

            return (
              <div
                key={category.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    {category.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                    {category.description}
                  </p>
                </div>
                <CookieToggle
                  checked={checked}
                  disabled={isRequired}
                  onChange={
                    isRequired
                      ? undefined
                      : (enabled) =>
                          updatePreference(category.key as CookieCategoryKey, enabled)
                  }
                  label={category.label}
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-zinc-100 bg-zinc-50 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onSave({ ...DEFAULT_COOKIE_PREFERENCES })}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => onSave({ ...ACCEPT_ALL_COOKIE_PREFERENCES })}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={() => onSave(preferences)}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#da552f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c44a28]"
            >
              Save preferences
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <a
              href="/cookie"
              className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900"
            >
              Cookie policy
            </a>
            {showPrivacyLink ? (
              <>
                <span className="text-zinc-300" aria-hidden>
                  |
                </span>
                <a
                  href="/privacy"
                  className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900"
                >
                  Privacy policy
                </a>
              </>
            ) : null}
            {requireChoice ? (
              <span className="text-xs text-zinc-500 sm:ml-auto">
                Choose an option to continue.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
