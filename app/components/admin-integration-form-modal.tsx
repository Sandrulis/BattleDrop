"use client";

type AdminIntegrationFormModalProps = {
  open: boolean;
  loading: boolean;
  mode: "add" | "edit";
  formId: string;
  name: string;
  integrationKey: string;
  apiKey: string;
  description: string;
  hasExistingApiKey: boolean;
  onNameChange: (value: string) => void;
  onIntegrationKeyChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  deleting?: boolean;
};

export function AdminIntegrationFormModal({
  open,
  loading,
  mode,
  formId,
  name,
  integrationKey,
  apiKey,
  description,
  hasExistingApiKey,
  onNameChange,
  onIntegrationKeyChange,
  onApiKeyChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
  onDelete,
  deleting = false,
}: AdminIntegrationFormModalProps) {
  if (!open) return null;

  const isEdit = mode === "edit";
  const dialogTitle = isEdit ? "Edit integration" : "Add integration";
  const dialogDescription = isEdit
    ? "Update the integration name, key, and credentials."
    : "Connect a third-party service. You can enable it after saving.";
  const submitLabel = loading
    ? isEdit
      ? "Saving…"
      : "Adding…"
    : isEdit
      ? "Save changes"
      : "Add integration";
  const busy = loading || deleting;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/30"
        onClick={busy ? undefined : onCancel}
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
              htmlFor={`${formId}-name`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Name
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Stripe"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor={`${formId}-key`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Integration key
            </label>
            <input
              id={`${formId}-key`}
              type="text"
              value={integrationKey}
              onChange={(event) => onIntegrationKeyChange(event.target.value)}
              placeholder="stripe"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Lowercase identifier used in code (e.g. stripe, analytics).
            </p>
          </div>

          <div className="min-w-0">
            <label
              htmlFor={`${formId}-api-key`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              API key
            </label>
            <input
              id={`${formId}-api-key`}
              type="password"
              value={apiKey}
              onChange={(event) => onApiKeyChange(event.target.value)}
              placeholder={
                hasExistingApiKey ? "Leave blank to keep current key" : "sk_live_…"
              }
              autoComplete="off"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
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
              placeholder="Optional notes about this integration."
              rows={3}
              className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="cursor-pointer rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
