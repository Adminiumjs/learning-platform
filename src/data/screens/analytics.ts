/*
 * Instructor analytics — page-local seed.
 *
 * None of this is contract data: there is no events table behind the seam and
 * a customer would not edit a drop-off figure in a dashboard. It is the shape
 * of a teaching week, written down so the screen has something honest to draw.
 */

/** The three windows the range control offers. */
export interface RangeOption {
  id: string;
  label: string;
}

export const RANGES: RangeOption[] = [
  { id: "4w", label: "4 weeks" },
  { id: "8w", label: "This cohort" },
  { id: "all", label: "All time" },
];

export type Trend = "up" | "down" | "flat";

export interface Kpi {
  label: string;
  value: string;
  icon: string;
  delta: string;
  trend: Trend;
}

export const KPIS: Kpi[] = [
  { label: "Completion rate", value: "71%", icon: "target", delta: "+6 pts on cohort 02", trend: "up" },
  { label: "Average watch time", value: "11:48", icon: "clock", delta: "82% of lesson length", trend: "flat" },
  { label: "Weekly active", value: "26 / 30", icon: "activity", delta: "4 quiet for a week", trend: "down" },
  { label: "Would recommend", value: "4.8", icon: "star", delta: "From 41 reviews", trend: "up" },
];

export interface Bar {
  label: string;
  /** Lessons watched. Zero means the week has not happened yet. */
  n: number;
}

/** Cohort 03, week by week. The tail is unwritten, not empty. */
export const WEEK_SERIES: Bar[] = [
  { label: "W1", n: 148 },
  { label: "W2", n: 132 },
  { label: "W3", n: 97 },
  { label: "W4", n: 0 },
  { label: "W5", n: 0 },
  { label: "W6", n: 0 },
  { label: "W7", n: 0 },
  { label: "W8", n: 0 },
];

/** How many weeks the "4 weeks" range shows. */
export const SHORT_RANGE_WEEKS = 4;

/** Every cohort so far, with the one running now on the end. */
export const ALL_SERIES: Bar[] = [
  { label: "C1", n: 186 },
  { label: "C2", n: 204 },
  { label: "C3", n: 377 },
  { label: "Now", n: 97 },
];

/** Column geometry in px: the tallest bar, its floor, and a future week's stub. */
export const BAR_MAX_PX = 128;
export const BAR_MIN_PX = 10;
export const BAR_FLAT_PX = 6;

export interface Source {
  label: string;
  /** Share of enrolments, in percent. */
  pct: number;
}

export const SOURCES: Source[] = [
  { label: "Word of mouth", pct: 44 },
  { label: "Yara’s newsletter", pct: 28 },
  { label: "Search", pct: 17 },
  { label: "Partner schools", pct: 11 },
];

export interface LessonStat {
  title: string;
  mod: string;
  views: number;
  done: number;
  /** Average watch time, "mm:ss". */
  watch: string;
  /** Percent of viewers who left before the end. */
  drop: number;
}

/** Sorted by drop-off, worst first — the only order worth reading. */
export const LESSON_STATS: LessonStat[] = [
  { title: "Grids and rhythm", mod: "Module 03", views: 27, done: 19, watch: "14:02", drop: 38 },
  { title: "Dark mode without a rewrite", mod: "Module 02", views: 29, done: 22, watch: "12:50", drop: 24 },
  { title: "Token layers", mod: "Module 02", views: 30, done: 26, watch: "11:40", drop: 13 },
  { title: "A type scale you can defend", mod: "Module 03", views: 28, done: 25, watch: "10:55", drop: 11 },
  { title: "Inventory your UI", mod: "Module 01", views: 30, done: 28, watch: "11:20", drop: 7 },
  { title: "Why systems win", mod: "Module 01", views: 30, done: 30, watch: "08:04", drop: 0 },
];

/** Where a drop-off stops being normal and starts being a problem. */
export const DROP_BAD = 30;
export const DROP_MID = 15;

export const INSIGHT =
  "Grids and rhythm loses 38% of viewers around the eleven-minute mark — right where the twelve-column demo starts. Worth splitting into two shorter lessons before cohort 04.";
