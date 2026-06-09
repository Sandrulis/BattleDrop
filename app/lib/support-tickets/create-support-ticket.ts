import {
  mapSupportTicketRow,
  type SupportTicket,
} from "@/app/lib/support-tickets/support-ticket-types";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function createSupportTicket(
  subject: string,
  message: string,
): Promise<SupportTicket> {
  const user = await getCurrentAppUser();
  if (!user) {
    throw new Error("Sign in required.");
  }

  assertMaxLength(subject, INPUT_LIMITS.supportSubject, "Subject");
  assertMaxLength(message, INPUT_LIMITS.supportMessage, "Message");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      message,
    })
    .select("id, user_id, subject, message, status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create support ticket.");
  }

  return mapSupportTicketRow(data);
}
