import type { AdminTodoTask } from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function updateAdminTodo(
  taskId: string,
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
  const { data, error } = await admin
    .from("admin_todos")
    .update({
      title,
      description,
    })
    .eq("id", taskId)
    .select("id, title, description")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Task not found.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "admin_todo.update",
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
