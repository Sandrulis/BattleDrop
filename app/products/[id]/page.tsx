import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../components/product-detail-view";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getProductComments } from "../../lib/product-comments";
import { getProductById } from "../../lib/mock-data";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product — BattleDrop" };

  return {
    title: `${product.name} — BattleDrop`,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const comments = getProductComments(id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <ProductDetailView product={product} comments={comments} />
      </main>
      <SiteFooter />
    </>
  );
}
