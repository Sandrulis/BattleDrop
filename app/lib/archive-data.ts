import { products } from "./mock-data";

export type WeekStatus = "completed" | "active" | "upcoming";

export type ArchiveWinnerProduct = {
  name: string;
  tagline: string;
  url: string;
  logo: string;
  logoBg: string;
  topics: string[];
  maker: string;
  votes: number;
  comments: number;
  isPromoted?: boolean;
};

export type WeekArchiveEntry = {
  week: number;
  status: WeekStatus;
  product: ArchiveWinnerProduct | null;
};

export const ARCHIVE_YEARS = [2025, 2026] as const;
export const DEFAULT_ARCHIVE_YEAR = 2026;
export const CURRENT_BATTLE_WEEK = 12;

const EXTRA_CATALOG: Record<string, Omit<ArchiveWinnerProduct, "votes" | "comments">> = {
  Flowstate: {
    name: "Flowstate",
    tagline: "Focus sessions that sync across your whole team",
    url: "flowstate.app",
    logo: "F",
    logoBg: "#0d9488",
    topics: ["Productivity", "SaaS"],
    maker: "@mika_h",
  },
  Shipbox: {
    name: "Shipbox",
    tagline: "Changelog and release notes in one beautiful feed",
    url: "shipbox.io",
    logo: "S",
    logoBg: "#6366f1",
    topics: ["SaaS", "Developer Tools"],
    maker: "@devdan",
  },
  Relaypad: {
    name: "Relaypad",
    tagline: "Handoff docs that stay in sync with your codebase",
    url: "relaypad.dev",
    logo: "R",
    logoBg: "#7c3aed",
    topics: ["Developer Tools", "Docs"],
    maker: "@cleo_w",
  },
  Mintrow: {
    name: "Mintrow",
    tagline: "Simple cap table modeling for pre-seed founders",
    url: "mintrow.com",
    logo: "M",
    logoBg: "#059669",
    topics: ["Fintech", "Startups"],
    maker: "@jordan_p",
  },
  Stackline: {
    name: "Stackline",
    tagline: "Stack ranking for roadmap decisions with your users",
    url: "stackline.co",
    logo: "S",
    logoBg: "#ea580c",
    topics: ["Product", "B2B"],
    maker: "@ines_v",
  },
};

const productCatalog: Record<string, Omit<ArchiveWinnerProduct, "votes" | "comments">> = {
  ...EXTRA_CATALOG,
};

for (const p of products) {
  productCatalog[p.name] = {
    name: p.name,
    tagline: p.tagline,
    url: p.url,
    logo: p.logo,
    logoBg: p.logoBg,
    topics: p.topics,
    maker: p.maker,
    isPromoted: p.isPromoted,
  };
}

const WINNER_NAMES = Object.keys(productCatalog);

function pickWinnerName(week: number, year: number): string {
  const offset = year === 2025 ? 0 : 3;
  return WINNER_NAMES[(week - 1 + offset) % WINNER_NAMES.length];
}

function buildWinnerProduct(
  name: string,
  week: number,
): ArchiveWinnerProduct {
  const base = productCatalog[name];
  return {
    ...base,
    votes: 180 + week * 4 + (name.length % 40),
    comments: 8 + (week % 25),
  };
}

function buildYear(
  year: number,
  completedThrough: number,
  activeWeek: number | null,
): WeekArchiveEntry[] {
  return Array.from({ length: 52 }, (_, i) => {
    const week = i + 1;

    if (activeWeek !== null && week === activeWeek) {
      const liveLeader = products[0];
      return {
        week,
        status: "active" as const,
        product: {
          name: liveLeader.name,
          tagline: liveLeader.tagline,
          url: liveLeader.url,
          logo: liveLeader.logo,
          logoBg: liveLeader.logoBg,
          topics: liveLeader.topics,
          maker: liveLeader.maker,
          votes: liveLeader.votes,
          comments: liveLeader.comments,
          isPromoted: liveLeader.isPromoted,
        },
      };
    }

    if (week <= completedThrough) {
      const name = pickWinnerName(week, year);
      return {
        week,
        status: "completed" as const,
        product: buildWinnerProduct(name, week),
      };
    }

    return { week, status: "upcoming" as const, product: null };
  });
}

const archiveByYear: Record<number, WeekArchiveEntry[]> = {
  2025: buildYear(2025, 52, null),
  2026: buildYear(2026, 11, CURRENT_BATTLE_WEEK),
};

export function getArchiveYearData(year: number): WeekArchiveEntry[] {
  return archiveByYear[year] ?? buildYear(year, 0, null);
}

export function getAvailableArchiveYears(): number[] {
  return [...ARCHIVE_YEARS];
}

export type ArchiveMonthGroup = {
  monthIndex: number;
  monthLabel: string;
  weeks: WeekArchiveEntry[];
};

function getMondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - day + 1);
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  return monday;
}

function getMonthLabelForWeek(year: number, week: number): string {
  const monday = getMondayOfIsoWeek(year, week);
  return monday
    .toLocaleString("en-US", { month: "long" })
    .toUpperCase();
}

export function groupWeeksByMonth(
  year: number,
  weeks: WeekArchiveEntry[],
): ArchiveMonthGroup[] {
  const map = new Map<number, ArchiveMonthGroup>();

  for (const entry of weeks) {
    const monday = getMondayOfIsoWeek(year, entry.week);
    const monthIndex = monday.getMonth();
    const monthLabel = getMonthLabelForWeek(year, entry.week);

    const existing = map.get(monthIndex);
    if (existing) {
      existing.weeks.push(entry);
    } else {
      map.set(monthIndex, { monthIndex, monthLabel, weeks: [entry] });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.monthIndex - b.monthIndex);
}
