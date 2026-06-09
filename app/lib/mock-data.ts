import { getCurrentIsoWeek } from "./battle-week";
import type { Battle, Product, PromotedSlot } from "./types";

const currentIsoWeek = getCurrentIsoWeek();

export const currentBattle: Battle = {
  week: currentIsoWeek.week,
  year: currentIsoWeek.year,
  phase: "voting",
  projectsSubmitted: 15,
  projectsRequired: 20,
  minProjectsEnabled: false,
  votingOpensAt: "2026-06-03T12:00:00Z",
  votingEndsAt: "2026-06-07T12:00:00Z",
  monthChampion: "April — Flowstate",
};

export const products: Product[] = [
  {
    id: "1",
    rank: 1,
    name: "OrbitKit",
    tagline: "Ship weekly updates your users actually read",
    description:
      "OrbitKit turns your release notes into a beautiful weekly digest that users actually open. Connect GitHub, Linear, or Notion and we format updates into a branded feed with email and in-app delivery. Built for early-stage SaaS teams who ship fast but struggle to keep users in the loop.",
    url: "orbitkit.io",
    logo: "O",
    logoBg: "#4f46e5",
    topics: ["SaaS", "Developer Tools"],
    maker: "@lena_k",
    votes: 284,
    comments: 41,
    isPromoted: true,
  },
  {
    id: "2",
    rank: 2,
    name: "Patchlane",
    tagline: "One-click rollback for feature flags in production",
    description:
      "Patchlane gives engineering teams a single panic button for bad feature flag rollouts. See exactly which flags changed, who flipped them, and roll back to the last known-good state without a full deploy. Integrates with LaunchDarkly, Unleash, and your CI pipeline.",
    url: "patchlane.dev",
    logo: "P",
    logoBg: "#0891b2",
    topics: ["DevOps", "Infrastructure"],
    maker: "@marcusdev",
    votes: 251,
    comments: 28,
  },
  {
    id: "3",
    rank: 3,
    name: "Ledgerly",
    tagline: "Stripe-ready invoicing for solo founders in the EU",
    description:
      "Ledgerly is invoicing built for EU solo founders — VAT handling, reverse charge, and multi-currency out of the box. Connect Stripe once, send professional invoices in minutes, and stay compliant without hiring an accountant on day one.",
    url: "ledgerly.app",
    logo: "L",
    logoBg: "#059669",
    topics: ["Fintech", "SaaS"],
    maker: "@annika",
    votes: 219,
    comments: 19,
  },
  {
    id: "4",
    rank: 4,
    name: "Warmline",
    tagline: "AI support that escalates to humans with full context",
    description:
      "Warmline handles tier-1 support with AI that knows when to hand off. Every escalation arrives in your inbox with full conversation history, user metadata, and suggested replies — so your team never asks 'what did they already try?'",
    url: "warmline.ai",
    logo: "W",
    logoBg: "#db2777",
    topics: ["AI", "Customer Support"],
    maker: "@joel_r",
    votes: 198,
    comments: 33,
  },
  {
    id: "5",
    rank: 5,
    name: "Scoutboard",
    tagline: "Competitive intel dashboard for early-stage teams",
    description:
      "Scoutboard tracks competitor launches, pricing changes, and job postings in one dashboard made for seed-stage teams. Set alerts for the moves that matter and share weekly digests with your whole team without another spreadsheet.",
    url: "scoutboard.io",
    logo: "S",
    logoBg: "#d97706",
    topics: ["Analytics", "B2B"],
    maker: "@priya_s",
    votes: 176,
    comments: 12,
  },
  {
    id: "6",
    rank: 6,
    name: "Nestform",
    tagline: "Beautiful waitlists with referral loops built in",
    description:
      "Nestform helps you launch a waitlist that looks as polished as your product. Custom domains, referral rewards, and position-in-queue mechanics — all without code. Perfect for pre-launch founders who need momentum before ship day.",
    url: "nestform.com",
    logo: "N",
    logoBg: "#7c3aed",
    topics: ["Marketing", "No-code"],
    maker: "@tom_v",
    votes: 154,
    comments: 9,
  },
  {
    id: "7",
    rank: 7,
    name: "Driftnote",
    tagline: "Async standups that sync to Notion and Linear",
    description:
      "Driftnote replaces daily standup calls with a five-minute async ritual. Team members post updates on their schedule, blockers surface automatically, and everything syncs to Notion and Linear so nothing lives in a silo.",
    url: "driftnote.co",
    logo: "D",
    logoBg: "#2563eb",
    topics: ["Productivity", "Remote"],
    maker: "@sara_m",
    votes: 131,
    comments: 7,
  },
  {
    id: "8",
    rank: 8,
    name: "Cratebase",
    tagline: "Open-source component library with battle-tested tokens",
    description:
      "Cratebase is an open-source design system with components battle-tested across 40+ production apps. Design tokens, accessibility checks, and Figma sync included. Ship consistent UI without rebuilding buttons for the hundredth time.",
    url: "cratebase.design",
    logo: "C",
    logoBg: "#dc2626",
    topics: ["Design", "Open Source"],
    maker: "@felix_d",
    votes: 118,
    comments: 15,
  },
  {
    id: "9",
    rank: 9,
    name: "Vaultline",
    tagline: "Rotate API keys before your next incident",
    description:
      "Vaultline automates secret rotation for early-stage teams who still paste keys into .env files. Connect your repos, set rotation policies, and get Slack alerts before credentials expire — no enterprise vault required on day one.",
    url: "vaultline.dev",
    logo: "V",
    logoBg: "#0d9488",
    topics: ["Security", "DevOps"],
    maker: "@nina_sec",
    votes: 102,
    comments: 11,
  },
  {
    id: "10",
    rank: 10,
    name: "Formpath",
    tagline: "See where signups drop off in your onboarding",
    description:
      "Formpath records every field interaction in your signup and onboarding flows. Spot friction, compare variants, and ship fixes without wiring a full analytics stack. Built for indie SaaS founders who live in their conversion funnel.",
    url: "formpath.io",
    logo: "F",
    logoBg: "#ea580c",
    topics: ["Analytics", "SaaS"],
    maker: "@kai_m",
    votes: 91,
    comments: 8,
  },
  {
    id: "11",
    rank: 11,
    name: "Pingboard",
    tagline: "Status pages that don't look like a side project",
    description:
      "Pingboard gives micro-SaaS teams a polished status page in under ten minutes. Uptime checks, incident timelines, subscriber alerts, and a custom domain — everything you need before your first outage, not after.",
    url: "pingboard.status",
    logo: "P",
    logoBg: "#4b5563",
    topics: ["Infrastructure", "B2B"],
    maker: "@ole_h",
    votes: 84,
    comments: 6,
  },
  {
    id: "12",
    rank: 12,
    name: "Codemap",
    tagline: "Navigate monorepos without losing your mind",
    description:
      "Codemap builds an interactive graph of packages, services, and dependencies in your monorepo. Jump to owners, trace imports, and onboard new engineers with a living map instead of a stale README diagram.",
    url: "codemap.dev",
    logo: "C",
    logoBg: "#6366f1",
    topics: ["Developer Tools", "Open Source"],
    maker: "@ravi_p",
    votes: 76,
    comments: 10,
  },
  {
    id: "13",
    rank: 13,
    name: "Briefly",
    tagline: "Founder-friendly meeting notes that sync everywhere",
    description:
      "Briefly joins your calls, drafts action items, and pushes summaries to Notion, Slack, and Linear. Tuned for two-person teams who can't afford another hour of note-taking after every customer call.",
    url: "briefly.ai",
    logo: "B",
    logoBg: "#be185d",
    topics: ["AI", "Productivity"],
    maker: "@emma_w",
    votes: 68,
    comments: 5,
  },
  {
    id: "14",
    rank: 14,
    name: "Launchpad",
    tagline: "One-page launch kit for Product Hunt day",
    description:
      "Launchpad bundles your hero copy, social assets, maker comment drafts, and first-hour checklist into a single workspace. Ship your launch with less scrambling and more time replying to early supporters.",
    url: "launchpad.so",
    logo: "L",
    logoBg: "#ca8a04",
    topics: ["Marketing", "No-code"],
    maker: "@jules_f",
    votes: 61,
    comments: 4,
  },
  {
    id: "15",
    rank: 15,
    name: "Threadly",
    tagline: "Schedule threads without the spreadsheet chaos",
    description:
      "Threadly helps solo founders plan, write, and queue X threads from one calm editor. Hook templates, best-time suggestions, and a simple approval flow so your content ship date isn't another late-night panic.",
    url: "threadly.app",
    logo: "T",
    logoBg: "#0284c7",
    topics: ["Social", "Creator Tools"],
    maker: "@milo_t",
    votes: 54,
    comments: 3,
  },
  {
    id: "16",
    rank: 16,
    name: "Flowstate",
    tagline: "Deep work sessions that actually stick",
    description:
      "Flowstate blocks distractions, tracks focus streaks, and syncs your best hours across devices. Built for indie makers who ship in sprints and need a ritual that keeps them in the zone.",
    url: "flowstate.app",
    logo: "F",
    logoBg: "#9333ea",
    topics: ["Productivity", "SaaS"],
    maker: "@alex_f",
    votes: 412,
    comments: 28,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductIdByName(name: string): string | undefined {
  return products.find((p) => p.name === name)?.id;
}

export const yearlyBattle = {
  year: 2026,
  phase: "voting" as const,
  votingOpensAt: "2026-01-01T00:00:00Z",
  votingEndsAt: "2026-12-31T23:59:59Z",
  contenders: [
    { id: "y1", name: "Scoutboard", monthLabel: "January", votes: 1842, comments: 124 },
    { id: "y2", name: "Nestform", monthLabel: "February", votes: 1765, comments: 98 },
    { id: "y3", name: "Driftnote", monthLabel: "March", votes: 1698, comments: 87 },
    { id: "y4", name: "Patchlane", monthLabel: "April", votes: 1588, comments: 76 },
    { id: "y5", name: "Ledgerly", monthLabel: "May", votes: 1521, comments: 71 },
    { id: "y6", name: "OrbitKit", monthLabel: "June", votes: 1464, comments: 68 },
    { id: "y7", name: "Warmline", monthLabel: "July", votes: 1392, comments: 62 },
    { id: "y8", name: "Formpath", monthLabel: "August", votes: 1318, comments: 58 },
    { id: "y9", name: "Pingboard", monthLabel: "September", votes: 1244, comments: 51 },
    { id: "y10", name: "Codemap", monthLabel: "October", votes: 1176, comments: 47 },
    { id: "y11", name: "Briefly", monthLabel: "November", votes: 1102, comments: 42 },
    { id: "y12", name: "Launchpad", monthLabel: "December", votes: 1038, comments: 39 },
  ],
};

export const monthlyBattle = {
  month: "June",
  year: 2026,
  phase: "voting" as const,
  weeklyWinnersCount: 5,
  votingOpensAt: "2026-06-01T00:00:00Z",
  votingEndsAt: "2026-06-28T23:59:59Z",
  contenders: [
    { id: "m1", name: "Flowstate", weekLabel: "Week 8 winner", votes: 412, comments: 28 },
    { id: "m2", name: "OrbitKit", weekLabel: "Week 11 winner", votes: 389, comments: 19 },
    { id: "m3", name: "Patchlane", weekLabel: "Week 10 winner", votes: 356, comments: 14 },
    { id: "m4", name: "Ledgerly", weekLabel: "Week 9 winner", votes: 331, comments: 11 },
    { id: "m5", name: "Warmline", weekLabel: "Week 7 winner", votes: 298, comments: 9 },
  ],
};

export const hallOfFameMonth = "June";

export const hallOfFameEntries = [
  "Flowstate",
  "Shipbox",
  "Relaypad",
  "Mintrow",
  "Stackline",
];

export const promotedSlots: PromotedSlot[] = [
  { spot: 1, price: 3, product: "OrbitKit", insertAfterOrganic: 0 },
  { spot: 2, price: 2, product: "Patchlane", insertAfterOrganic: 5 },
  { spot: 3, price: 1, product: "Warmline", insertAfterOrganic: 10 },
];
