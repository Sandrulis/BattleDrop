import Link from "next/link";
import { redirect } from "next/navigation";
import { MyProjectsList } from "@/app/components/my-projects-list";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { getUserProjects } from "@/app/lib/projects/get-user-projects";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export default async function MyProjectsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/");

  const projects = await getUserProjects();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              My Projects
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Your saved drafts and submitted products.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex cursor-pointer rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Submit product
          </Link>
        </div>

        <div className="mt-8">
          <MyProjectsList projects={projects} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
