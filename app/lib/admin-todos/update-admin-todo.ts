import type { AdminTodoTask } from "@/app/lib/admin-todos/admin-todo-types";
import { createAdminClient } from "@/app/lib/supabase/admin";
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

  return {
    id: data.id,
    title: data.title,
    description: data.description,
  };
}
