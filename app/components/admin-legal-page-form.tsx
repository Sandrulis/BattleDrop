"use client";

import { useState } from "react";
import { BbcodeEditor } from "@/app/components/bbcode-editor";
import { Toast, useToast } from "@/app/components/toast";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";
import {
  SITE_LEGAL_PAGE_CONTENT_KEYS,
  SITE_LEGAL_PAGE_LABELS,
  SITE_LEGAL_PAGE_PATHS,
  type SiteLegalPageKey,
  type SiteLegalPages,
} from "@/app/lib/site-legal-pages/site-legal-pages-types";

type AdminLegalPageFormProps = {
  page: SiteLegalPageKey;
  initialContent: string | null;
};

export function AdminLegalPageForm({
  page,
  initialContent,
}: AdminLegalPageFormProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [saving, setSaving] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const label = SITE_LEGAL_PAGE_LABELS[page];
  const publicPath = SITE_LEGAL_PAGE_PATHS[page];
  const hasContent = content.trim().length > 0;

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/site-legal-pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, content }),
      });

      const data = (await response.json()) as SiteLegalPages & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? `Could not save ${label.toLowerCase()} page.`);
      }

      const savedContent = data[SITE_LEGAL_PAGE_CONTENT_KEYS[page]];
      setContent(savedContent ?? "");
      showToast(`${label} page saved.`, "success");
    } catch (saveError) {
      showToast(
        saveError instanceof Error
          ? saveError.message
          : `Could not save ${label.toLowerCase()} page.`,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{label} content</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {page === "cookie" ? (
                <>
                  Write cookie rules with BBCode. When saved with content, the page
                  appears at{" "}
                  <a
                    href={publicPath}
                    className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                    target={hasContent ? "_blank" : undefined}
                    rel={hasContent ? "noreferrer" : undefined}
                    aria-disabled={!hasContent}
                    tabIndex={hasContent ? 0 : -1}
                  >
                    {publicPath}
                  </a>
                  , footer links for Cookie and Cookie popup are shown, and new
                  visitors see the cookie popup once automatically.
                </>
              ) : (
                <>
                  Write {label.toLowerCase()} text with BBCode. When saved with
                  content, the page appears at{" "}
                  <a
                    href={publicPath}
                    className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                    target={hasContent ? "_blank" : undefined}
                    rel={hasContent ? "noreferrer" : undefined}
                    aria-disabled={!hasContent}
                    tabIndex={hasContent ? 0 : -1}
                  >
                    {publicPath}
                  </a>{" "}
                  and a footer link is shown to visitors.
                </>
              )}
            </p>
          </div>
          {hasContent ? (
            <a
              href={publicPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden />
              Preview
            </a>
          ) : null}
        </div>

        <div className="mt-5">
          <BbcodeEditor
            value={content}
            onChange={setContent}
            maxLength={INPUT_LIMITS.siteLegalContent}
            placeholder={`Write your ${label.toLowerCase()} policy…`}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs" aria-hidden />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
