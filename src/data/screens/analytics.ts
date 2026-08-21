/*
 * Instructor analytics — page-local seed.
 *
 * None of this is contract data: there is no events table behind the seam and
 * a customer would not edit a drop-off figure in a dashboard. It is the shape
 * of a teaching week, written down so the screen has something honest to draw.
 *
 * Every label here is a getter, because a dashboard's axis ticks and KPI
 * captions are interface, not fiction. The lesson titles they sit next to are
 * fiction and stay English. See `../format` for why a getter and not a const.
 */

import { number, t } from "../../i18n/ambient";
import { clock, ratio } from "../format";

/** How many weeks the "4 weeks" range shows. */
export const SHORT_RANGE_WEEKS = 4;

/*
 * The KPI figures, as NUMBERS.
 *
 * They used to be written out as "71%", "11:48", "26 / 30" and "4.8" — en-US
 * rendering baked into the seed, which an Arabic reader got verbatim in Latin
 * digits and a German reader got with the wrong decimal mark. Held as numbers
 * and formatted in the getters below, they follow the reader like every other
 * figure on the page.
 */
const COMPLETION_RATE = 0.71;
const WATCH_HOURS = 11;
const WATCH_MINUTES = 48;
const ACTIVE_STUDENTS = 26;
const COHORT_SEATS = 30;
const RECOMMEND_SCORE = 4.8;

/** The three windows the range control offers. */
export interface RangeOption {
  id: string;
  label: string;
}

export const RANGES: RangeOption[] = [
  {
    id: "4w",
    get label() {
      return t(
        "data.analytics.range.weeks",
        { count: number(SHORT_RANGE_WEEKS) },
        SHORT_RANGE_WEEKS,
      );
    },
  },
  {
    id: "8w",
    get label() {
      return t("data.analytics.range.cohort");
    },
  },
  {
    id: "all",
    get label() {
      return t("data.analytics.range.all");
    },
  },
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
  {
    get label() {
      return t("data.analytics.kpi.completion");
    },
    get value() {
      return number(COMPLETION_RATE, { style: "percent" });
    },
    icon: "target",
    get delta() {
      return t("data.analytics.kpi.completionDelta");
    },
    trend: "up",
  },
  {
    get label() {
      return t("data.analytics.kpi.watchTime");
    },
    get value() {
      return clock(WATCH_HOURS, WATCH_MINUTES);
    },
    icon: "clock",
    get delta() {
      return t("data.analytics.kpi.watchTimeDelta");
    },
    trend: "flat",
  },
  {
    get label() {
      return t("data.analytics.kpi.weeklyActive");
    },
    get value() {
      return ratio(ACTIVE_STUDENTS, COHORT_SEATS);
    },
    icon: "activity",
    get delta() {
      return t("data.analytics.kpi.weeklyActiveDelta");
    },
    trend: "down",
  },
  {
    get label() {
      return t("data.analytics.kpi.recommend");
    },
    get value() {
      return number(RECOMMEND_SCORE, { minimumFractionDigits: 1 });
    },
    icon: "star",
    get delta() {
      return t("data.analytics.kpi.recommendDelta");
    },
    trend: "up",
  },
];

export interface Bar {
  label: string;
  /** Lessons watched. Zero means the week has not happened yet. */
  n: number;
}

/** A "W3"-shaped axis tick. The letter abbreviates a word, so it moves. */
function weekTick(n: number): string {
  return t("data.analytics.weekTick", { n: number(n) });
}

/** Cohort 03, week by week. The tail is unwritten, not empty. */
export const WEEK_SERIES: Bar[] = [
  {
    get label() {
      return weekTick(1);
    },
    n: 148,
  },
  {
    get label() {
      return weekTick(2);
    },
    n: 132,
  },
  {
    get label() {
      return weekTick(3);
    },
    n: 97,
  },
  {
    get label() {
      return weekTick(4);
    },
    n: 0,
  },
  {
    get label() {
      return weekTick(5);
    },
    n: 0,
  },
  {
    get label() {
      return weekTick(6);
    },
    n: 0,
  },
  {
    get label() {
      return weekTick(7);
    },
    n: 0,
  },
  {
    get label() {
      return weekTick(8);
    },
    n: 0,
  },
];

/** Every cohort so far, with the one running now on the end. */
export const ALL_SERIES: Bar[] = [
  {
    get label() {
      return t("data.analytics.cohortTick", { n: number(1) });
    },
    n: 186,
  },
  {
    get label() {
      return t("data.analytics.cohortTick", { n: number(2) });
    },
    n: 204,
  },
  {
    get label() {
      return t("data.analytics.cohortTick", { n: number(3) });
    },
    n: 377,
  },
  {
    get label() {
      return t("data.analytics.now");
    },
    n: 97,
  },
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
  {
    get label() {
      return t("data.analytics.source.wordOfMouth");
    },
    pct: 44,
  },
  {
    /* "Yara" is the school's founder — a name, so only the noun moves. */
    get label() {
      return t("data.analytics.source.newsletter");
    },
    pct: 28,
  },
  {
    get label() {
      return t("data.analytics.source.search");
    },
    pct: 17,
  },
  {
    get label() {
      return t("data.analytics.source.partners");
    },
    pct: 11,
  },
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

/** "Module 03" — the number is data, the word in front of it is not. */
function moduleLabel(n: number): string {
  return t("data.analytics.module", {
    n: number(n, { minimumIntegerDigits: 2, useGrouping: false }),
  });
}

/** Sorted by drop-off, worst first — the only order worth reading. */
export const LESSON_STATS: LessonStat[] = [
  {
    title: "Grids and rhythm",
    get mod() {
      return moduleLabel(3);
    },
    views: 27,
    done: 19,
    watch: "14:02",
    drop: 38,
  },
  {
    title: "Dark mode without a rewrite",
    get mod() {
      return moduleLabel(2);
    },
    views: 29,
    done: 22,
    watch: "12:50",
    drop: 24,
  },
  {
    title: "Token layers",
    get mod() {
      return moduleLabel(2);
    },
    views: 30,
    done: 26,
    watch: "11:40",
    drop: 13,
  },
  {
    title: "A type scale you can defend",
    get mod() {
      return moduleLabel(3);
    },
    views: 28,
    done: 25,
    watch: "10:55",
    drop: 11,
  },
  {
    title: "Inventory your UI",
    get mod() {
      return moduleLabel(1);
    },
    views: 30,
    done: 28,
    watch: "11:20",
    drop: 7,
  },
  {
    title: "Why systems win",
    get mod() {
      return moduleLabel(1);
    },
    views: 30,
    done: 30,
    watch: "08:04",
    drop: 0,
  },
];

/** Where a drop-off stops being normal and starts being a problem. */
export const DROP_BAD = 30;
export const DROP_MID = 15;

/**
 * The written read on the numbers above.
 *
 * A bare module-level string cannot be a getter, so this stays English here;
 * the translation is filed under `data.analytics.insight` for the screen.
 */
export const INSIGHT =
  "Grids and rhythm loses 38% of viewers around the eleven-minute mark — right where the twelve-column demo starts. Worth splitting into two shorter lessons before cohort 04.";
