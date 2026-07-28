/*
 * Payouts — page-local seed.
 *
 * Money is in-fiction here: there is no billing table behind the `dataSource`
 * seam and nothing on this screen moves a cent. The figures are written once,
 * in one place, so the headline, the history and the per-course split stay in
 * step with each other.
 */

import { fmtDateLong } from "../../lib/schedule";

/** The headline figure, and what "Pay out now" would send. */
export const AVAILABLE = "$2,840.00";

/** Payouts land on the first of the month, outside the demo clock's window. */
export const NEXT_PAYOUT = fmtDateLong(new Date(2026, 7, 1));

export interface PayoutStat {
  value: string;
  label: string;
  /** The line under the figure — a comparison, a date, or a caveat. */
  delta: string;
  /**
   * Whether the delta is good news, which tints it.
   *
   * The comp had three states here but wrote the same `--fg-subtle` for both
   * "down" and "neutral", so its `up: false` branch was dead. Two states is
   * what it actually drew.
   */
  positive?: boolean;
}

export const STATS: PayoutStat[] = [
  { value: "$5,400", label: "This month", delta: "+18% on July", positive: true },
  { value: "$41,290", label: "Lifetime", delta: "Since Feb 2024" },
  { value: "$126", label: "Per student", delta: "Average, all courses" },
  { value: "12%", label: "School fee", delta: "Taken before payout" },
];

export type PayoutStatus = "Paid" | "Refunded";

export interface PayoutRow {
  date: string;
  method: string;
  amount: string;
  status: PayoutStatus;
}

/** Newest first, which is the only order a ledger is ever read in. */
export const HISTORY: PayoutRow[] = [
  { date: "01 Jul 2026", method: "SEPA ···· 4471", amount: "$4,210.00", status: "Paid" },
  { date: "01 Jun 2026", method: "SEPA ···· 4471", amount: "$3,880.00", status: "Paid" },
  { date: "01 May 2026", method: "SEPA ···· 4471", amount: "$5,140.00", status: "Paid" },
  { date: "01 Apr 2026", method: "SEPA ···· 4471", amount: "$2,960.00", status: "Paid" },
  { date: "12 Mar 2026", method: "SEPA ···· 4471", amount: "$340.00", status: "Refunded" },
];

export interface CourseEarning {
  title: string;
  amount: string;
  /** Bar length, 0–100 — a share of the best-selling course, not of revenue. */
  pct: number;
  sub: string;
}

export const COURSE_EARNINGS: CourseEarning[] = [
  {
    title: "Design Systems from Scratch",
    amount: "$3,240",
    pct: 72,
    sub: "18 enrolments this month",
  },
  { title: "Type & Layout Fundamentals", amount: "$1,235", pct: 27, sub: "13 enrolments" },
  { title: "Motion for Interfaces", amount: "$720", pct: 16, sub: "6 enrolments" },
  { title: "Portfolio Studio", amount: "$205", pct: 5, sub: "Cohort opens in September" },
];

/** Where the money goes. Fixed in the demo — there is nothing to change it to. */
export const METHOD = { label: "Bank transfer", detail: "SEPA ···· 4471" } as const;
