import { currentBattle } from "./mock-data";

export type ProductSocials = {
  twitter?: string;
  linkedin?: string;
  github?: string;
};

export type ProductMeta = {
  socials: ProductSocials;
  launchedAt: string;
  teamSize: string;
  pricing: string;
};

const META_BY_PRODUCT: Record<string, ProductMeta> = {
  "1": {
    socials: {
      twitter: "https://twitter.com/orbitkit",
      linkedin: "https://linkedin.com/company/orbitkit",
      github: "https://github.com/orbitkit",
    },
    launchedAt: "June 2026",
    teamSize: "2 founders",
    pricing: "Free tier + Pro from €19/mo",
  },
  "2": {
    socials: {
      twitter: "https://twitter.com/patchlane",
      github: "https://github.com/patchlane",
    },
    launchedAt: "June 2026",
    teamSize: "Solo founder",
    pricing: "From €29/mo",
  },
};

const DEFAULT_META: ProductMeta = {
  socials: {
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
  },
  launchedAt: "2026",
  teamSize: "Early-stage team",
  pricing: "See website",
};

export function getProductMeta(productId: string): ProductMeta {
  return META_BY_PRODUCT[productId] ?? DEFAULT_META;
}

export function getBattleContext() {
  return {
    week: currentBattle.week,
    year: currentBattle.year,
  };
}
