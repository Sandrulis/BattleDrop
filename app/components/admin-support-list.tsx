"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAlertCounts } from "@/app/components/admin-alert-counts-provider";
import { Toast, useToast } from "@/app/components/toast";
import { UserAvatar } from "@/app/components/user-avatar";
import { formatDisplayDateTime } from "@/app/lib/site-settings/format-display-date";
import {
  formatSupportTicketStatus,
  SUPPORT_TICKET_STATUSES,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/app/lib/support-tickets/support-ticket-types";
import type { SiteDateTimeSettings } from "@/app/lib/site-settings-types";

const selectClassName =
  "rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type AdminSupportListProps = {
  initialTickets: SupportTicket[];
  dateSettings: SiteDateTimeSettings;
};

export function AdminSupportList({
  initialTickets,
  dateSettings,
}: AdminSupportListProps) {
  const router = useRouter();
  const { adjustSupportCount } = useAdminAlertCounts();
  const [tickets, setTickets] = useState(initialTickets);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;

  async function handleStatusChange(ticketId: string, status: SupportTicketStatus) {
    if (updatingId) return;

    const previous = tickets;
    const previousTicket = tickets.find((ticket) => ticket.id === ticketId);
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket,
      ),
    );
    setUpdatingId(ticketId);

    try {
      const response = await fetch(`/api/support-tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as SupportTicket & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update ticket.");
      }

      setTickets((current) =>
        current.map((ticket) => (ticket.id === ticketId ? data : ticket)),
      );
      if (previousTicket?.status === "open" && status !== "open") {
        adjustSupportCount(-1);
      } else if (previousTicket?.status !== "open" && status === "open") {
        adjustSupportCount(1);
      }
      showToast("Ticket status updated.", "success");
      router.refresh();
    } catch (error) {
      setTickets(previous);
      showToast(
        error instanceof Error ? error.message : "Could not update ticket.",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
        <p className="text-sm font-medium text-zinc-900">No support tickets yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          User support requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-600">
        {openCount} open {openCount === 1 ? "ticket" : "tickets"} · {tickets.length} total
      </p>

      <ul className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {tickets.map((ticket, index) => {
          const displayName =
            ticket.user?.full_name?.trim() ||
            ticket.user?.email ||
            "Unknown user";

          return (
            <li
              key={ticket.id}
              className={`px-4 py-4 sm:px-5 sm:py-5 ${
                index > 0 ? "border-t border-zinc-100" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="size-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                    <UserAvatar
                      src={ticket.user?.avatar_url}
                      name={displayName}
                      imgClassName="h-full w-full object-cover"
                      fallbackClassName="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {ticket.subject}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {displayName} ·{" "}
                      {formatDisplayDateTime(ticket.createdAt, dateSettings)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {updatingId === ticket.id ? (
                    <span
                      role="status"
                      aria-label="Loading"
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 motion-reduce:animate-none"
                    />
                  ) : null}
                  <select
                    value={ticket.status}
                    disabled={updatingId === ticket.id}
                    onChange={(event) =>
                      handleStatusChange(
                        ticket.id,
                        event.target.value as SupportTicketStatus,
                      )
                    }
                    className={selectClassName}
                    aria-label={`Status for ${ticket.subject}`}
                  >
                    {SUPPORT_TICKET_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatSupportTicketStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {ticket.message}
              </p>
            </li>
          );
        })}
      </ul>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
