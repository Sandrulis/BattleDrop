import {
  boardColumnToDbColumn,
  type AdminTodoBoardPayload,
} from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
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
  const allIds = [...payload.pending, ...payload.inProgress];

  if (allIds.length > 0) {
    const { data: existingRows, error: existingError } = await admin
      .from("admin_todos")
      .select("id")
      .in("id", allIds);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if ((existingRows?.length ?? 0) !== allIds.length) {
      throw new Error("One or more tasks no longer exist.");
    }
  }

  const updates = [
    ...payload.pending.map((id, index) => ({
      id,
      board_column: boardColumnToDbColumn("pending"),
      sort_order: index,
    })),
    ...payload.inProgress.map((id, index) => ({
      id,
      board_column: boardColumnToDbColumn("inProgress"),
      sort_order: index,
    })),
  ];

  for (const update of updates) {
    const { error } = await admin
      .from("admin_todos")
      .update({
        board_column: update.board_column,
        sort_order: update.sort_order,
      })
      .eq("id", update.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
