import type { AdminTodoTask } from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function createAdminTodo(
  title: string,
  description: string,
): Promise<AdminTodoTask> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  assertMaxLength(title, INPUT_LIMITS.todoTitle, "Title");
  assertMaxLength(description, INPUT_LIMITS.todoDescription, "Description");

  const admin = createAdminClient();
  const { data: lastTask, error: lastTaskError } = await admin
    .from("admin_todos")
    .select("sort_order")
    .eq("board_column", "pending")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastTaskError) {
    throw new Error(lastTaskError.message);
  }

  const sortOrder = typeof lastTask?.sort_order === "number" ? lastTask.sort_order + 1 : 0;

  const { data, error } = await admin
    .from("admin_todos")
    .insert({
      title,
      description,
      board_column: "pending",
      sort_order: sortOrder,
    })
    .select("id, title, description")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create task.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "admin_todo.create",
    entityType: "admin_todo",
    entityId: data.id,
    metadata: { title: data.title },
  });

  return {
    id: data.id,
    title: data.title,
    description: data.description,
  };
}
