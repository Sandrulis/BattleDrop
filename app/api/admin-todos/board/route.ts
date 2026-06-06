import { NextResponse } from "next/server";
import { syncAdminTodoBoard } from "@/app/lib/admin-todos/sync-admin-todo-board";
import type { AdminTodoBoardPayload } from "@/app/lib/admin-todos/admin-todo-types";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function PUT(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: AdminTodoBoardPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await syncAdminTodoBoard(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save board.";
    const status = message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
