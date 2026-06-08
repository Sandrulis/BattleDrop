import { redirect } from "next/navigation";

type ProjectPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPreviewPage({
  params,
}: ProjectPreviewPageProps) {
  const { id } = await params;
  redirect(`/products/${id}?from=my-projects`);
}
