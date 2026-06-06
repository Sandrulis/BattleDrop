"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import {
  DATE_FORMAT_OPTIONS,
  DATE_SEPARATOR_OPTIONS,
  formatSiteDateTime,
  TIME_FORMAT_OPTIONS,
  type SiteDateTimeSettings,
} from "@/app/lib/site-settings-types";
import type { UserDateTimePreferences } from "@/app/lib/site-settings/resolve-effective-date-time-settings";

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type UserSettingsFormProps = {
  initialEffectiveSettings: SiteDateTimeSettings;
  initialPreferences: UserDateTimePreferences;
};

type UserSettingsResponse = {
  preferences: UserDateTimePreferences;
  effective: SiteDateTimeSettings;
  error?: string;
};

export function UserSettingsForm({
  initialEffectiveSettings,
  initialPreferences,
}: UserSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteDateTimeSettings>(initialEffectiveSettings);
  const [preferences, setPreferences] =
    useState<UserDateTimePreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const datePreview = formatSiteDateTime(new Date(), settings);
  const usesSiteDefaults =
    preferences.dateFormat === null &&
    preferences.timeFormat === null &&
    preferences.dateSeparator === null;

  const updateSetting = <K extends keyof SiteDateTimeSettings>(
    key: K,
    value: SiteDateTimeSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyResponse = (data: UserSettingsResponse) => {
    setPreferences(data.preferences);
    setSettings(data.effective);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/user-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = (await response.json()) as UserSettingsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save settings.");
      }

      applyResponse(data);
      showToast("Settings saved.", "success");
      router.refresh();
    } catch (saveError) {
      showToast(
        saveError instanceof Error ? saveError.message : "Could not save settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetToSiteDefaults = async () => {
    setResetting(true);

    try {
      const response = await fetch("/api/user-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateFormat: null,
          timeFormat: null,
          dateSeparator: null,
        }),
      });

      const data = (await response.json()) as UserSettingsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not reset settings.");
      }

      applyResponse(data);
      showToast("Using site defaults again.", "success");
      router.refresh();
    } catch (resetError) {
      showToast(
        resetError instanceof Error ? resetError.message : "Could not reset settings.",
        "error",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Date & time</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose how dates and times appear for you. Unset fields follow the site
          defaults.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="block text-sm font-medium text-zinc-900">Date format</span>
            <select
              value={settings.dateFormat}
              onChange={(e) =>
                updateSetting(
                  "dateFormat",
                  e.target.value as SiteDateTimeSettings["dateFormat"],
                )
              }
              className={`mt-1.5 ${inputClassName}`}
            >
              {DATE_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-zinc-900">
              Date separator
            </span>
            <select
              value={settings.dateSeparator}
              onChange={(e) =>
                updateSetting(
                  "dateSeparator",
                  e.target.value as SiteDateTimeSettings["dateSeparator"],
                )
              }
              className={`mt-1.5 ${inputClassName}`}
            >
              {DATE_SEPARATOR_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-zinc-900">Time format</span>
            <select
              value={settings.timeFormat}
              onChange={(e) =>
                updateSetting(
                  "timeFormat",
                  e.target.value as SiteDateTimeSettings["timeFormat"],
                )
              }
              className={`mt-1.5 ${inputClassName}`}
            >
              {TIME_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Preview
          </p>
          <p className="mt-2 font-mono text-sm text-zinc-800">{datePreview}</p>
          {usesSiteDefaults ? (
            <p className="mt-2 text-xs text-zinc-500">Using site defaults.</p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">Using your personal preferences.</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || resetting}
            className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>

          <button
            type="button"
            onClick={handleResetToSiteDefaults}
            disabled={saving || resetting || usesSiteDefaults}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetting ? "Resetting…" : "Use site defaults"}
          </button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
