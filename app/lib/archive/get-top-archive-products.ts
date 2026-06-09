import type { BookedPromotedSlot } from "@/app/lib/promoted-slots/types";
import type { Product } from "@/app/lib/types";
import { mapProductToArchiveProject } from "./map-product-to-archive-project";
import type { ArchiveProject } from "./types";

const TOP_ARCHIVE_SIZE = 5;

export function getTopArchiveProducts(
  products: Product[],
  promotedSlots: BookedPromotedSlot[],
): ArchiveProject[] {
  if (products.length === 0) return [];

  const promotedIds = new Set(promotedSlots.map((slot) => slot.projectId));

  return products
    .filter((product) => !promotedIds.has(product.id))
    .sort(
      (left, right) =>
        right.votes - left.votes ||
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    )
    .slice(0, TOP_ARCHIVE_SIZE)
    .map(mapProductToArchiveProject);
}
