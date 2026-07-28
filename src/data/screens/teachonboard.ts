/*
 * Instructor onboarding — page-local seed copy.
 *
 * The six setup steps, the payout facts and the house rules. All of it is the
 * marketplace talking to a new instructor, so it belongs to this screen and
 * not to the `dataSource` seam.
 */

import type { ViewId } from "../types";

export interface OnboardStep {
  /** Key into the store's `ioDone` map. */
  k: string;
  title: string;
  body: string;
  cta: string;
  /** Where the CTA sends them to actually do the thing. */
  go: ViewId;
  /** Mono status chip under the body, where the step has one. */
  meta?: string;
}

export const ONBOARD_STEPS: OnboardStep[] = [
  {
    k: "profile",
    title: "Write your teaching bio",
    body: "Two or three sentences. What you have shipped, and what you are opinionated about.",
    cta: "Write it",
    go: "profile",
    meta: "Shown on every course page",
  },
  {
    k: "course",
    title: "Set up your first course",
    body: "Title, summary, level and a cover. You can change all of it later.",
    cta: "Course settings",
    go: "editor",
    meta: "PF-310 · draft",
  },
  {
    k: "lessons",
    title: "Add at least three lessons",
    body: "Enough for students to judge the shape of it. Upload as you go.",
    cta: "Add lessons",
    go: "content",
    meta: "4 of 12 lessons drafted",
  },
  {
    k: "cohort",
    title: "Choose your dates",
    body: "Pick a start date and a weekly session slot you can actually keep.",
    cta: "Cohort setup",
    go: "cohort",
    meta: "Cohort 04 · draft",
  },
  {
    k: "payouts",
    title: "Add your payout details",
    body: "A bank account and a tax number. We pay on the first of the month.",
    cta: "Payouts",
    go: "payouts",
  },
  {
    k: "review",
    title: "Send it for review",
    body: "Nadia reads every new course before it goes live. Usually two working days.",
    cta: "Review notes",
    go: "teach",
  },
];

export interface PayRow {
  icon: string;
  label: string;
  value: string;
  /** Renders the value in the mono face — the one that is a figure. */
  mono?: boolean;
}

export const ONBOARD_PAY: PayRow[] = [
  { icon: "percent", label: "Your share", value: "88% of every enrolment" },
  { icon: "calendar", label: "Paid", value: "1st of the month" },
  { icon: "banknote", label: "Minimum payout", value: "$50", mono: true },
];

/** The four promises an instructor makes by teaching here. */
export const ONBOARD_RULES: string[] = [
  "Answer questions within two working days. If you cannot, tell the cohort why.",
  "Record the live session or write up what was said. Nobody should lose a week to a sick child.",
  "Grade within a week of the deadline, with words as well as a number.",
  "No upsells inside a lesson. They paid already.",
];
