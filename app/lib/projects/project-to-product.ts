import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import {
  displayUrlFromProjectUrl,
  userProjectToPreviewProduct,
} from "@/app/lib/projects/user-project-to-preview-product";
import type { Product, UserProject } from "@/app/lib/types";

type ProjectOwner = {
  full_name: string | null;
  email: string | null;
};

export function projectToProduct(
  project: UserProject,
  owner: ProjectOwner,
  rank = 0,
): Product {
  const preview = userProjectToPreviewProduct(
    project,
    formatMakerHandle(owner),
  );

  return {
    ...preview,
    rank,
    url: displayUrlFromProjectUrl(project.url),
  };
}
