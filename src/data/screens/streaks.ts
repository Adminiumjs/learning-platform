/*
 * Study streaks — page-local seed data.
 *
 * None of this is contract data (a customer would not edit a heat map in the
 * generated dashboard), so it lives beside the screen rather than behind the
 * `dataSource` seam. See src/data/source.ts for where the line is drawn.
 *
 * The heat map is generated rather than hand-written: 84 cells of plausible
 * study history, deterministic so the demo looks the same on every machine.
 */

import { DAYS } from "../../lib/schedule";

/** Days in the streak before today is logged. */
export const STREAK_BASE_DAYS = 42;

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
  { value: "51", label: "Longest streak" },
  { value: "68", label: "Active days" },
  { value: "21h", label: "Time on lessons" },
];

export const STREAK_BADGES: StreakBadge[] = [
  { title: "Two weeks straight", sub: "14 days without a gap", icon: "flame", earned: true },
  { title: "A month of it", sub: "30 days without a gap", icon: "medal", earned: true },
  {
    title: "Never missed a Thursday",
    sub: "Every live session, cohort 03",
    icon: "radio",
    earned: true,
  },
  { title: "Fifty days", sub: "8 days to go", icon: "trophy", earned: false },
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
        /* The comp read "1 activities" here — pluralised. */
        title: `Week ${w + 1} · ${DAYS[d]} · ${
          level === 0 ? "nothing" : level === 1 ? "1 activity" : `${level} activities`
        }`,
      });
    }

    weeks.push({ i: w, days });
  }

  return weeks;
}
