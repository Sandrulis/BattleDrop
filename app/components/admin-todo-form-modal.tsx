"use client";

type AdminTodoFormModalProps = {
  open: boolean;
  loading: boolean;
  mode: "add" | "edit";
  formId: string;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminTodoFormModal({
  open,
  loading,
  mode,
  formId,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}: AdminTodoFormModalProps) {
  if (!open) return null;

  const isEdit = mode === "edit";
  const dialogTitle = isEdit ? "Edit task" : "Add task";
  const dialogDescription = isEdit
    ? "Update the task title and description."
    : "New tasks are added to the Tasks column.";
  const submitLabel = loading
    ? isEdit
      ? "Saving…"
      : "Adding…"
    : isEdit
      ? "Save changes"
      : "Add task";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/30"
        onClick={loading ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-dialog-title`}
        className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <h2
          id={`${formId}-dialog-title`}
          className="text-lg font-semibold text-zinc-900"
        >
          {dialogTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{dialogDescription}</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="min-w-0">
            <label
              htmlFor={`${formId}-title`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Title
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor={`${formId}-description`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Description
            </label>
            <textarea
              id={`${formId}-description`}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Add details, links, or notes for this task."
              rows={4}
              className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
