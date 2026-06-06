"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteProjectModal } from "@/app/components/delete-project-modal";
import { Toast, useToast } from "@/app/components/toast";
import { buildScreenshotProxyUrl } from "@/app/lib/projects/project-utils";
import type { UserProject } from "@/app/lib/types";

function statusLabel(status: UserProject["status"]) {
  if (status === "draft") return "Draft";
  if (status === "published") return "Published";
  return "Archived";
}

const actionButtonClassName =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50";

type MyProjectsListProps = {
  projects: UserProject[];
};

export function MyProjectsList({ projects }: MyProjectsListProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<UserProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast(data.error ?? "Could not delete project.", "error");
        return;
      }

      setDeleteTarget(null);
      router.refresh();
    } catch {
      showToast("Could not delete project.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-900">No projects yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Submit your first product to save it as a draft.
        </p>
        <Link
          href="/submit"
          className="mt-5 inline-flex cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Submit product
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {projects.map((project) => {
          const screenshotSrc = project.screenshot_url
            ? buildScreenshotProxyUrl(project.fetch_url, project.screenshot_url)
            : null;

          return (
            <li
              key={project.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    {project.favicon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.favicon_url}
                        alt=""
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-zinc-400">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-zinc-900">
                          {project.name}
                        </h2>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                          {statusLabel(project.status)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                        {project.tagline}
                      </p>
                      {project.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">
                          {project.description}
                        </p>
                      )}
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block break-all text-xs text-[#da552f] hover:underline"
                      >
                        {project.url}
                      </a>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/submit?projectId=${project.id}`}
                          className={actionButtonClassName}
                        >
                          <i className="fa-solid fa-pen-to-square text-[11px]" aria-hidden />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          className={`${actionButtonClassName} text-red-600 hover:bg-red-50`}
                        >
                          <i className="fa-solid fa-trash-can text-[11px]" aria-hidden />
                          Delete
                        </button>
                        {project.status === "draft" && (
                          <>
                            <Link
                              href={`/my-projects/${project.id}/preview`}
                              className={actionButtonClassName}
                            >
                              <i className="fa-solid fa-eye text-[11px]" aria-hidden />
                              Preview
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                showToast("Publish flow coming soon.")
                              }
                              className={`${actionButtonClassName} border-[#da552f]/20 text-[#da552f] hover:bg-[#da552f]/5`}
                            >
                              <i className="fa-solid fa-rocket text-[11px]" aria-hidden />
                              Publish
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {screenshotSrc && (
                      <div className="relative hidden min-h-0 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 sm:block md:w-72">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshotSrc}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <DeleteProjectModal
        projectName={deleteTarget?.name ?? ""}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
