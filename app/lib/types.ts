export type BattlePhase = "collecting" | "voting" | "closed";

export type Product = {
  id: string;
  rank: number;
  name: string;
  tagline: string;
  description: string;
  url: string;
  logo: string;
  logoBg: string;
  topics: string[];
  maker: string;
  votes: number;
  comments: number;
  isPromoted?: boolean;
};

export type ProductComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  likes: number;
  replies?: ProductComment[];
};

export type PromotedSlot = {
  spot: number;
  price: number;
  product: string;
  insertAfterOrganic: number;
};

export type Battle = {
  week: number;
  year: number;
  phase: BattlePhase;
  projectsSubmitted: number;
  projectsRequired: number;
  votingEndsAt: string;
  votingOpensAt: string;
  monthChampion: string;
};
