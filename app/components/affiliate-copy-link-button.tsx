"use client";

import { useState } from "react";
import { Toast, useToast } from "@/app/components/toast";

type AffiliateCopyLinkButtonProps = {
  affiliateLink: string;
};

export function AffiliateCopyLinkButton({
  affiliateLink,
}: AffiliateCopyLinkButtonProps) {
  const [copying, setCopying] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const copyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(affiliateLink);
      showToast("Affiliate link copied.", "success");
    } catch {
      showToast("Could not copy link.", "error");
    } finally {
      setCopying(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copyLink}
        disabled={copying}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-60"
      >
        <i className="fas fa-link text-[11px] text-zinc-500" aria-hidden />
        {copying ? "Copying…" : "Copy link"}
      </button>
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
