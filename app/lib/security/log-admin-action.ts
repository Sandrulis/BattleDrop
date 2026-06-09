import { createAdminClient } from "@/app/lib/supabase/admin";

export type AdminAuditAction =
  | "site_settings.update"
  | "battle_week_settings.update"
  | "user.admin.update"
  | "admin_todo.create"
  | "admin_todo.update"
  | "admin_todo.delete"
  | "admin_todo.sync_board"
  | "site_integration.create"
  | "site_integration.update"
  | "site_integration.delete"
  | "site_poll.create"
  | "site_poll.update"
  | "shop_settings.update"
  | "support_ticket.update_status"
  | "user_suggestion.update_status"
  | "blog_article.create"
  | "blog_article.update"
  | "blog_article.delete"
  | "site_legal_pages.update";

type LogAdminActionInput = {
  actorId: string;
  action: AdminAuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction({
  actorId,
  action,
  entityType,
  entityId = null,
  metadata = {},
}: LogAdminActionInput) {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch {
    // Audit logging must not block primary admin actions.
  }
}
