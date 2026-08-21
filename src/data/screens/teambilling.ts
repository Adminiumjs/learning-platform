/*
 * Organisation billing — page-local seed data.
 *
 * The invoice history, the spend split and the billing details all belong to
 * the paying studio rather than to Yara's catalogue, so none of it sits behind
 * the `dataSource` seam. The two older invoices are cheaper because the studio
 * was on four seats before it bought the fifth — the history has to make sense
 * next to the plan card.
 *
 * Translation. The detail rows' captions are interface. Their values are not:
 * "Visa ···· 4242" is a card scheme and a mask, a VAT number is a number, and
 * the address is an address. Amounts and dates go through `Intl`; the invoice
 * `status` stays an English token with `data.invoiceStatus.*` as its label.
 */

import { money, t } from "../../i18n/ambient";
import { fmtDateLong } from "../../lib/schedule";

export interface Invoice {
  no: string;
  date: string;
  amount: string;
  status: string;
}

export const TEAM_INVOICES: Invoice[] = [
  {
    no: "INV-2026-07",
    get date() {
      return fmtDateLong(new Date(2026, 6, 1));
    },
    get amount() {
      return money(270);
    },
    status: "Paid",
  },
  {
    no: "INV-2026-06",
    get date() {
      return fmtDateLong(new Date(2026, 5, 1));
    },
    get amount() {
      return money(270);
    },
    status: "Paid",
  },
  {
    no: "INV-2026-05",
    get date() {
      return fmtDateLong(new Date(2026, 4, 1));
    },
    get amount() {
      return money(216);
    },
    status: "Paid",
  },
  {
    no: "INV-2026-04",
    get date() {
      return fmtDateLong(new Date(2026, 3, 1));
    },
    get amount() {
      return money(216);
    },
    status: "Paid",
  },
];

export interface SpendLine {
  label: string;
  value: string;
  /** Share of the total, as a percentage of the bar. */
  pct: number;
}

/** The labels are course titles, which are demo fiction and stay English. */
export const TEAM_SPEND: SpendLine[] = [
  {
    label: "Design Systems from Scratch",
    get value() {
      return money(540);
    },
    pct: 68,
  },
  {
    label: "Type & Layout Fundamentals",
    get value() {
      return money(190);
    },
    pct: 24,
  },
  {
    label: "Motion for Interfaces",
    get value() {
      return money(120);
    },
    pct: 15,
  },
];

export interface BillingDetail {
  icon: string;
  k: string;
  v: string;
  /** Card numbers and VAT numbers read as data, so they set in the mono face. */
  mono?: boolean;
}

export const TEAM_DETAILS: BillingDetail[] = [
  {
    icon: "landmark",
    get k() {
      return t("data.teambilling.paymentMethod");
    },
    v: "Visa ···· 4242",
    mono: true,
  },
  {
    icon: "user-round",
    get k() {
      return t("data.teambilling.contact");
    },
    v: "rosa@marchetti.studio",
  },
  {
    icon: "building-2",
    get k() {
      return t("data.teambilling.vat");
    },
    v: "IT 04412 9930 21",
    mono: true,
  },
  {
    icon: "map-pin",
    get k() {
      return t("data.teambilling.address");
    },
    v: "Via Zamboni 12, Bologna",
  },
];

/** What one seat costs the organisation each month. */
export const SEAT_MONTHLY = 54;
