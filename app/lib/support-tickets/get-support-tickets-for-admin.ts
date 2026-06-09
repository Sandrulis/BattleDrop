import {
  mapSupportTicketRow,
  type SupportTicket,
  type SupportTicketRow,
  type SupportTicketUser,
} from "@/app/lib/support-tickets/support-ticket-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type SupportTicketRowWithUser = SupportTicketRow & {
  users: SupportTicketUser | SupportTicketUser[] | null;
};

function mapUserRelation(
  users: SupportTicketUser | SupportTicketUser[] | null,
): SupportTicketUser | undefined {
  if (!users) return undefined;
  return Array.isArray(users) ? users[0] : users;
}

export async function getSupportTicketsForAdmin(): Promise<SupportTicket[]> {
  const user = await getCurrentAppUser();
  if (!user?.is_admin) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_tickets")
    .select(
      "id, user_id, subject, message, status, created_at, updated_at, users ( id, full_name, email, avatar_url )",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as SupportTicketRowWithUser[]).map((row) =>
    mapSupportTicketRow(row, mapUserRelation(row.users)),
  );
}
