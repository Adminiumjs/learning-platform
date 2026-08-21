/*
 * Page-local seed for "Self-paced or cohort?".
 *
 * Sales copy rather than contract data — the two columns and the eight
 * comparison rows are written for this page, not something a customer would
 * edit in the generated dashboard, so they stay out of the DataSource seam.
 * The prices are stated here as copy (the comp does the same); the course
 * records behind the two CTAs are still reached through the seam.
 *
 * Translation. The table is a specification, so every cell in it is interface
 * and moves with the locale — including "None" and "—", which is why
 * `isAbsent` no longer compares against the English words but against the
 * messages themselves. The two blurbs are the course selling itself and stay
 * English with the rest of the fiction. Prices go through `Intl` rather than
 * carrying a hard-coded "$".
 */

import { money, number, t } from "../../i18n/ambient";
import {
  fmtDateLong,
  fmtTime,
  fmtWeekdayLong,
  liveDate,
} from "../../lib/schedule";
import type { CourseMode } from "../types";

/** When cohort 04 starts. Fixed: it must stay ahead of the demo clock. */
const COHORT_4_STARTS = new Date(2026, 8, 7);

/** Week 1's live session, as a real instant `Intl` can name and time. */
const LIVE_AT = liveDate(1, 3, 18);

export interface CompareOption {
  /** Doubles as the picked key and the course mode the choice switches to. */
  k: CourseMode;
  title: string;
  icon: string;
  price: string;
  priceSub: string;
  blurb: string;
  cta: string;
  /** The course the CTA opens. */
  courseId: string;
}

/** The cohort runs eight weeks — the number under its price. */
const COHORT_WEEKS = 8;

export const COMPARE_OPTIONS: CompareOption[] = [
  {
    k: "self",
    get title() {
      return t("data.compare.selfPaced");
    },
    icon: "infinity",
    get price() {
      return money(95);
    },
    get priceSub() {
      return t("data.compare.from");
    },
    blurb:
      "Everything opens the day you enrol. Finish in a fortnight or a year — nobody is counting.",
    get cta() {
      return t("data.compare.startSelfPaced");
    },
    courseId: "TY-140",
  },
  {
    k: "cohort",
    get title() {
      return t("data.compare.cohort");
    },
    icon: "users",
    get price() {
      return money(180);
    },
    get priceSub() {
      return t(
        "data.compare.weeks",
        { count: number(COHORT_WEEKS) },
        COHORT_WEEKS,
      );
    },
    blurb:
      "A start date, thirty classmates and a critique every Thursday. Harder to put off, which is rather the point.",
    get cta() {
      return t("data.compare.joinCohort");
    },
    courseId: "DS-101",
  },
];

export interface CompareRow {
  k: string;
  self: string;
  cohort: string;
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    get k() {
      return t("data.compare.row.starts");
    },
    get self() {
      return t("data.compare.starts.self");
    },
    get cohort() {
      return fmtDateLong(COHORT_4_STARTS);
    },
  },
  {
    get k() {
      return t("data.compare.row.pace");
    },
    get self() {
      return t("data.compare.pace.self");
    },
    get cohort() {
      return t("data.compare.pace.cohort");
    },
  },
  {
    get k() {
      return t("data.compare.row.feedback");
    },
    get self() {
      return t("data.compare.feedback.self");
    },
    get cohort() {
      return t("data.compare.feedback.cohort");
    },
  },
  {
    get k() {
      return t("data.compare.row.live");
    },
    get self() {
      return t("data.compare.none");
    },
    get cohort() {
      return t("data.compare.live.cohort", {
        count: number(COHORT_WEEKS),
        day: fmtWeekdayLong(LIVE_AT),
        time: fmtTime(LIVE_AT),
        tz: "CET",
      });
    },
  },
  {
    get k() {
      return t("data.compare.row.assignments");
    },
    get self() {
      return t("data.compare.assignments.self");
    },
    get cohort() {
      return t("data.compare.assignments.cohort");
    },
  },
  {
    get k() {
      return t("data.compare.row.classmates");
    },
    get self() {
      return t("data.compare.dash");
    },
    cohort: "30",
  },
  {
    get k() {
      return t("data.compare.row.certificate");
    },
    get self() {
      return t("data.compare.onCompletion");
    },
    get cohort() {
      return t("data.compare.onCompletion");
    },
  },
  {
    get k() {
      return t("data.compare.row.bestFor");
    },
    get self() {
      return t("data.compare.bestFor.self");
    },
    get cohort() {
      return t("data.compare.bestFor.cohort");
    },
  },
];

/**
 * A self-paced cell reading "—" or "None" is an absence, and is toned down.
 *
 * Compared against the messages rather than the English words: once the table
 * is translated, "None" is "Keine" and a literal comparison would quietly stop
 * greying the cell.
 */
export function isAbsent(value: string): boolean {
  return value === t("data.compare.dash") || value === t("data.compare.none");
}
