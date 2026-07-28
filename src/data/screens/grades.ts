/*
 * Page-local seed for the grades screen.
 *
 * The gradebook is the one table in the demo that is half seed and half live:
 * the five items, their weights and the two results that were already in the
 * book before the demo opened are fixed here, while every score that depends
 * on the demo clock, the submission state or the exam is computed in the
 * screen — exactly where the comp computed it.
 */

/** One line of the gradebook. `weight` is a percentage of the final mark. */
export interface GradeItem {
  id: "tokens" | "specimen" | "spec" | "checkpoint" | "final";
  name: string;
  kind: "Assignment" | "Quiz" | "Exam";
  weight: number;
}

export const GRADE_ITEMS: GradeItem[] = [
  { id: "tokens", name: "Build a token sheet", kind: "Assignment", weight: 15 },
  { id: "specimen", name: "Type specimen page", kind: "Assignment", weight: 15 },
  { id: "spec", name: "Component spec", kind: "Assignment", weight: 20 },
  { id: "checkpoint", name: "Week 4 checkpoint", kind: "Quiz", weight: 10 },
  { id: "final", name: "Final exam", kind: "Exam", weight: 40 },
];

/** Module 02's assignment is already marked when the demo opens. */
export const TOKENS_SUB = "Module 02 · submitted 28 Jul";
export const TOKENS_EARNED = 17;
export const TOKENS_POSSIBLE = 20;

/** The mid-course quiz — auto-scored, and only once its week has arrived. */
export const CHECKPOINT_SUB = "Short quiz · 10 questions";
export const CHECKPOINT_SCORE = "9 / 10";
export const CHECKPOINT_WEEK = 4;

/** Which cohort the gradebook belongs to. */
export const COHORT_LABEL = "cohort 03";

export const CERT_DONE_TITLE = "Certificate of completion";
export const CERT_DONE_BODY =
  "Every module done and the exam in. Your certificate is signed by Yara Haddad and dated today.";
export const CERT_DONE_BTN = "Download certificate";

export const CERT_LOCKED_TITLE = "Certificate locked";
export const CERT_LOCKED_BTN = "See what is left";

/** Nothing downloads — there are no real files anywhere in the demo. */
export const CERT_TOAST = "Demo certificate — nothing downloads here.";
