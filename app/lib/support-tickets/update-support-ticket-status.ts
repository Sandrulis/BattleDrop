import {
  mapSupportTicketRow,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/app/lib/support-tickets/support-ticket-types";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
): Promise<SupportTicket> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_tickets")
    .update({ status })
    .eq("id", ticketId)
    .select("id, user_id, subject, message, status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update support ticket.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "support_ticket.update_status",
    entityType: "support_ticket",
    entityId: ticketId,
    metadata: { status },
  });

  return mapSupportTicketRow(data);
}
