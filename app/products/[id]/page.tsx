import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../components/product-detail-view";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import {
  getProductPageData,
  getProductPageMetadata,
} from "@/app/lib/projects/get-product-page-data";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const metadata = await getProductPageMetadata(id);
  if (!metadata) return { title: "Product" };

  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const [pageData, { siteName }] = await Promise.all([
    getProductPageData(id),
    getSiteSettings(),
  ]);

  if (!pageData) notFound();

  const backHref =
    from === "my-projects" ? "/my-projects" : pageData.backHref;
  const backLabel =
    from === "my-projects" ? "Back to My Projects" : pageData.backLabel;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <ProductDetailView
          product={pageData.product}
          comments={pageData.comments}
          launchStat={pageData.launchStat}
          isSignedIn={pageData.isSignedIn}
          currentUserId={pageData.currentUserId}
          currentUserAvatarUrl={pageData.currentUserAvatarUrl}
          currentUserName={pageData.currentUserName}
          commentsEnabled={pageData.commentsEnabled}
          logoImageUrl={pageData.logoImageUrl}
          screenshotUrl={pageData.screenshotUrl}
          backHref={backHref}
          backLabel={backLabel}
          siteName={siteName}
        />
      </main>
      <SiteFooter />
    </>
  );
}
