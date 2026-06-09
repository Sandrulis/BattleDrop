"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import { UserAvatar } from "@/app/components/user-avatar";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";
import {
  compareSuggestionsByPopularity,
  formatUserSuggestionStatus,
  type UserSuggestion,
  type UserSuggestionStatus,
} from "@/app/lib/user-suggestions/suggestion-types";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

function statusBadgeClass(status: UserSuggestionStatus): string {
  switch (status) {
    case "new":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "reviewed":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "accepted":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "declined":
      return "bg-zinc-100 text-zinc-600 ring-zinc-200";
  }
}

function sortSuggestions(items: UserSuggestion[]) {
  return [...items].sort(compareSuggestionsByPopularity);
}

function resolveAuthorName(suggestion: UserSuggestion) {
  return (
    suggestion.user?.full_name?.trim() ||
    formatMakerHandle(suggestion.user ?? { full_name: null, email: null }) ||
    "Unknown user"
  );
}

type SuggestionUpvoteButtonProps = {
  suggestion: UserSuggestion;
  currentUserId: string;
  onToggleUpvote: (suggestionId: string) => void;
};

function SuggestionUpvoteButton({
  suggestion,
  currentUserId,
  onToggleUpvote,
}: SuggestionUpvoteButtonProps) {
  const isOwnSuggestion = suggestion.userId === currentUserId;
  const hasUpvoted = suggestion.upvotedByViewer === true;
  const canToggle = !isOwnSuggestion;
  const label = isOwnSuggestion
    ? `${suggestion.upvotes} upvotes on your suggestion`
    : hasUpvoted
      ? `Remove upvote · ${suggestion.upvotes} upvotes`
      : suggestion.upvotes > 0
        ? `${suggestion.upvotes} upvotes`
        : "Upvote suggestion";

  return (
    <button
      type="button"
      onClick={canToggle ? () => onToggleUpvote(suggestion.id) : undefined}
      disabled={!canToggle}
      aria-label={label}
      aria-pressed={hasUpvoted}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold tabular-nums ${
        isOwnSuggestion
          ? "cursor-default bg-zinc-50 text-zinc-500"
          : hasUpvoted
            ? "cursor-pointer bg-orange-50 text-[#da552f] hover:bg-orange-100"
            : "cursor-pointer bg-zinc-50 text-zinc-600 hover:bg-orange-50 hover:text-[#da552f]"
      } disabled:opacity-60`}
    >
      <i
        className={`fas fa-star text-[11px] ${
          hasUpvoted || (isOwnSuggestion && suggestion.upvotes > 0)
            ? "text-[#da552f]"
            : ""
        }`}
        aria-hidden
      />
      <span>{suggestion.upvotes}</span>
    </button>
  );
}

type SuggestionsPanelProps = {
  initialSuggestions: UserSuggestion[];
  currentUserId: string;
  dateSettings: SiteDateTimeSettings;
};

export function SuggestionsPanel({
  initialSuggestions,
  currentUserId,
  dateSettings,
}: SuggestionsPanelProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pendingUpvotesRef = useRef(new Set<string>());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/user-suggestions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = (await response.json()) as UserSuggestion & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit suggestion.");
      }

      setSuggestions((current) => sortSuggestions([data, ...current]));
      setTitle("");
      setDescription("");
      showToast("Suggestion submitted.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not submit suggestion.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggleUpvote(suggestionId: string) {
    if (pendingUpvotesRef.current.has(suggestionId)) return;

    const target = suggestions.find((item) => item.id === suggestionId);
    if (!target || target.userId === currentUserId) {
      return;
    }

    const removingUpvote = target.upvotedByViewer === true;
    pendingUpvotesRef.current.add(suggestionId);

    setSuggestions((current) =>
      sortSuggestions(
        current.map((item) =>
          item.id === suggestionId
            ? removingUpvote
              ? {
                  ...item,
                  upvotes: Math.max(0, item.upvotes - 1),
                  upvotedByViewer: undefined,
                }
              : {
                  ...item,
                  upvotes: item.upvotes + 1,
                  upvotedByViewer: true,
                }
            : item,
        ),
      ),
    );

    void fetch(`/api/user-suggestions/${suggestionId}/upvote`, {
      method: removingUpvote ? "DELETE" : "POST",
      credentials: "same-origin",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          upvotes?: number;
          upvotedByViewer?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error ??
              (removingUpvote
                ? "Could not remove upvote."
                : "Could not upvote suggestion."),
          );
        }

        if (payload.upvotes != null) {
          setSuggestions((current) =>
            sortSuggestions(
              current.map((item) =>
                item.id === suggestionId
                  ? {
                      ...item,
                      upvotes: payload.upvotes!,
                      upvotedByViewer: payload.upvotedByViewer ? true : undefined,
                    }
                  : item,
              ),
            ),
          );
        }
      })
      .catch((error) => {
        setSuggestions((current) =>
          sortSuggestions(
            current.map((item) =>
              item.id === suggestionId
                ? removingUpvote
                  ? {
                      ...item,
                      upvotes: item.upvotes + 1,
                      upvotedByViewer: true,
                    }
                  : {
                      ...item,
                      upvotes: Math.max(0, item.upvotes - 1),
                      upvotedByViewer: undefined,
                    }
                : item,
            ),
          ),
        );
        showToast(
          error instanceof Error ? error.message : "Could not update upvote.",
          "error",
        );
      })
      .finally(() => {
        pendingUpvotesRef.current.delete(suggestionId);
      });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-base font-semibold text-zinc-900">Share an idea</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Tell us what would make BattleDrop better for you.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="suggestion-title" className="text-sm font-medium text-zinc-700">
              Title
            </label>
            <input
              id="suggestion-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={INPUT_LIMITS.suggestionTitle}
              required
              className={`${inputClassName} mt-1.5`}
              placeholder="Short title for your idea"
            />
          </div>

          <div>
            <label
              htmlFor="suggestion-description"
              className="text-sm font-medium text-zinc-700"
            >
              Description
            </label>
            <textarea
              id="suggestion-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={INPUT_LIMITS.suggestionDescription}
              required
              rows={5}
              className={`${inputClassName} mt-1.5 resize-y`}
              placeholder="Explain the problem it solves and how it could work."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <span
              role="status"
              aria-label="Loading"
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          ) : null}
          {submitting ? "Submitting…" : "Submit suggestion"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">Community ideas</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sorted by upvotes so the most wanted ideas rise to the top.
        </p>

        {suggestions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
            <p className="text-sm font-medium text-zinc-900">No suggestions yet</p>
            <p className="mt-2 text-sm text-zinc-500">
              Be the first to share an idea using the form above.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {suggestions.map((suggestion) => {
              const isOwnSuggestion = suggestion.userId === currentUserId;
              const authorName = resolveAuthorName(suggestion);

              return (
                <li
                  key={suggestion.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="size-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                        <UserAvatar
                          src={suggestion.user?.avatar_url}
                          name={authorName}
                          imgClassName="h-full w-full object-cover"
                          fallbackClassName="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {suggestion.title}
                          </h3>
                          {isOwnSuggestion ? (
                            <span
                              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(suggestion.status)}`}
                            >
                              {formatUserSuggestionStatus(suggestion.status)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {authorName}
                          {isOwnSuggestion ? " · Your suggestion" : null} ·{" "}
                          {formatDisplayDateTime(suggestion.createdAt, dateSettings)}
                        </p>
                      </div>
                    </div>

                    <SuggestionUpvoteButton
                      suggestion={suggestion}
                      currentUserId={currentUserId}
                      onToggleUpvote={handleToggleUpvote}
                    />
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                    {suggestion.description}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
