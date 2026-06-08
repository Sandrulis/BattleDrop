import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { resolveProjectBattleWeek } from "@/app/lib/projects/project-battle-week";
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
  const battleWeek = resolveProjectBattleWeek(project);

  return {
    ...preview,
    rank,
    url: displayUrlFromProjectUrl(project.url),
    battleYear: battleWeek?.year ?? project.battle_year,
    battleIsoWeek: battleWeek?.week ?? project.battle_iso_week,
  };
}
