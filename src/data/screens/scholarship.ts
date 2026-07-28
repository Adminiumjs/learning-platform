/*
 * Scholarship application — page-local seed copy.
 *
 * None of this is contract data: a customer editing courses in the generated
 * dashboard would not touch the funding options or the reassurance notes, so
 * they stay with the screen rather than in `demo.ts`.
 *
 * The two dates are fixed calendar days, not demo-clock days. Cohort 04's
 * application window sits outside the eight weeks the dock moves through, so
 * advancing the clock must not drag the closing date with it.
 */

import { fmtDate, fmtDateLong } from "../../lib/schedule";

/** The reference the confirmation screen and the toast both quote. */
export const SCHOLARSHIP_REF = "Application YA-SCH-0442";

/** The counter turns amber past this. Nothing blocks — it is guidance. */
export const SCHOLARSHIP_WORDS = 200;

export const SCHOLARSHIP_DEADLINE = `Applications close ${fmtDate(
  new Date(2026, 7, 21),
)} · decisions a week later`;

export const SCHOLARSHIP_DECISION_DATE = fmtDateLong(new Date(2026, 7, 24));

export interface ScholarshipOption {
  id: string;
  label: string;
}

/** Only the three courses that run as cohorts can be applied for. */
export const SCHOLARSHIP_COURSES: ScholarshipOption[] = [
  { id: "DS-101", label: "Design Systems" },
  { id: "TY-140", label: "Type & Layout" },
  { id: "MO-220", label: "Motion" },
];

export interface AmountOption {
  /** Doubles as the stored value — the comp keyed `scAmount` on the label. */
  id: string;
  sub: string;
}

export const SCHOLARSHIP_AMOUNTS: AmountOption[] = [
  { id: "50%", sub: "Half the fee" },
  { id: "100%", sub: "The whole fee" },
  { id: "Fee + kit", sub: "Fee and a stipend" },
];

/** Five plain sentences instead of a means test. The point of the screen. */
export const SCHOLARSHIP_SITUATIONS: ScholarshipOption[] = [
  { id: "student", label: "I am studying, or just out of it" },
  { id: "switch", label: "I am changing careers into design" },
  { id: "between", label: "I am between jobs right now" },
  { id: "underpaid", label: "I work somewhere that will not pay for training" },
  { id: "other", label: "Something else — I will explain below" },
];

export const SCHOLARSHIP_NOTES: string[] = [
  "You do not need to prove anything. We have never asked for a payslip and we are not starting now.",
  "Funded students get the same seat, the same critique and the same certificate. Nobody in the cohort is told.",
  "If you get a no, apply again next cohort. Two of the six places this round are second applications.",
];
