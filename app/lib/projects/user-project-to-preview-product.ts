import type { Product, UserProject } from "@/app/lib/types";

const LOGO_BG_COLORS = ["#4f46e5", "#0891b2", "#059669", "#db2777", "#d97706"];

function logoBgFromName(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % LOGO_BG_COLORS.length;
  }
  return LOGO_BG_COLORS[hash];
}

export function displayUrlFromProjectUrl(fullUrl: string) {
  try {
    const parsed = new URL(fullUrl);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.hostname}${pathname}`;
  } catch {
    return fullUrl.replace(/^https?:\/\//, "");
  }
}

export function userProjectToPreviewProduct(
  project: UserProject,
  makerName: string,
): Product {
  return {
    id: project.id,
    rank: 0,
    name: project.name,
    tagline: project.tagline,
    description:
      project.description.trim() ||
      "No description yet. Add one before publishing so voters know what your product does.",
    url: displayUrlFromProjectUrl(project.url),
    logo: project.name.charAt(0).toUpperCase() || "?",
    logoBg: logoBgFromName(project.name),
    faviconUrl: project.favicon_url,
    topics: [],
    maker: makerName,
    votes: 0,
    comments: 0,
    battleYear: project.battle_year,
    battleIsoWeek: project.battle_iso_week,
  };
}
