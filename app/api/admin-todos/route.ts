import { NextResponse } from "next/server";
import { createAdminTodo } from "@/app/lib/admin-todos/create-admin-todo";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type CreateAdminTodoBody = {
  title?: string;
  description?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: CreateAdminTodoBody;

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
    const task = await createAdminTodo(title, description);
    return NextResponse.json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
