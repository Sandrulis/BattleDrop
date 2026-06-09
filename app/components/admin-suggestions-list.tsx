"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAlertCounts } from "@/app/components/admin-alert-counts-provider";
import { Toast, useToast } from "@/app/components/toast";
import { UserAvatar } from "@/app/components/user-avatar";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import {
  formatUserSuggestionStatus,
  USER_SUGGESTION_STATUSES,
  type UserSuggestion,
  type UserSuggestionStatus,
} from "@/app/lib/user-suggestions/suggestion-types";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const selectClassName =
  "rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type AdminSuggestionsListProps = {
  initialSuggestions: UserSuggestion[];
  dateSettings: SiteDateTimeSettings;
};

export function AdminSuggestionsList({
  initialSuggestions,
  dateSettings,
}: AdminSuggestionsListProps) {
  const router = useRouter();
  const { adjustSuggestionsCount } = useAdminAlertCounts();
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const newCount = suggestions.filter((item) => item.status === "new").length;

  async function handleStatusChange(
    suggestionId: string,
    status: UserSuggestionStatus,
  ) {
    if (updatingId) return;

    const previous = suggestions;
    const previousSuggestion = suggestions.find((item) => item.id === suggestionId);
    setSuggestions((current) =>
      current.map((item) =>
        item.id === suggestionId ? { ...item, status } : item,
      ),
    );
    setUpdatingId(suggestionId);

    try {
      const response = await fetch(`/api/user-suggestions/${suggestionId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as UserSuggestion & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update suggestion.");
      }

      setSuggestions((current) =>
        current.map((item) =>
          item.id === suggestionId
            ? { ...item, ...data, upvotes: item.upvotes }
            : item,
        ),
      );
      if (previousSuggestion?.status === "new" && status !== "new") {
        adjustSuggestionsCount(-1);
      } else if (previousSuggestion?.status !== "new" && status === "new") {
        adjustSuggestionsCount(1);
      }
      showToast("Suggestion status updated.", "success");
      router.refresh();
    } catch (error) {
      setSuggestions(previous);
      showToast(
        error instanceof Error ? error.message : "Could not update suggestion.",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
        <p className="text-sm font-medium text-zinc-900">No suggestions yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          User feature ideas will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-600">
        {newCount} new {newCount === 1 ? "suggestion" : "suggestions"} ·{" "}
        {suggestions.length} total · sorted by upvotes
      </p>

      <ul className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {suggestions.map((suggestion, index) => {
          const displayName =
            suggestion.user?.full_name?.trim() ||
            suggestion.user?.email ||
            "Unknown user";

          return (
            <li
              key={suggestion.id}
              className={`px-4 py-4 sm:px-5 sm:py-5 ${
                index > 0 ? "border-t border-zinc-100" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="size-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                    <UserAvatar
                      src={suggestion.user?.avatar_url}
                      name={displayName}
                      imgClassName="h-full w-full object-cover"
                      fallbackClassName="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {suggestion.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {displayName} ·{" "}
                      {formatDisplayDateTime(suggestion.createdAt, dateSettings)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-[#da552f]">
                    <i className="fas fa-star text-[11px]" aria-hidden />
                    {suggestion.upvotes}
                  </span>
                  {updatingId === suggestion.id ? (
                    <span
                      role="status"
                      aria-label="Loading"
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 motion-reduce:animate-none"
                    />
                  ) : null}
                  <select
                    value={suggestion.status}
                    disabled={updatingId === suggestion.id}
                    onChange={(event) =>
                      handleStatusChange(
                        suggestion.id,
                        event.target.value as UserSuggestionStatus,
                      )
                    }
                    className={selectClassName}
                    aria-label={`Status for ${suggestion.title}`}
                  >
                    {USER_SUGGESTION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatUserSuggestionStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {suggestion.description}
              </p>
            </li>
          );
        })}
      </ul>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
