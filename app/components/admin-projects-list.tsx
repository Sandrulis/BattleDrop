import { buildScreenshotProxyUrl } from "@/app/lib/projects/project-utils";
import type { AdminProject } from "@/app/lib/projects/get-all-projects-for-admin";
import type { UserProject } from "@/app/lib/types";

function statusLabel(status: UserProject["status"]) {
  if (status === "draft") return "Draft";
  if (status === "published") return "Published";
  return "Archived";
}

type AdminProjectsListProps = {
  projects: AdminProject[];
};

export function AdminProjectsList({ projects }: AdminProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-900">No projects yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Submitted products will appear here once founders save drafts.
        </p>
      </div>
    );
  }

  return (
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
                    <p className="mt-2 text-sm font-medium text-zinc-700">
                      {project.ownerName}
                    </p>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block break-all text-xs text-[#da552f] hover:underline"
                    >
                      {project.url}
                    </a>
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
  );
}
