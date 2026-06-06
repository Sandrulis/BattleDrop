import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { SubmitProductForm } from "@/app/components/submit-product-form";
import { SubmitSidePanel } from "@/app/components/submit-side-panel";
import { getProjectForEdit } from "@/app/lib/projects/get-project-for-edit";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const user = await getCurrentAppUser();

  if (projectId && !user) {
    redirect("/");
  }

  const editProject = projectId ? await getProjectForEdit(projectId) : null;

  if (projectId && !editProject) {
    redirect("/my-projects");
  }

  const isEditing = Boolean(editProject);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={isEditing ? "/my-projects" : "/"}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
        >
          <span aria-hidden>←</span> Back
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              {isEditing ? "Edit project" : "Submit your product"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
              {isEditing
                ? "Update your saved draft before publishing."
                : "Enter your project URL to join this week's battle. One-time fee: €5."}
            </p>
            <div className="mt-8">
              <SubmitProductForm
                editProject={editProject ?? undefined}
                isSignedIn={Boolean(user)}
              />
            </div>
          </div>

          <SubmitSidePanel project={editProject ?? undefined} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
