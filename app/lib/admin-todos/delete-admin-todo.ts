import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function deleteAdminTodo(taskId: string) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("admin_todos").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }
}
