"use client";

import { useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import {
  DATE_FORMAT_OPTIONS,
  DATE_SEPARATOR_OPTIONS,
  DEFAULT_ADMIN_SITE_SETTINGS,
  formatAdminPreviewDateTime,
  TIME_FORMAT_OPTIONS,
  type AdminSiteSettings,
} from "@/app/lib/admin-settings-options";

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type AdminSettingsFormProps = {
  initialSettings: AdminSiteSettings;
};

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [settings, setSettings] = useState<AdminSiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const datePreview = formatAdminPreviewDateTime(new Date(), settings);

  const updateSetting = <K extends keyof AdminSiteSettings>(
    key: K,
    value: AdminSiteSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as AdminSiteSettings & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save settings.");
      }

      setSettings(data);
      showToast("Settings saved.", "success");
    } catch (saveError) {
      showToast(
        saveError instanceof Error ? saveError.message : "Could not save settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Site settings</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Site name, slogan, and display defaults used across BattleDrop.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="block text-sm font-medium text-zinc-900">Site name</span>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
              placeholder={DEFAULT_ADMIN_SITE_SETTINGS.siteName}
              className={`mt-1.5 ${inputClassName}`}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-zinc-900">Slogan</span>
            <input
              type="text"
              value={settings.siteSlogan}
              onChange={(e) => updateSetting("siteSlogan", e.target.value)}
              placeholder={DEFAULT_ADMIN_SITE_SETTINGS.siteSlogan}
              className={`mt-1.5 ${inputClassName}`}
            />
          </label>
        </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">Date & time defaults</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Used for admin timestamps and other site-wide date displays.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-medium text-zinc-900">
                Default date format
              </span>
              <select
                value={settings.dateFormat}
                onChange={(e) =>
                  updateSetting("dateFormat", e.target.value as AdminSiteSettings["dateFormat"])
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
                    e.target.value as AdminSiteSettings["dateSeparator"],
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
              <span className="block text-sm font-medium text-zinc-900">
                Default time format
              </span>
              <select
                value={settings.timeFormat}
                onChange={(e) =>
                  updateSetting("timeFormat", e.target.value as AdminSiteSettings["timeFormat"])
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
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Preview
          </p>
          <p className="mt-2 text-base font-semibold text-zinc-900">
            {settings.siteName.trim() || DEFAULT_ADMIN_SITE_SETTINGS.siteName}
          </p>
          <p className="mt-0.5 text-sm text-zinc-600">
            {settings.siteSlogan.trim() || DEFAULT_ADMIN_SITE_SETTINGS.siteSlogan}
          </p>
          <p className="mt-3 font-mono text-sm text-zinc-800">{datePreview}</p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
