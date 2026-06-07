import type { BookedPromotedSlot } from "@/app/lib/promoted-slots/types";
import type { Product } from "./types";

export type DisplayProduct = Product & {
  displayVotes: number;
  promotedSpot?: number;
};

export type LeaderboardEntry = {
  product: DisplayProduct;
  organicRank: number | null;
  voteRank: number;
  promoted: boolean;
};

function computeVoteRanks(products: DisplayProduct[]): Map<string, number> {
  const sorted = [...products].sort((a, b) => b.displayVotes - a.displayVotes);
  const ranks = new Map<string, number>();

  sorted.forEach((product, index) => {
    ranks.set(product.id, index + 1);
  });

  return ranks;
}

function getBookedPromotedProducts(
  products: DisplayProduct[],
  bookedSlots: BookedPromotedSlot[],
): Map<number, DisplayProduct> {
  const byInsert = new Map<number, DisplayProduct>();

  for (const slot of bookedSlots) {
    const product = products.find((entry) => entry.id === slot.projectId);
    if (!product) continue;

    byInsert.set(slot.insertAfterOrganic, {
      ...product,
      isPromoted: true,
      promotedSpot: slot.spot,
    });
  }

  return byInsert;
}

function assembleLeaderboard(
  organic: DisplayProduct[],
  products: DisplayProduct[],
  bookedSlots: BookedPromotedSlot[],
): LeaderboardEntry[] {
  const voteRanks = computeVoteRanks(products);
  const promotedByInsert = getBookedPromotedProducts(products, bookedSlots);
  const result: LeaderboardEntry[] = [];
  const insertedPromotedIds = new Set<string>();

  const addPromotedEntry = (product: DisplayProduct) => {
    if (insertedPromotedIds.has(product.id)) return;

    result.push({
      product,
      organicRank: null,
      voteRank: voteRanks.get(product.id) ?? 0,
      promoted: true,
    });
    insertedPromotedIds.add(product.id);
  };

  const spotBeforeFirst = promotedByInsert.get(0);
  if (spotBeforeFirst) {
    addPromotedEntry(spotBeforeFirst);
  }

  organic.forEach((product, index) => {
    const organicRank = index + 1;

    result.push({
      product,
      organicRank,
      voteRank: voteRanks.get(product.id) ?? 0,
      promoted: false,
    });

    const promotedAfter = promotedByInsert.get(organicRank);
    if (promotedAfter) {
      addPromotedEntry(promotedAfter);
    }
  });

  for (const [insertAfterOrganic, promotedProduct] of [...promotedByInsert.entries()].sort(
    ([left], [right]) => left - right,
  )) {
    if (insertAfterOrganic === 0) continue;
    addPromotedEntry(promotedProduct);
  }

  return result;
}

function getOrganicProducts(
  products: DisplayProduct[],
  bookedSlots: BookedPromotedSlot[],
) {
  const promotedIds = new Set(bookedSlots.map((slot) => slot.projectId));
  return products.filter((product) => !promotedIds.has(product.id));
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function prepareProductFeedOrder<T>(
  products: T[],
  shuffleBeforeVoting: boolean,
): T[] {
  return shuffleBeforeVoting ? shuffleArray(products) : products;
}

export function buildLeaderboard(
  products: DisplayProduct[],
  bookedSlots: BookedPromotedSlot[] = [],
): LeaderboardEntry[] {
  const organic = getOrganicProducts(products, bookedSlots).sort(
    (a, b) => b.displayVotes - a.displayVotes,
  );

  return assembleLeaderboard(organic, products, bookedSlots);
}

export function buildLeaderboardInFixedOrder(
  products: DisplayProduct[],
  bookedSlots: BookedPromotedSlot[] = [],
): LeaderboardEntry[] {
  return assembleLeaderboard(
    getOrganicProducts(products, bookedSlots),
    products,
    bookedSlots,
  );
}
