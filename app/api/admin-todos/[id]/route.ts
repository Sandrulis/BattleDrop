import { NextResponse } from "next/server";
import { deleteAdminTodo } from "@/app/lib/admin-todos/delete-admin-todo";
import { updateAdminTodo } from "@/app/lib/admin-todos/update-admin-todo";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UpdateAdminTodoBody = {
  title?: string;
  description?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: UpdateAdminTodoBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = body.title?.trim();
  const description = body.description?.trim() ?? "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    const task = await updateAdminTodo(id, title, description);
    return NextResponse.json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update task.";
    const status = message === "Task not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteAdminTodo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
