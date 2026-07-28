/*
 * Page-local seed for "Self-paced or cohort?".
 *
 * Sales copy rather than contract data — the two columns and the eight
 * comparison rows are written for this page, not something a customer would
 * edit in the generated dashboard, so they stay out of the DataSource seam.
 * The prices are stated here as copy (the comp does the same); the course
 * records behind the two CTAs are still reached through the seam.
 */

import type { CourseMode } from "../types";

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

export const COMPARE_OPTIONS: CompareOption[] = [
  {
    k: "self",
    title: "Self-paced",
    icon: "infinity",
    price: "$95",
    priceSub: "from",
    blurb:
      "Everything opens the day you enrol. Finish in a fortnight or a year — nobody is counting.",
    cta: "Start self-paced",
    courseId: "TY-140",
  },
  {
    k: "cohort",
    title: "Cohort",
    icon: "users",
    price: "$180",
    priceSub: "8 weeks",
    blurb:
      "A start date, thirty classmates and a critique every Thursday. Harder to put off, which is rather the point.",
    cta: "Join cohort 04",
    courseId: "DS-101",
  },
];

export interface CompareRow {
  k: string;
  self: string;
  cohort: string;
}

export const COMPARE_ROWS: CompareRow[] = [
  { k: "Starts", self: "The minute you pay", cohort: "Mon 7 Sep 2026" },
  { k: "Pace", self: "Yours entirely", cohort: "~3 hours a week" },
  { k: "Feedback", self: "Q&A within a day", cohort: "Live critique + graded work" },
  { k: "Live sessions", self: "None", cohort: "8 · Thursdays 18:00 CET" },
  { k: "Assignments", self: "Optional, ungraded", cohort: "4, graded by Yara" },
  { k: "Classmates", self: "—", cohort: "30" },
  { k: "Certificate", self: "On completion", cohort: "On completion" },
  { k: "Best for", self: "Fitting study around a loud job", cohort: "Finishing the thing" },
];

/** A self-paced cell reading "—" or "None" is an absence, and is toned down. */
export function isAbsent(value: string): boolean {
  return value === "—" || value === "None";
}
