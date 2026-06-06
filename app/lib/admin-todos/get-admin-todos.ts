import {
  emptyAdminTodoBoard,
  groupAdminTodosByColumn,
  type AdminTodoBoardState,
  type AdminTodoRow,
} from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function getAdminTodos(): Promise<AdminTodoBoardState> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) return emptyAdminTodoBoard();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_todos")
    .select(
      "id, title, description, board_column, sort_order, created_at, updated_at",
    )
    .order("board_column", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data) return emptyAdminTodoBoard();

  return groupAdminTodosByColumn(data as AdminTodoRow[]);
}
