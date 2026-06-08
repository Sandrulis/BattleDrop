"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { AdminIntegrationFormModal } from "@/app/components/admin-integration-form-modal";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { Toast, useToast } from "@/app/components/toast";
import type { SiteIntegration } from "@/app/lib/integrations/integration-types";

type AdminIntegrationsPanelProps = {
  initialIntegrations: SiteIntegration[];
};

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; integration: SiteIntegration };

const EMPTY_FORM = {
  name: "",
  integrationKey: "",
  apiKey: "",
  description: "",
};

export function AdminIntegrationsPanel({
  initialIntegrations,
}: AdminIntegrationsPanelProps) {
  const router = useRouter();
  const formId = useId();
  const { toast, showToast, dismissToast } = useToast();
  const [integrations, setIntegrations] =
    useState<SiteIntegration[]>(initialIntegrations);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    if (saving || deleting) return;
    setModal({ mode: "closed" });
    setForm(EMPTY_FORM);
  }, [deleting, saving]);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "add" });
  };

  const openEditModal = (integration: SiteIntegration) => {
    setForm({
      name: integration.name,
      integrationKey: integration.integrationKey,
      apiKey: "",
      description: integration.description,
    });
    setModal({ mode: "edit", integration });
  };

  const handleToggleEnabled = async (
    integration: SiteIntegration,
    enabled: boolean,
  ) => {
    if (togglingId) return;

    const previous = integrations;
    setIntegrations((current) =>
      current.map((item) =>
        item.id === integration.id ? { ...item, enabled } : item,
      ),
    );
    setTogglingId(integration.id);

    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      const data = (await response.json()) as SiteIntegration & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update integration.");
      }

      setIntegrations((current) =>
        current.map((item) => (item.id === data.id ? data : item)),
      );
      showToast(
        enabled ? `${integration.name} enabled.` : `${integration.name} disabled.`,
        "success",
      );
    } catch (error) {
      setIntegrations(previous);
      showToast(
        error instanceof Error ? error.message : "Could not update integration.",
        "error",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      if (modal.mode === "add") {
        const response = await fetch("/api/integrations", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            integrationKey: form.integrationKey,
            apiKey: form.apiKey || undefined,
            description: form.description,
          }),
        });

        const data = (await response.json()) as SiteIntegration & { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not create integration.");
        }

        setIntegrations((current) =>
          [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
        );
        showToast("Integration added.", "success");
        closeModal();
        router.refresh();
        return;
      }

      if (modal.mode === "edit") {
        const payload: Record<string, string | null> = {
          name: form.name,
          integrationKey: form.integrationKey,
          description: form.description,
        };

        if (form.apiKey.trim()) {
          payload.apiKey = form.apiKey.trim();
        }

        const response = await fetch(`/api/integrations/${modal.integration.id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as SiteIntegration & { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not update integration.");
        }

        setIntegrations((current) =>
          current
            .map((item) => (item.id === data.id ? data : item))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        showToast("Integration saved.", "success");
        closeModal();
        router.refresh();
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save integration.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (modal.mode !== "edit" || deleting) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/integrations/${modal.integration.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete integration.");
      }

      setIntegrations((current) =>
        current.filter((item) => item.id !== modal.integration.id),
      );
      showToast("Integration deleted.", "success");
      closeModal();
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not delete integration.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPanelSection
      title="Integrations"
      description="Connect third-party services. Add credentials in the modal, then enable each integration with the switch."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {integrations.length === 0
            ? "No integrations configured yet."
            : `${integrations.length} integration${integrations.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <i className="fas fa-plus text-xs" aria-hidden />
          Add integration
        </button>
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
          <i className="fas fa-plug text-2xl text-zinc-400" aria-hidden />
          <p className="mt-3 text-sm font-medium text-zinc-700">
            No integrations yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Add Stripe, analytics, or other services and toggle them on when ready.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {integrations.map((integration) => (
            <li
              key={integration.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {integration.name}
                    </h3>
                    {integration.hasApiKey ? (
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                        Key set
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        No key
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {integration.integrationKey}
                  </p>
                  {integration.description ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      {integration.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(integration)}
                    className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    Configure
                  </button>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      integration.enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {integration.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={integration.enabled}
                    aria-label={
                      integration.enabled
                        ? `Disable ${integration.name}`
                        : `Enable ${integration.name}`
                    }
                    disabled={togglingId === integration.id}
                    onClick={() =>
                      handleToggleEnabled(integration, !integration.enabled)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      integration.enabled ? "bg-[#da552f]" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                        integration.enabled
                          ? "translate-x-[1.375rem]"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminIntegrationFormModal
        open={modal.mode !== "closed"}
        loading={saving}
        deleting={deleting}
        mode={modal.mode === "edit" ? "edit" : "add"}
        formId={formId}
        name={form.name}
        integrationKey={form.integrationKey}
        apiKey={form.apiKey}
        description={form.description}
        hasExistingApiKey={
          modal.mode === "edit" ? modal.integration.hasApiKey : false
        }
        onNameChange={(value) => setForm((current) => ({ ...current, name: value }))}
        onIntegrationKeyChange={(value) =>
          setForm((current) => ({ ...current, integrationKey: value }))
        }
        onApiKeyChange={(value) =>
          setForm((current) => ({ ...current, apiKey: value }))
        }
        onDescriptionChange={(value) =>
          setForm((current) => ({ ...current, description: value }))
        }
        onCancel={closeModal}
        onSubmit={handleSubmit}
        onDelete={modal.mode === "edit" ? handleDelete : undefined}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </AdminPanelSection>
  );
}
