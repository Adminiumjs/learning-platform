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
 *
 * Translation. The situations, the funding amounts and the three notes are the
 * form's own words and are translated; the course names beside them are not.
 * The two deadline strings are module-level `const`s formatted once at load —
 * `SCHOLARSHIP_CLOSES_ON` / `SCHOLARSHIP_DECISION_ON` are the instants, for a
 * screen that wants the reader's own format.
 */

import { number, t } from "../../i18n/ambient";
import type { MessageKey } from "../../i18n/messages";
import { lazyStrings } from "../format";
import { fmtDate, fmtDateLong } from "../../lib/schedule";

/** The reference the confirmation screen and the toast both quote. */
export const SCHOLARSHIP_REF = "Application YA-SCH-0442";

/** The counter turns amber past this. Nothing blocks — it is guidance. */
export const SCHOLARSHIP_WORDS = 200;

export const SCHOLARSHIP_CLOSES_ON = new Date(2026, 7, 21);
export const SCHOLARSHIP_DECISION_ON = new Date(2026, 7, 24);

export const SCHOLARSHIP_DEADLINE = `Applications close ${fmtDate(
  SCHOLARSHIP_CLOSES_ON,
)} · decisions a week later`;

export const SCHOLARSHIP_DECISION_DATE = fmtDateLong(SCHOLARSHIP_DECISION_ON);

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
  /**
   * The stored value — `scAmount` is keyed on it, so it must NOT move with
   * the language. It used to be drawn as well, which put a bare "50%" and an
   * English "Fee + kit" on the button in all eight locales.
   */
  id: string;
  /** What the button actually draws. */
  label: string;
  sub: string;
}

export const SCHOLARSHIP_AMOUNTS: AmountOption[] = [
  {
    id: "50%",
    get label() {
      return number(0.5, { style: "percent" });
    },
    get sub() {
      return t("data.scholarship.amount.half");
    },
  },
  {
    id: "100%",
    get label() {
      return number(1, { style: "percent" });
    },
    get sub() {
      return t("data.scholarship.amount.whole");
    },
  },
  {
    id: "Fee + kit",
    get label() {
      return t("data.scholarship.amount.feeKit");
    },
    get sub() {
      return t("data.scholarship.amount.stipend");
    },
  },
];

/** Five plain sentences instead of a means test. The point of the screen. */
export const SCHOLARSHIP_SITUATIONS: ScholarshipOption[] = [
  {
    id: "student",
    get label() {
      return t("data.scholarship.situation.student");
    },
  },
  {
    id: "switch",
    get label() {
      return t("data.scholarship.situation.switch");
    },
  },
  {
    id: "between",
    get label() {
      return t("data.scholarship.situation.between");
    },
  },
  {
    id: "underpaid",
    get label() {
      return t("data.scholarship.situation.underpaid");
    },
  },
  {
    id: "other",
    get label() {
      return t("data.scholarship.situation.other");
    },
  },
];

/**
 * The three reassurance notes under the form. Literal keys, not
 * `note.${i + 1}` — an assembled key is invisible to the compiler, and a note
 * that lost its message would print its own key at the reader.
 */
const SCHOLARSHIP_NOTE_KEYS = [
  "data.scholarship.note.1",
  "data.scholarship.note.2",
  "data.scholarship.note.3",
] as const satisfies readonly MessageKey[];

export const SCHOLARSHIP_NOTES: string[] = lazyStrings(
  SCHOLARSHIP_NOTE_KEYS.length,
  (i) => t(SCHOLARSHIP_NOTE_KEYS[i]),
);
