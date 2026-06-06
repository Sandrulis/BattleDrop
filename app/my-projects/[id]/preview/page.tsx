import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductDetailView } from "@/app/components/product-detail-view";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { getUserProjectById } from "@/app/lib/projects/get-user-project-by-id";
import { buildScreenshotProxyUrl } from "@/app/lib/projects/project-utils";
import { userProjectToPreviewProduct } from "@/app/lib/projects/user-project-to-preview-product";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type ProjectPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getUserProjectById(id);

  if (!project) {
    return { title: "Preview" };
  }

  return {
    title: `Preview: ${project.name}`,
    description: project.tagline,
  };
}

export default async function ProjectPreviewPage({
  params,
}: ProjectPreviewPageProps) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/");

  const { id } = await params;
  const project = await getUserProjectById(id);

  if (!project) {
    redirect("/my-projects");
  }

  const makerName = user.full_name ?? user.email ?? "You";
  const previewProduct = userProjectToPreviewProduct(project, makerName);
  const screenshotSrc = project.screenshot_url
    ? buildScreenshotProxyUrl(project.fetch_url, project.screenshot_url)
    : null;
  const { siteName } = await getSiteSettings();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <ProductDetailView
          product={previewProduct}
          comments={[]}
          logoImageUrl={project.favicon_url}
          screenshotUrl={screenshotSrc}
          backHref="/my-projects"
          backLabel="Back to My Projects"
          siteName={siteName}
        />
      </main>
      <SiteFooter />
    </>
  );
}
