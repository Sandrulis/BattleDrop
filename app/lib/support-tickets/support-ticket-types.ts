export type SupportTicketStatus = "open" | "in_progress" | "closed";

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
};

export type SupportTicketUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  user?: SupportTicketUser;
};

export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = [
  "open",
  "in_progress",
  "closed",
];

export function formatSupportTicketStatus(status: SupportTicketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In progress";
    case "closed":
      return "Closed";
  }
}

export function mapSupportTicketRow(
  row: SupportTicketRow,
  user?: SupportTicketUser,
): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user,
  };
}
