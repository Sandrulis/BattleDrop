"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthButton } from "@/app/components/auth-button";
import { signInWithGoogle } from "@/app/lib/auth/sign-in-with-google";
import { Toast, useToast } from "@/app/components/toast";
import type { ProjectPreviewMeta } from "@/app/lib/fetch-project-meta";
import { normalizeProjectInputUrl } from "@/app/lib/projects/project-utils";
import type { EditProjectData } from "@/app/lib/types";

const PENDING_DRAFT_KEY = "battle-drop:pending-submit-draft";

type PendingSubmitDraft = {
  url: string;
  fetchUrl: string;
  name: string;
  tagline: string;
  description: string;
  favicon: string | null;
  screenshotUrl: string | null;
};

type SaveProjectResult =
  | { status: "saved" }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string };

function readPendingDraft(): PendingSubmitDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(PENDING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSubmitDraft;
  } catch {
    return null;
  }
}

function writePendingDraft(draft: PendingSubmitDraft) {
  sessionStorage.setItem(PENDING_DRAFT_KEY, JSON.stringify(draft));
}

function clearPendingDraft() {
  sessionStorage.removeItem(PENDING_DRAFT_KEY);
}

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

type SubmitProductFormProps = {
  editProject?: EditProjectData;
  isSignedIn?: boolean;
};

export function SubmitProductForm({
  editProject,
  isSignedIn = false,
}: SubmitProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(editProject);
  const [step, setStep] = useState<1 | 2>(isEditing ? 2 : 1);
  const [url, setUrl] = useState(editProject?.url ?? "");
  const { toast, showToast, dismissToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(editProject?.name ?? "");
  const [tagline, setTagline] = useState(editProject?.tagline ?? "");
  const [description, setDescription] = useState(editProject?.description ?? "");
  const [favicon, setFavicon] = useState<string | null>(editProject?.favicon ?? null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(
    editProject?.screenshotUrl ?? null,
  );
  const [fetchUrl, setFetchUrl] = useState(editProject?.fetchUrl ?? "");
  const [snapshotFailed, setSnapshotFailed] = useState(false);

  const autoSaveStarted = useRef(false);

  const buildDraft = (): PendingSubmitDraft => {
    const normalizedUrl = normalizeProjectInputUrl(url) ?? url.trim();

    return {
      url: normalizedUrl,
      fetchUrl: fetchUrl || normalizedUrl,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      favicon,
      screenshotUrl,
    };
  };

  const prepareLoginAndSave = (): boolean => {
    if (!name.trim()) {
      showToast("Product name is required.", "error");
      return false;
    }

    if (!tagline.trim()) {
      showToast("Tagline is required.", "error");
      return false;
    }

    writePendingDraft(buildDraft());
    return true;
  };

  const saveProject = async (draft: PendingSubmitDraft): Promise<SaveProjectResult> => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: draft.url,
        fetchUrl: draft.fetchUrl,
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        favicon: draft.favicon,
        screenshotUrl: draft.screenshotUrl,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      skipped?: boolean;
      message?: string;
    };

    if (!response.ok) {
      return {
        status: "error",
        message: data.error ?? "Could not save project.",
      };
    }

    if (data.skipped) {
      return {
        status: "skipped",
        message: data.message ?? "This project could not be saved.",
      };
    }

    return { status: "saved" };
  };

  const handleSaveResult = (result: SaveProjectResult) => {
    if (result.status === "error") {
      showToast(result.message, "error");
      return;
    }

    clearPendingDraft();

    if (result.status === "skipped") {
      showToast(result.message, "error");
      return;
    }

    showToast("Project saved.", "success");
    router.push("/my-projects");
    router.refresh();
  };

  useEffect(() => {
    if (!isSignedIn || isEditing || autoSaveStarted.current) return;

    const draft = readPendingDraft();
    if (!draft) return;

    autoSaveStarted.current = true;
    setUrl(draft.url);
    setFetchUrl(draft.fetchUrl);
    setName(draft.name);
    setTagline(draft.tagline);
    setDescription(draft.description);
    setFavicon(draft.favicon);
    setScreenshotUrl(draft.screenshotUrl);
    setStep(2);
    setSaving(true);

    void saveProject(draft)
      .then(handleSaveResult)
      .catch(() => {
        showToast("Could not save project. Try again.", "error");
      })
      .finally(() => {
        setSaving(false);
      });
  }, [isSignedIn, isEditing]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      showToast("Enter your project URL.", "error");
      return;
    }

    const normalizedUrl = normalizeProjectInputUrl(trimmed);
    if (!normalizedUrl) {
      showToast("Enter a valid project URL.", "error");
      return;
    }

    setUrl(normalizedUrl);
    setLoading(true);

    try {
      const checkResponse = await fetch(
        `/api/projects/check-url?url=${encodeURIComponent(normalizedUrl)}`,
      );
      const checkData = (await checkResponse.json()) as {
        blocked?: boolean;
        message?: string | null;
        error?: string;
      };

      if (!checkResponse.ok) {
        showToast(checkData.error ?? "Could not validate project URL.", "error");
        return;
      }

      if (checkData.blocked) {
        showToast(
          checkData.message ?? "This project is already in the database.",
          "error",
        );
        return;
      }

      const response = await fetch("/api/project-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = (await response.json()) as ProjectPreviewMeta & {
        error?: string;
      };

      if (!response.ok) {
        showToast(data.error ?? "Could not fetch project data.", "error");
        return;
      }

      setName(data.name);
      setTagline(data.tagline);
      setDescription("");
      setFavicon(data.favicon);
      setFetchUrl(data.fetchUrl);
      setScreenshotUrl(data.screenshotUrl);
      setSnapshotFailed(false);
      setStep(2);
    } catch {
      showToast("Could not fetch project data. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !isSignedIn) {
      if (!prepareLoginAndSave()) return;
      await signInWithGoogle("/submit");
      return;
    }

    if (!name.trim()) {
      showToast("Product name is required.", "error");
      return;
    }

    if (!tagline.trim()) {
      showToast("Tagline is required.", "error");
      return;
    }

    const draft = buildDraft();

    setSaving(true);

    try {
      const payload = {
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        favicon: draft.favicon,
        screenshotUrl: draft.screenshotUrl,
      };

      const response = await fetch(
        isEditing && editProject
          ? `/api/projects/${editProject.id}`
          : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? payload
              : {
                  url: draft.url,
                  fetchUrl: draft.fetchUrl,
                  ...payload,
                },
          ),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        skipped?: boolean;
        message?: string;
      };

      if (!response.ok) {
        showToast(data.error ?? "Could not save project.", "error");
        return;
      }

      if (data.skipped) {
        handleSaveResult({
          status: "skipped",
          message: data.message ?? "This project could not be saved.",
        });
        return;
      }

      handleSaveResult({ status: "saved" });
    } catch {
      showToast("Could not save project. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (isEditing) {
      router.push("/my-projects");
      return;
    }

    setStep(1);
    setSnapshotFailed(false);
  };

  const showGuestSaveAction = !isEditing && !isSignedIn;

  if (step === 2) {
    return (
      <>
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            {!isEditing && (
              <p className="text-sm font-medium text-[#da552f]">Step 2 of 2</p>
            )}
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">
              {isEditing ? "Edit project details" : "Review your product"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {isEditing
                ? "Update your product details before saving."
                : "We pulled data from your site. Edit anything before continuing."}
            </p>

            {isEditing && (
              <p className="mt-4 break-all text-xs text-zinc-500">
                Project URL:{" "}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#da552f] hover:underline"
                >
                  {url}
                </a>
              </p>
            )}

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                {favicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={favicon}
                    alt=""
                    className="h-10 w-10 object-contain"
                    onError={() => setFavicon(null)}
                  />
                ) : (
                  <span className="text-lg font-semibold text-zinc-400">
                    {name.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label
                    htmlFor="product-name"
                    className="block text-sm font-medium text-zinc-900"
                  >
                    Product name
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1.5 ${inputClassName}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="product-tagline"
                    className="block text-sm font-medium text-zinc-900"
                  >
                    Tagline
                  </label>
                  <input
                    id="product-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className={`mt-1.5 ${inputClassName}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-zinc-900"
              >
                Description
              </label>
              <p className="mt-1 text-sm text-zinc-500">
                Tell voters what makes your product worth trying.
              </p>
              <textarea
                id="product-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem does it solve? Who is it for?"
                className={`mt-3 resize-y ${inputClassName}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-sm font-semibold text-zinc-900">
              Landing page preview
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Full-width snapshot from{" "}
              <span className="break-all">{fetchUrl || url.trim()}</span>
            </p>
            <div className="mt-4 max-h-[520px] overflow-y-auto overflow-x-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              {screenshotUrl && !snapshotFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={screenshotUrl}
                  alt="Landing page preview"
                  className="block h-auto w-full"
                  onError={() => setSnapshotFailed(true)}
                />
              ) : (
                <div className="flex min-h-[200px] items-center justify-center px-6 py-12 text-center text-sm text-zinc-500">
                  Preview unavailable for this site. You can still save your
                  project as a draft.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
            >
              {isEditing ? "Cancel" : "Back"}
            </button>
            {showGuestSaveAction ? (
              <AuthButton
                user={null}
                returnPath="/submit"
                label="Login + Save"
                onBeforeSignIn={prepareLoginAndSave}
                className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
              />
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </form>

        <Toast toast={toast} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={handleUrlSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-sm font-medium text-[#da552f]">Step 1 of 2</p>
        <label
          htmlFor="project-url"
          className="mt-2 block text-sm font-medium text-zinc-900"
        >
          Project URL
        </label>
        <p className="mt-1 text-sm text-zinc-500">
          Link to your product landing page or website.
        </p>
        <input
          id="project-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourproduct.com"
          value={url}
          disabled={loading}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          className={`mt-4 ${inputClassName} disabled:opacity-60`}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Fetching…" : "Next"}
        </button>
      </form>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
