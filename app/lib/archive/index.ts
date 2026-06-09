export { ARCHIVE_ACTIVE_WEEK_ELEMENT_ID, WEEKS_IN_ARCHIVE_YEAR } from "./constants";
export { fetchYearProjectsGroupedByWeek } from "./fetch-year-projects";
export { getArchiveYearData, getAvailableArchiveYears } from "./get-archive-year-data";
export { getTopArchiveProducts } from "./get-top-archive-products";
export { groupWeeksByMonth } from "./group-weeks-by-month";
export { mapProductToArchiveProject } from "./map-product-to-archive-project";
export {
  getArchiveWeekTiming,
  resolveArchiveWeekStatus,
} from "./resolve-archive-week-status";
export type {
  ArchiveMonthGroup,
  ArchiveProject,
  WeekArchiveEntry,
  WeekStatus,
} from "./types";

/** @deprecated Use ArchiveProject */
export type ArchiveWinnerProduct = import("./types").ArchiveProject;
