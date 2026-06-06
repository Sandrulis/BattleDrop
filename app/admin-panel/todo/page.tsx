import type { Metadata } from "next";
import { AdminTodoBoard } from "@/app/components/admin-todo-board";
import { getAdminTodos } from "@/app/lib/admin-todos/get-admin-todos";

export const metadata: Metadata = {
  title: "Todo — Admin Panel",
};

export default async function AdminTodoPage() {
  const initialTasks = await getAdminTodos();

  return <AdminTodoBoard initialTasks={initialTasks} />;
}
