/*
 * Study streaks — page-local seed data.
 *
 * None of this is contract data (a customer would not edit a heat map in the
 * generated dashboard), so it lives beside the screen rather than behind the
 * `dataSource` seam. See src/data/source.ts for where the line is drawn.
 *
 * The heat map is generated rather than hand-written: 84 cells of plausible
 * study history, deterministic so the demo looks the same on every machine.
 *
 * Translation. The three totals and the four badges are interface and are
 * getters; the peers' names are not. `heatWeeks()` runs at render, so its 84
 * tooltips are translated in place — including the activity count, which is
 * the app's second real plural after the exam's attempt counter.
 */

import { number, t } from "../../i18n/ambient";
import { shortUnit } from "../format";
import { weekdayName } from "../../lib/schedule";

/** Days in the streak before today is logged. */
export const STREAK_BASE_DAYS = 42;

/*
 * The three totals, as numbers rather than the strings "51" / "68" / "21h".
 * The digits are the reader's — "٥١" — and the hour unit is CLDR's, not a
 * hand-typed English "h".
 */
const LONGEST_STREAK_DAYS = 51;
const ACTIVE_DAYS = 68;
const HOURS_ON_LESSONS = 21;

/** How busy a day was. 0 is "nothing"; 3 is the darkest cell. */
export type HeatLevel = 0 | 1 | 2 | 3;

export interface HeatDay {
  key: string;
  level: HeatLevel;
  /** Native tooltip — "Week 4 · Tue · 2 activities". */
  title: string;
}

export interface HeatWeek {
  i: number;
  days: HeatDay[];
}

export interface StreakBadge {
  title: string;
  sub: string;
  icon: string;
  earned: boolean;
}

export interface StreakPeer {
  name: string;
  initials: string;
  days: number;
}

/** The three figures beside the live streak count. */
export const STREAK_TOTALS: { value: string; label: string }[] = [
  {
    get value() {
      return number(LONGEST_STREAK_DAYS);
    },
    get label() {
      return t("data.streaks.total.longest");
    },
  },
  {
    get value() {
      return number(ACTIVE_DAYS);
    },
    get label() {
      return t("data.streaks.total.activeDays");
    },
  },
  {
    /* CLDR's own narrow hour unit — "21h", "21 Std.", "٢١ س". */
    get value() {
      return shortUnit(HOURS_ON_LESSONS, "hour");
    },
    get label() {
      return t("data.streaks.total.timeOnLessons");
    },
  },
];

export const STREAK_BADGES: StreakBadge[] = [
  {
    get title() {
      return t("data.streaks.badge.twoWeeks");
    },
    get sub() {
      return t("data.streaks.badge.noGap", { count: number(14) }, 14);
    },
    icon: "flame",
    earned: true,
  },
  {
    get title() {
      return t("data.streaks.badge.month");
    },
    get sub() {
      return t("data.streaks.badge.noGap", { count: number(30) }, 30);
    },
    icon: "medal",
    earned: true,
  },
  {
    get title() {
      return t("data.streaks.badge.everyThursday");
    },
    get sub() {
      return t("data.streaks.badge.everyThursdaySub", {
        no: number(3, { minimumIntegerDigits: 2, useGrouping: false }),
      });
    },
    icon: "radio",
    earned: true,
  },
  {
    get title() {
      return t("data.streaks.badge.fiftyDays");
    },
    get sub() {
      return t("data.streaks.badge.toGo", { count: number(8) }, 8);
    },
    icon: "trophy",
    earned: false,
  },
];

/** The rest of the cohort. The signed-in student is spliced in by the screen. */
export const STREAK_PEERS: StreakPeer[] = [
  { name: "Freya Nilsen", initials: "FN", days: 63 },
  { name: "Chidera Obi", initials: "CO", days: 48 },
  { name: "Adaeze Nwosu", initials: "AN", days: 37 },
  { name: "Yuki Tanaka", initials: "YT", days: 29 },
];

/**
 * Twelve weeks of activity, oldest first.
 *
 * The first three weeks are patchy weekday-only study; from week four the
 * habit sticks. The current week stops at today, so Friday only lights up
 * once the day is logged.
 */
export function heatWeeks(loggedToday: boolean): HeatWeek[] {
  const weeks: HeatWeek[] = [];

  for (let w = 0; w < 12; w++) {
    const days: HeatDay[] = [];

    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      let level: HeatLevel;

      if (w < 3) level = d === 0 || d === 6 ? 0 : idx % 5 === 0 ? 1 : 2;
      else if (d === 0) level = 1;
      else if (d === 6) level = w % 2 ? 0 : 1;
      else level = idx % 4 === 0 ? 3 : 2;

      /* This week has not happened yet past Friday. */
      if (w === 11 && d > 4) level = d === 5 && loggedToday ? 3 : 0;

      days.push({
        key: `d${idx}`,
        level,
        /* The comp read "1 activities" here — pluralised, in every language. */
        title: t("data.streaks.cell", {
          week: number(w + 1),
          day: weekdayName(d),
          activity:
            level === 0
              ? t("data.streaks.nothing")
              : t("data.streaks.activities", { count: number(level) }, level),
        }),
      });
    }

    weeks.push({ i: w, days });
  }

  return weeks;
}
