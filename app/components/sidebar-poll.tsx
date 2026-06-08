"use client";

import { useState } from "react";
import { PollProgressBars } from "@/app/components/poll-progress-bars";
import { Toast, useToast } from "@/app/components/toast";
import type { HomePoll } from "@/app/lib/polls/poll-types";

type SidebarPollProps = {
  initialPoll: HomePoll;
  isSignedIn: boolean;
};

export function SidebarPoll({ initialPoll, isSignedIn }: SidebarPollProps) {
  const { toast, showToast, dismissToast } = useToast();
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasVoted = poll.viewerOptionId !== null;

  async function handleVote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOptionId || submitting || hasVoted) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOptionId }),
      });

      const data = (await response.json()) as HomePoll & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit vote.");
      }

      setPoll(data);
      showToast("Vote recorded.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not submit vote.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <i className="fas fa-square-poll-vertical text-sm text-[#da552f]" aria-hidden />
        <h3 className="text-sm font-semibold text-zinc-900">Poll</h3>
      </div>

      <p className="mt-3 text-sm font-medium leading-snug text-zinc-800">
        {poll.question}
      </p>

      {hasVoted ? (
        <div className="mt-4">
          <p className="mb-3 text-xs text-zinc-500">
            {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"} total
          </p>
          <PollProgressBars
            options={poll.options}
            totalVotes={poll.totalVotes}
            highlightOptionId={poll.viewerOptionId}
            compact
          />
        </div>
      ) : (
        <form onSubmit={handleVote} className="mt-4">
          <fieldset>
            <legend className="sr-only">Choose an answer</legend>
            <ul className="space-y-2">
              {poll.options.map((option) => (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 ${
                      selectedOptionId === option.id
                        ? "border-[#da552f] bg-orange-50/50 text-zinc-800"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`poll-${poll.id}`}
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => setSelectedOptionId(option.id)}
                      disabled={!isSignedIn || submitting}
                      className="size-4 shrink-0 accent-[#da552f]"
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          {isSignedIn ? (
            <button
              type="submit"
              disabled={!selectedOptionId || submitting}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span
                  role="status"
                  aria-label="Loading"
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
              ) : null}
              Submit vote
            </button>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              Sign in from the header to vote once in this poll.
            </p>
          )}
        </form>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
