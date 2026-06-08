"use client";

import { useState } from "react";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { Toast, useToast } from "@/app/components/toast";
import {
  DEFAULT_SHOP_SETTINGS,
  SHOP_INTEGRATION_KEY,
  type ShopSettings,
} from "@/app/lib/shop/shop-types";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";

type AdminShopPanelProps = {
  initialSettings: ShopSettings;
  shopIntegrationEnabled: boolean;
};

const inputClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

export function AdminShopPanel({
  initialSettings,
  shopIntegrationEnabled,
}: AdminShopPanelProps) {
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/shop-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as ShopSettings & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save shop settings.");
      }

      setSettings(data);
      showToast("Shop settings saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save shop settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanelSection
      title="Shop"
      description="Configure how comment upvotes and affiliate referrals can be exchanged for points on the Shop page."
    >
      {!shopIntegrationEnabled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          The shop is unavailable while the{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs text-red-900">
            {SHOP_INTEGRATION_KEY}
          </code>{" "}
          integration is disabled. Enable it under{" "}
          <a
            href="/admin-panel/integrations"
            className="font-medium text-red-900 underline decoration-red-300 underline-offset-2 hover:decoration-red-500"
          >
            Integrations
          </a>
          .
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Exchange rates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Set how much users must spend to receive one point.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm font-medium text-zinc-900">
              Comment upvotes per point
            </span>
            <input
              type="number"
              min={1}
              max={1000}
              value={settings.upvotesPerPoint}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  upvotesPerPoint: Number(event.target.value),
                }))
              }
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Example: {settings.upvotesPerPoint} upvote
              {settings.upvotesPerPoint === 1 ? "" : "s"} →{" "}
              {formatDisplayPoints(1)}
            </p>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-zinc-900">
              Affiliate referrals per point
            </span>
            <input
              type="number"
              min={1}
              max={1000}
              value={settings.affiliatesPerPoint}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  affiliatesPerPoint: Number(event.target.value),
                }))
              }
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Example: {settings.affiliatesPerPoint} referral
              {settings.affiliatesPerPoint === 1 ? "" : "s"} →{" "}
              {formatDisplayPoints(1)}
            </p>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c04a29] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span
                role="status"
                aria-label="Loading"
                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
              />
            ) : null}
            Save rates
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Defaults: {DEFAULT_SHOP_SETTINGS.upvotesPerPoint} upvotes and{" "}
        {DEFAULT_SHOP_SETTINGS.affiliatesPerPoint} affiliate referral per point.
      </p>

      <Toast toast={toast} onDismiss={dismissToast} />
    </AdminPanelSection>
  );
}
