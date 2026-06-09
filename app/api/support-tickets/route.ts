import { NextResponse } from "next/server";
import { createSupportTicket } from "@/app/lib/support-tickets/create-support-ticket";

type CreateSupportTicketBody = {
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: CreateSupportTicketBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim() ?? "";

  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const ticket = await createSupportTicket(subject, message);
    return NextResponse.json(ticket);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create support ticket.";
    const status = message === "Sign in required." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
