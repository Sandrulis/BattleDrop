export type BattlePhase = "collecting" | "voting" | "closed";

import type {
  CurrencyCode,
  DateFormatOrder,
  DateSeparator,
  TimeFormat,
} from "@/app/lib/site-settings-types";

export type AppUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
  date_format: DateFormatOrder | null;
  time_format: TimeFormat | null;
  date_separator: DateSeparator | null;
  currency: CurrencyCode | null;
  points: number;
};

export type ProjectStatus = "draft" | "published" | "archived";

export type UserProject = {
  id: string;
  user_id: string;
  url: string;
  fetch_url: string;
  name: string;
  tagline: string;
  description: string;
  favicon_url: string | null;
  screenshot_url: string | null;
  status: ProjectStatus;
  battle_year: number | null;
  battle_iso_week: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EditProjectData = {
  id: string;
  url: string;
  fetchUrl: string;
  name: string;
  tagline: string;
  description: string;
  favicon: string | null;
  screenshotUrl: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  rank: number;
  name: string;
  tagline: string;
  description: string;
  url: string;
  logo: string;
  logoBg: string;
  faviconUrl?: string | null;
  topics: string[];
  maker: string;
  votes: number;
  comments: number;
  battleYear?: number | null;
  battleIsoWeek?: number | null;
  isPromoted?: boolean;
};

export type ProductComment = {
  id: string;
  author: string;
  authorUserId: string;
  authorAvatarUrl?: string | null;
  /** Full name or handle — used for avatar initials fallback */
  authorDisplayName?: string;
  /** Total upvotes received on all of this author's comments */
  authorTotalUpvotes?: number;
  body: string;
  createdAt: string;
  likes: number;
  upvotedByViewer?: boolean;
  firstUpvoterAvatarUrl?: string | null;
  firstUpvoterName?: string | null;
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
  minProjectsEnabled: boolean;
  votingEndsAt: string;
  votingOpensAt: string;
  monthChampion: string;
};
