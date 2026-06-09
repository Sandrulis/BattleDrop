import { NextResponse } from "next/server";
import {
  SUPPORT_TICKET_STATUSES,
  type SupportTicketStatus,
} from "@/app/lib/support-tickets/support-ticket-types";
import { updateSupportTicketStatus } from "@/app/lib/support-tickets/update-support-ticket-status";

type UpdateSupportTicketBody = {
  status?: SupportTicketStatus;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: UpdateSupportTicketBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const status = body.status;

  if (!status || !SUPPORT_TICKET_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const ticket = await updateSupportTicketStatus(id, status);
    return NextResponse.json(ticket);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update support ticket.";
    const statusCode = message === "Admin access required." ? 403 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
