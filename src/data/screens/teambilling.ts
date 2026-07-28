/*
 * Organisation billing — page-local seed data.
 *
 * The invoice history, the spend split and the billing details all belong to
 * the paying studio rather than to Yara's catalogue, so none of it sits behind
 * the `dataSource` seam. The two older invoices are cheaper because the studio
 * was on four seats before it bought the fifth — the history has to make sense
 * next to the plan card.
 */

export interface Invoice {
  no: string;
  date: string;
  amount: string;
  status: string;
}

export const TEAM_INVOICES: Invoice[] = [
  { no: "INV-2026-07", date: "1 Jul 2026", amount: "$270.00", status: "Paid" },
  { no: "INV-2026-06", date: "1 Jun 2026", amount: "$270.00", status: "Paid" },
  { no: "INV-2026-05", date: "1 May 2026", amount: "$216.00", status: "Paid" },
  { no: "INV-2026-04", date: "1 Apr 2026", amount: "$216.00", status: "Paid" },
];

export interface SpendLine {
  label: string;
  value: string;
  /** Share of the total, as a percentage of the bar. */
  pct: number;
}

export const TEAM_SPEND: SpendLine[] = [
  { label: "Design Systems from Scratch", value: "$540", pct: 68 },
  { label: "Type & Layout Fundamentals", value: "$190", pct: 24 },
  { label: "Motion for Interfaces", value: "$120", pct: 15 },
];

export interface BillingDetail {
  icon: string;
  k: string;
  v: string;
  /** Card numbers and VAT numbers read as data, so they set in the mono face. */
  mono?: boolean;
}

export const TEAM_DETAILS: BillingDetail[] = [
  { icon: "landmark", k: "Payment method", v: "Visa ···· 4242", mono: true },
  { icon: "user-round", k: "Billing contact", v: "rosa@marchetti.studio" },
  { icon: "building-2", k: "VAT number", v: "IT 04412 9930 21", mono: true },
  { icon: "map-pin", k: "Address", v: "Via Zamboni 12, Bologna" },
];

/** What one seat costs the organisation each month. */
export const SEAT_MONTHLY = 54;
