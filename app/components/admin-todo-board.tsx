"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { AdminTodoFormModal } from "@/app/components/admin-todo-form-modal";
import type {
  AdminTodoBoardState,
  AdminTodoTask,
} from "@/app/lib/admin-todos/admin-todo-types";
import { Toast, useToast } from "@/app/components/toast";

type ColumnId = keyof AdminTodoBoardState;

type DragPayload = {
  taskId: string;
  sourceColumn: ColumnId;
};

type DropTarget =
  | { type: "insert"; column: ColumnId; index: number }
  | { type: "trash"; position: "top" | "bottom" };

const COLUMNS: { id: ColumnId; label: string; description: string }[] = [
  {
    id: "pending",
    label: "Tasks",
    description: "Upcoming work waiting to be picked up.",
  },
  {
    id: "inProgress",
    label: "In progress",
    description: "Tasks you are actively working on.",
  },
];

function moveTask(
  state: AdminTodoBoardState,
  taskId: string,
  fromColumn: ColumnId,
  toColumn: ColumnId,
  toIndex: number,
): AdminTodoBoardState {
  const sourceTasks = state[fromColumn];
  const fromIndex = sourceTasks.findIndex((task) => task.id === taskId);
  if (fromIndex === -1) return state;

  const task = sourceTasks[fromIndex];
  const next: AdminTodoBoardState = {
    pending: [...state.pending],
    inProgress: [...state.inProgress],
  };

  next[fromColumn].splice(fromIndex, 1);

  let insertIndex = toIndex;
  if (fromColumn === toColumn && fromIndex < toIndex) {
    insertIndex -= 1;
  }

  insertIndex = Math.max(0, Math.min(insertIndex, next[toColumn].length));
  next[toColumn].splice(insertIndex, 0, task);

  return next;
}

function deleteTaskFromBoard(
  state: AdminTodoBoardState,
  taskId: string,
  column: ColumnId,
): AdminTodoBoardState {
  return {
    ...state,
    [column]: state[column].filter((task) => task.id !== taskId),
  };
}

function updateTaskInBoard(
  state: AdminTodoBoardState,
  taskId: string,
  updates: Pick<AdminTodoTask, "title" | "description">,
): AdminTodoBoardState {
  const updateColumn = (columnTasks: AdminTodoTask[]) =>
    columnTasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task,
    );

  return {
    pending: updateColumn(state.pending),
    inProgress: updateColumn(state.inProgress),
  };
}

function boardToPayload(state: AdminTodoBoardState) {
  return {
    pending: state.pending.map((task) => task.id),
    inProgress: state.inProgress.map((task) => task.id),
  };
}

function DropIndicator() {
  return (
    <div
      className="pointer-events-none my-1 h-1 rounded-full bg-zinc-900"
      role="presentation"
      aria-hidden
    />
  );
}

function TrashZone({
  position,
  isActive,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  position: "top" | "bottom";
  isActive: boolean;
  onDragOver: (position: "top" | "bottom") => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragOver(position);
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop();
      }}
      className={`flex h-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
        isActive
          ? "border-red-400 bg-red-50 text-red-500"
          : "border-zinc-200 bg-zinc-50 text-zinc-400"
      }`}
      aria-label={`Delete task (${position})`}
    >
      <i className="fa-solid fa-trash text-sm" aria-hidden />
    </div>
  );
}

type AdminTodoBoardProps = {
  initialTasks: AdminTodoBoardState;
  title?: string;
  description?: string;
};

export function AdminTodoBoard({
  initialTasks,
  title = "Todo",
  description = "Organize admin work with drag-and-drop tasks. Move items between columns, reorder them, or drop onto the trash zones to delete.",
}: AdminTodoBoardProps) {
  const router = useRouter();
  const formId = useId();
  const editFormId = useId();
  const { toast, showToast, dismissToast } = useToast();
  const [tasks, setTasks] = useState<AdminTodoBoardState>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTask, setEditingTask] = useState<AdminTodoTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const persistBoard = useCallback(
    async (nextBoard: AdminTodoBoardState, previousBoard: AdminTodoBoardState) => {
      setIsSaving(true);

      try {
        const response = await fetch("/api/admin-todos/board", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(boardToPayload(nextBoard)),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setTasks(previousBoard);
          showToast(data.error ?? "Could not save board.", "error");
          return;
        }
      } catch {
        setTasks(previousBoard);
        showToast("Could not save board.", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [showToast],
  );

  const clearDragState = useCallback(() => {
    setDragPayload(null);
    setDropTarget(null);
  }, []);

  const handleInsertDrop = useCallback(
    (target: Extract<DropTarget, { type: "insert" }>) => {
      if (!dragPayload || isSaving) return;

      const previousBoard = tasks;
      const nextBoard = moveTask(
        tasks,
        dragPayload.taskId,
        dragPayload.sourceColumn,
        target.column,
        target.index,
      );

      setTasks(nextBoard);
      clearDragState();
      void persistBoard(nextBoard, previousBoard);
    },
    [clearDragState, dragPayload, isSaving, persistBoard, tasks],
  );

  const handleTrashDrop = useCallback(async () => {
    if (!dragPayload || isSaving) return;

    const { taskId, sourceColumn } = dragPayload;
    const previousBoard = tasks;
    const nextBoard = deleteTaskFromBoard(tasks, taskId, sourceColumn);

    setTasks(nextBoard);
    clearDragState();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin-todos/${taskId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setTasks(previousBoard);
        showToast(data.error ?? "Could not delete task.", "error");
        return;
      }

      showToast("Task deleted.", "success");
    } catch {
      setTasks(previousBoard);
      showToast("Could not delete task.", "error");
    } finally {
      setIsSaving(false);
    }
  }, [clearDragState, dragPayload, isSaving, showToast, tasks]);

  const handleDrop = useCallback(() => {
    if (!dropTarget) {
      clearDragState();
      return;
    }

    if (dropTarget.type === "trash") {
      void handleTrashDrop();
      return;
    }

    handleInsertDrop(dropTarget);
  }, [clearDragState, dropTarget, handleInsertDrop, handleTrashDrop]);

  const addTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTaskTitle.trim();
    if (!title || isAdding) return;

    setIsAdding(true);

    try {
      const response = await fetch("/api/admin-todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: newTaskDescription.trim(),
        }),
      });

      const data = (await response.json()) as AdminTodoTask & { error?: string };

      if (!response.ok) {
        showToast(data.error ?? "Could not add task.", "error");
        return;
      }

      setTasks((current) => ({
        ...current,
        pending: [...current.pending, data],
      }));
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsAddModalOpen(false);
      showToast("Task added.", "success");
      router.refresh();
    } catch {
      showToast("Could not add task.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const closeAddModal = () => {
    if (isAdding) return;
    setIsAddModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const openEditModal = (task: AdminTodoTask) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
  };

  const closeEditModal = () => {
    if (isEditing) return;
    setEditingTask(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
  };

  const editTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTask || isEditing) return;

    const title = editTaskTitle.trim();
    if (!title) return;

    const description = editTaskDescription.trim();
    const previousBoard = tasks;
    const nextBoard = updateTaskInBoard(tasks, editingTask.id, {
      title,
      description,
    });

    setIsEditing(true);
    setTasks(nextBoard);

    try {
      const response = await fetch(`/api/admin-todos/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = (await response.json()) as AdminTodoTask & { error?: string };

      if (!response.ok) {
        setTasks(previousBoard);
        showToast(data.error ?? "Could not update task.", "error");
        return;
      }

      setTasks((current) => updateTaskInBoard(current, editingTask.id, data));
      setEditingTask(null);
      setEditTaskTitle("");
      setEditTaskDescription("");
      showToast("Task updated.", "success");
      router.refresh();
    } catch {
      setTasks(previousBoard);
      showToast("Could not update task.", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const showInsertIndicator = (column: ColumnId, index: number): boolean =>
    dropTarget?.type === "insert" &&
    dropTarget.column === column &&
    dropTarget.index === index;

  const isTrashActive = (position: "top" | "bottom") =>
    dropTarget?.type === "trash" && dropTarget.position === position;

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {title}
          </h1>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <i className="fa-solid fa-plus text-xs" aria-hidden />
            Add task
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="space-y-3">
        <TrashZone
          position="top"
          isActive={isTrashActive("top")}
          onDragOver={(position) =>
            setDropTarget({ type: "trash", position })
          }
          onDragLeave={() => setDropTarget(null)}
          onDrop={() => {
            void handleTrashDrop();
          }}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {COLUMNS.map((column) => {
            const columnTasks = tasks[column.id];

            return (
              <section
                key={column.id}
                className="flex min-h-[360px] flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {column.label}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {column.description}
                  </p>
                </div>

                <div
                  className="flex min-h-[240px] flex-1 flex-col"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropTarget({
                      type: "insert",
                      column: column.id,
                      index: columnTasks.length,
                    });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop();
                  }}
                >
                  {columnTasks.length === 0 ? (
                    <div className="relative flex flex-1 flex-col justify-center">
                      {showInsertIndicator(column.id, 0) && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                          <DropIndicator />
                        </div>
                      )}
                      <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400">
                        Drop tasks here
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {columnTasks.map((task, index) => (
                        <div key={task.id}>
                          {showInsertIndicator(column.id, index) && (
                            <DropIndicator />
                          )}

                          <article
                            draggable={!isSaving}
                            onDragStart={() => {
                              setDragPayload({
                                taskId: task.id,
                                sourceColumn: column.id,
                              });
                            }}
                            onDragEnd={clearDragState}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              const rect =
                                event.currentTarget.getBoundingClientRect();
                              const insertIndex =
                                event.clientY < rect.top + rect.height / 2
                                  ? index
                                  : index + 1;

                              setDropTarget({
                                type: "insert",
                                column: column.id,
                                index: insertIndex,
                              });
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDrop();
                            }}
                            className={`rounded-xl border bg-zinc-50 px-3 py-3 text-sm text-zinc-900 transition-[border-color,box-shadow,opacity] ${
                              isSaving
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-grab active:cursor-grabbing"
                            } ${
                              dragPayload?.taskId === task.id
                                ? "border-zinc-300 opacity-50"
                                : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className="mt-0.5 text-zinc-400"
                                aria-hidden
                              >
                                <i className="fa-solid fa-grip-vertical text-xs" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium leading-snug text-zinc-900">
                                  {task.title}
                                </p>
                                {task.description ? (
                                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                                    {task.description}
                                  </p>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                draggable={false}
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditModal(task);
                                }}
                                className="shrink-0 cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700"
                                aria-label={`Edit ${task.title}`}
                              >
                                <i className="fa-solid fa-pen text-[11px]" aria-hidden />
                              </button>
                            </div>
                          </article>
                        </div>
                      ))}

                      {showInsertIndicator(column.id, columnTasks.length) && (
                        <DropIndicator />
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <TrashZone
          position="bottom"
          isActive={isTrashActive("bottom")}
          onDragOver={(position) =>
            setDropTarget({ type: "trash", position })
          }
          onDragLeave={() => setDropTarget(null)}
          onDrop={() => {
            void handleTrashDrop();
          }}
        />
        </div>
      </div>

      <AdminTodoFormModal
        open={isAddModalOpen}
        loading={isAdding}
        mode="add"
        formId={formId}
        title={newTaskTitle}
        description={newTaskDescription}
        onTitleChange={setNewTaskTitle}
        onDescriptionChange={setNewTaskDescription}
        onCancel={closeAddModal}
        onSubmit={addTask}
      />

      <AdminTodoFormModal
        open={editingTask !== null}
        loading={isEditing}
        mode="edit"
        formId={editFormId}
        title={editTaskTitle}
        description={editTaskDescription}
        onTitleChange={setEditTaskTitle}
        onDescriptionChange={setEditTaskDescription}
        onCancel={closeEditModal}
        onSubmit={editTask}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
