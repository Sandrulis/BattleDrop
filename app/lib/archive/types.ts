export type WeekStatus = "completed" | "active" | "upcoming";

export type ArchiveProject = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  logo: string;
  logoBg: string;
  maker: string;
  votes: number;
  comments: number;
  isPromoted?: boolean;
};

export type WeekArchiveEntry = {
  week: number;
  status: WeekStatus;
  topProducts: ArchiveProject[];
};

export type ArchiveMonthGroup = {
  monthIndex: number;
  monthLabel: string;
  weeks: WeekArchiveEntry[];
};
