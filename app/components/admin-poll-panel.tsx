"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { PollProgressBars } from "@/app/components/poll-progress-bars";
import { Toast, useToast } from "@/app/components/toast";
import { POLL_INTEGRATION_KEY, type SitePoll } from "@/app/lib/polls/poll-types";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";

type AdminPollPanelProps = {
  initialPolls: SitePoll[];
  pollIntegrationEnabled: boolean;
};

const EMPTY_OPTIONS = ["", ""];

export function AdminPollPanel({
  initialPolls,
  pollIntegrationEnabled,
}: AdminPollPanelProps) {
  const router = useRouter();
  const formId = useId();
  const { toast, showToast, dismissToast } = useToast();
  const [polls, setPolls] = useState<SitePoll[]>(initialPolls);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(EMPTY_OPTIONS);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function addOption() {
    if (options.length >= 10) return;
    setOptions((current) => [...current, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    setCreating(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options }),
      });

      const data = (await response.json()) as SitePoll & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create poll.");
      }

      setPolls((current) => [data, ...current]);
      setQuestion("");
      setOptions(EMPTY_OPTIONS);
      setShowCreateForm(false);
      showToast("Poll created.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not create poll.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleEnabled(poll: SitePoll, enabled: boolean) {
    if (togglingId) return;

    const previous = polls;
    setPolls((current) =>
      current.map((item) => {
        if (item.id === poll.id) return { ...item, enabled };
        if (enabled) return { ...item, enabled: false };
        return item;
      }),
    );
    setTogglingId(poll.id);

    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      const data = (await response.json()) as SitePoll & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update poll.");
      }

      setPolls((current) =>
        current.map((item) => {
          if (item.id === data.id) return data;
          if (enabled) return { ...item, enabled: false };
          return item;
        }),
      );
      showToast(
        enabled ? "Poll enabled on homepage." : "Poll hidden from homepage.",
        "success",
      );
      router.refresh();
    } catch (error) {
      setPolls(previous);
      showToast(
        error instanceof Error ? error.message : "Could not update poll.",
        "error",
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <AdminPanelSection
      title="Poll"
      description="Create site-wide polls with answer options. Enable one poll at a time; it appears on the homepage sidebar when the integration_poll integration is active."
    >
      {!pollIntegrationEnabled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Polls will not appear on the homepage while the{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs text-red-900">
            {POLL_INTEGRATION_KEY}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {polls.length === 0
            ? "No polls created yet."
            : `${polls.length} poll${polls.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <i className={`fas ${showCreateForm ? "fa-xmark" : "fa-plus"} text-xs`} aria-hidden />
          {showCreateForm ? "Cancel" : "Create poll"}
        </button>
      </div>

      {showCreateForm ? (
        <form
          id={formId}
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-zinc-900">New poll</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor={`${formId}-question`}
                className="block text-sm font-medium text-zinc-700"
              >
                Question
              </label>
              <input
                id={`${formId}-question`}
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={INPUT_LIMITS.pollQuestion}
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
                placeholder="What should we build next?"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-zinc-700">
                Answer options
              </legend>
              <ul className="mt-2 space-y-2">
                {options.map((option, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(event) => updateOption(index, event.target.value)}
                      maxLength={INPUT_LIMITS.pollOption}
                      required
                      className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      className="cursor-pointer rounded-lg border border-zinc-200 px-2.5 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <i className="fas fa-trash-can" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 10}
                className="mt-2 cursor-pointer text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Add option
              </button>
            </fieldset>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#da552f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c04a29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <span
                  role="status"
                  aria-label="Loading"
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
              ) : null}
              Create poll
            </button>
          </div>
        </form>
      ) : null}

      {polls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
          <i className="fas fa-square-poll-vertical text-2xl text-zinc-400" aria-hidden />
          <p className="mt-3 text-sm font-medium text-zinc-700">No polls yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Create a question with at least two answers, then enable it for the homepage.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li
              key={poll.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {poll.question}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        poll.enabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {poll.enabled ? "On homepage" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={poll.enabled}
                    aria-label={
                      poll.enabled ? "Hide poll from homepage" : "Show poll on homepage"
                    }
                    disabled={togglingId === poll.id}
                    onClick={() => handleToggleEnabled(poll, !poll.enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      poll.enabled ? "bg-[#da552f]" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                        poll.enabled ? "translate-x-[1.375rem]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4">
                <PollProgressBars
                  options={poll.options}
                  totalVotes={poll.totalVotes}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </AdminPanelSection>
  );
}
