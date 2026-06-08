"use client";

import { useEffect, useState } from "react";
import { SettingsSwitch } from "@/app/components/settings-switch";
import { Toast, useToast } from "@/app/components/toast";
import {
  DEFAULT_MIN_PROJECTS,
  type BattleWeekSettingsPayload,
} from "@/app/lib/battle-week-settings/types";
import { formatDisplayPoints, formatPointsAmount } from "@/app/lib/site-settings/format-display-money";

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type BattleWeekSettingsForm = {
  isEnabled: boolean;
  minProjectsEnabled: boolean;
  minProjects: string;
  submitPrice: string;
  defaultSubmitPrice: number;
};

type AdminBattleWeekSettingsModalProps = {
  open: boolean;
  week: number;
  year: number;
  dateRange: string;
  defaultSubmitPrice: number;
  onClose: () => void;
  onSaved?: () => void;
};

function buildInitialForm(defaultSubmitPrice: number): BattleWeekSettingsForm {
  return {
    isEnabled: true,
    minProjectsEnabled: false,
    minProjects: String(DEFAULT_MIN_PROJECTS),
    submitPrice: formatPointsAmount(defaultSubmitPrice),
    defaultSubmitPrice,
  };
}

export function AdminBattleWeekSettingsModal({
  open,
  week,
  year,
  dateRange,
  defaultSubmitPrice,
  onClose,
  onSaved,
}: AdminBattleWeekSettingsModalProps) {
  const [form, setForm] = useState<BattleWeekSettingsForm>(() =>
    buildInitialForm(defaultSubmitPrice),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadSettings() {
      setLoading(true);

      try {
        const response = await fetch(`/api/battle-week-settings/${year}/${week}`);
        const data = (await response.json()) as BattleWeekSettingsPayload & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load battle settings.");
        }

        if (cancelled) return;

        setForm({
          isEnabled: data.isEnabled ?? true,
          minProjectsEnabled: data.minProjectsEnabled ?? false,
          minProjects: String(data.minProjects ?? DEFAULT_MIN_PROJECTS),
          submitPrice: formatPointsAmount(
            data.effectiveSubmitPrice ?? data.defaultSubmitPrice ?? defaultSubmitPrice,
          ),
          defaultSubmitPrice:
            data.defaultSubmitPrice ?? defaultSubmitPrice,
        });
      } catch (error) {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : "Could not load battle settings.",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [open, week, year, defaultSubmitPrice, showToast]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/battle-week-settings/${year}/${week}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: form.isEnabled,
          minProjectsEnabled: form.isEnabled ? form.minProjectsEnabled : false,
          minProjects:
            form.isEnabled && form.minProjectsEnabled
              ? Number(form.minProjects)
              : null,
          submitPrice: form.isEnabled ? Number(form.submitPrice) : null,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        effectiveSubmitPrice?: number;
        defaultSubmitPrice?: number;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save battle settings.");
      }

      setForm((current) => ({
        ...current,
        submitPrice: formatPointsAmount(
          data.effectiveSubmitPrice ??
            data.defaultSubmitPrice ??
            current.defaultSubmitPrice,
        ),
        defaultSubmitPrice:
          data.defaultSubmitPrice ?? current.defaultSubmitPrice,
      }));
      showToast("Battle settings saved.", "success");
      onSaved?.();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save battle settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const usesSiteDefaultPrice =
    form.isEnabled &&
    Number(form.submitPrice) === form.defaultSubmitPrice;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute inset-0 bg-black/30"
          onClick={handleClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="battle-week-settings-title"
          className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        >
          <h2
            id="battle-week-settings-title"
            className="text-lg font-semibold text-zinc-900"
          >
            Week {week}, {year} settings
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{dateRange}</p>

          {loading ? (
            <p className="mt-6 text-sm text-zinc-500">Loading settings…</p>
          ) : (
            <div className="mt-5 space-y-5">
              <SettingsSwitch
                label="Enabled"
                description="Turn this weekly battle on or off."
                checked={form.isEnabled}
                onChange={(isEnabled) =>
                  setForm((current) => ({ ...current, isEnabled }))
                }
                disabled={saving}
              />

              {form.isEnabled ? (
                <>
                  <SettingsSwitch
                    label="Minimum projects required"
                    description="Require a minimum number of entries before the battle starts."
                    checked={form.minProjectsEnabled}
                    onChange={(minProjectsEnabled) =>
                      setForm((current) => ({ ...current, minProjectsEnabled }))
                    }
                    disabled={saving}
                  />

                  {form.minProjectsEnabled ? (
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Minimum projects
                      </span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={form.minProjects}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            minProjects: event.target.value,
                          }))
                        }
                        disabled={saving}
                        className={`mt-1.5 ${inputClassName}`}
                      />
                    </label>
                  ) : null}

                  <label className="block">
                    <span className="text-sm font-medium text-zinc-900">
                      Points per submit
                    </span>
                    <div className="relative mt-1.5">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={form.submitPrice}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            submitPrice: event.target.value,
                          }))
                        }
                        disabled={saving}
                        className={`${inputClassName} pr-16`}
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                        points
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-500">
                      Site default: {formatDisplayPoints(form.defaultSubmitPrice)}
                      {usesSiteDefaultPrice ? " · using default" : " · custom for this week"}
                    </p>
                  </label>
                </>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
