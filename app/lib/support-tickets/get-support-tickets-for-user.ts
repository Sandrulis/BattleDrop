import {
  mapSupportTicketRow,
  type SupportTicket,
} from "@/app/lib/support-tickets/support-ticket-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getSupportTicketsForUser(): Promise<SupportTicket[]> {
  const user = await getCurrentAppUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_tickets")
    .select("id, user_id, subject, message, status, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => mapSupportTicketRow(row));
}
