/*
 * Payouts — page-local seed.
 *
 * Money is in-fiction here: there is no billing table behind the `dataSource`
 * seam and nothing on this screen moves a cent. The figures are written once,
 * in one place, so the headline, the history and the per-course split stay in
 * step with each other.
 *
 * Translation. The captions, the deltas and the payment-method name are
 * interface and are getters. The amounts now go through `Intl` instead of
 * carrying a hard-coded "$2,840.00", so a German reader sees "2.840,00 $" and
 * an Egyptian one Arabic-Indic digits. "SEPA" and the masked account number
 * are not translated — SEPA is a scheme, not a word. `PayoutStatus` stays as
 * the English token it has always been, because it is the row's state id; its
 * reader-facing names are `data.payoutStatus.*`.
 */

import { money, number, t } from "../../i18n/ambient";
import { fmtDateLong } from "../../lib/schedule";

/** The headline figure, and what "Pay out now" would send. */
export const AVAILABLE_AMOUNT = 2840;

/**
 * A module-level `const` cannot be a getter, so this is formatted once at
 * load. The screen should prefer `money(AVAILABLE_AMOUNT)`.
 */
export const AVAILABLE = money(AVAILABLE_AMOUNT);

/** Payouts land on the first of the month, outside the demo clock's window. */
export const NEXT_PAYOUT_ON = new Date(2026, 7, 1);
export const NEXT_PAYOUT = fmtDateLong(NEXT_PAYOUT_ON);

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
  {
    get value() {
      return money(5400);
    },
    get label() {
      return t("data.payouts.stat.thisMonth");
    },
    get delta() {
      return t("data.payouts.stat.thisMonthDelta", { pct: number(18) });
    },
    positive: true,
  },
  {
    get value() {
      return money(41290);
    },
    get label() {
      return t("data.payouts.stat.lifetime");
    },
    get delta() {
      return t("data.payouts.stat.lifetimeDelta");
    },
  },
  {
    get value() {
      return money(126);
    },
    get label() {
      return t("data.payouts.stat.perStudent");
    },
    get delta() {
      return t("data.payouts.stat.perStudentDelta");
    },
  },
  {
    get value() {
      return t("data.payouts.stat.feePct", { pct: number(12) });
    },
    get label() {
      return t("data.payouts.stat.schoolFee");
    },
    get delta() {
      return t("data.payouts.stat.schoolFeeDelta");
    },
  },
];

export type PayoutStatus = "Paid" | "Refunded";

export interface PayoutRow {
  date: string;
  method: string;
  amount: string;
  status: PayoutStatus;
}

/** The masked account every payout went to. A scheme name plus digits. */
const SEPA = "SEPA ···· 4471";

/** Newest first, which is the only order a ledger is ever read in. */
export const HISTORY: PayoutRow[] = [
  {
    get date() {
      return fmtDateLong(new Date(2026, 6, 1));
    },
    method: SEPA,
    get amount() {
      return money(4210);
    },
    status: "Paid",
  },
  {
    get date() {
      return fmtDateLong(new Date(2026, 5, 1));
    },
    method: SEPA,
    get amount() {
      return money(3880);
    },
    status: "Paid",
  },
  {
    get date() {
      return fmtDateLong(new Date(2026, 4, 1));
    },
    method: SEPA,
    get amount() {
      return money(5140);
    },
    status: "Paid",
  },
  {
    get date() {
      return fmtDateLong(new Date(2026, 3, 1));
    },
    method: SEPA,
    get amount() {
      return money(2960);
    },
    status: "Paid",
  },
  {
    get date() {
      return fmtDateLong(new Date(2026, 2, 12));
    },
    method: SEPA,
    get amount() {
      return money(340);
    },
    status: "Refunded",
  },
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
    get amount() {
      return money(3240);
    },
    pct: 72,
    get sub() {
      return t("data.payouts.enrolmentsThisMonth", { count: number(18) }, 18);
    },
  },
  {
    title: "Type & Layout Fundamentals",
    get amount() {
      return money(1235);
    },
    pct: 27,
    get sub() {
      return t("data.payouts.enrolments", { count: number(13) }, 13);
    },
  },
  {
    title: "Motion for Interfaces",
    get amount() {
      return money(720);
    },
    pct: 16,
    get sub() {
      return t("data.payouts.enrolments", { count: number(6) }, 6);
    },
  },
  {
    title: "Portfolio Studio",
    get amount() {
      return money(205);
    },
    pct: 5,
    get sub() {
      return t("data.payouts.cohortOpens");
    },
  },
];

/** Where the money goes. Fixed in the demo — there is nothing to change it to. */
export const METHOD = {
  get label() {
    return t("data.payouts.bankTransfer");
  },
  detail: SEPA,
};
