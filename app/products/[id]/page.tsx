import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../components/product-detail-view";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getPublishedProjectProduct } from "@/app/lib/projects/get-published-project-product";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getProductComments } from "../../lib/product-comments";
import { getProductById } from "../../lib/mock-data";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

async function resolveProduct(id: string) {
  const publishedProduct = await getPublishedProjectProduct(id);
  if (publishedProduct) return publishedProduct;
  return getProductById(id);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return { title: "Product" };

  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await resolveProduct(id);

  if (!product) notFound();

  const comments = getProductComments(id);
  const { siteName } = await getSiteSettings();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <ProductDetailView
          product={product}
          comments={comments}
          siteName={siteName}
        />
      </main>
      <SiteFooter />
    </>
  );
}
