"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast, useToast } from "@/app/components/toast";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import { INPUT_LIMITS } from "@/app/lib/security/input-limits";
import {
  formatSupportTicketStatus,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/app/lib/support-tickets/support-ticket-types";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

function statusBadgeClass(status: SupportTicketStatus): string {
  switch (status) {
    case "open":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "in_progress":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "closed":
      return "bg-zinc-100 text-zinc-600 ring-zinc-200";
  }
}

type SupportPanelProps = {
  initialTickets: SupportTicket[];
  dateSettings: SiteDateTimeSettings;
};

export function SupportPanel({ initialTickets, dateSettings }: SupportPanelProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();
  const [tickets, setTickets] = useState(initialTickets);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = (await response.json()) as SupportTicket & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit support request.");
      }

      setTickets((current) => [data, ...current]);
      setSubject("");
      setMessage("");
      showToast("Support request submitted.", "success");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not submit support request.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-base font-semibold text-zinc-900">New support request</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Describe the issue and our team will review your ticket.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="support-subject" className="text-sm font-medium text-zinc-700">
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={INPUT_LIMITS.supportSubject}
              required
              className={`${inputClassName} mt-1.5`}
              placeholder="Brief summary of your issue"
            />
          </div>

          <div>
            <label htmlFor="support-message" className="text-sm font-medium text-zinc-700">
              Message
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={INPUT_LIMITS.supportMessage}
              required
              rows={5}
              className={`${inputClassName} mt-1.5 resize-y`}
              placeholder="Include steps to reproduce, links, or screenshots if helpful."
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
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">Your tickets</h2>

        {tickets.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
            <p className="text-sm font-medium text-zinc-900">No support tickets yet</p>
            <p className="mt-2 text-sm text-zinc-500">
              Submit a request above when you need help.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900">{ticket.subject}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDisplayDateTime(ticket.createdAt, dateSettings)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(ticket.status)}`}
                  >
                    {formatSupportTicketStatus(ticket.status)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {ticket.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
