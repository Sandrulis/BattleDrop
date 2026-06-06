import type { AdminTodoBoardPayload } from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

function validateBoardPayload(payload: AdminTodoBoardPayload) {
  if (!Array.isArray(payload.pending) || !Array.isArray(payload.inProgress)) {
    throw new Error("Invalid board payload.");
  }

  const allIds = [...payload.pending, ...payload.inProgress];

  if (allIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw new Error("Each task id must be a non-empty string.");
  }

  if (new Set(allIds).size !== allIds.length) {
    throw new Error("Task ids must be unique across the board.");
  }
}

export async function syncAdminTodoBoard(payload: AdminTodoBoardPayload) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  validateBoardPayload(payload);

  const admin = createAdminClient();
  const { error } = await admin.rpc("sync_admin_todo_board", {
    pending_ids: payload.pending,
    in_progress_ids: payload.inProgress,
  });

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "admin_todo.sync_board",
    entityType: "admin_todo_board",
    metadata: {
      pendingCount: payload.pending.length,
      inProgressCount: payload.inProgress.length,
    },
  });
}
