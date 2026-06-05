import { promotedSlots } from "./mock-data";

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

): Map<number, DisplayProduct> {

  const byInsert = new Map<number, DisplayProduct>();



  for (const slot of promotedSlots) {

    if (slot.product === "Available") continue;



    const product = products.find((p) => p.name === slot.product);

    if (!product) continue;



    byInsert.set(slot.insertAfterOrganic, {

      ...product,

      isPromoted: true,

      promotedSpot: slot.spot,

    });

  }



  return byInsert;

}



export function buildLeaderboard(products: DisplayProduct[]): LeaderboardEntry[] {

  const voteRanks = computeVoteRanks(products);



  const promotedNames = new Set(

    promotedSlots

      .filter((s) => s.product !== "Available")

      .map((s) => s.product),

  );



  const promotedByInsert = getBookedPromotedProducts(products);



  const organic = products

    .filter((p) => !promotedNames.has(p.name))

    .sort((a, b) => b.displayVotes - a.displayVotes);



  const result: LeaderboardEntry[] = [];



  const spotBeforeFirst = promotedByInsert.get(0);

  if (spotBeforeFirst) {

    result.push({

      product: spotBeforeFirst,

      organicRank: null,

      voteRank: voteRanks.get(spotBeforeFirst.id) ?? 0,

      promoted: true,

    });

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

      result.push({

        product: promotedAfter,

        organicRank: null,

        voteRank: voteRanks.get(promotedAfter.id) ?? 0,

        promoted: true,

      });

    }

  });



  return result;

}

