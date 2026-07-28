/*
 * Page-local seed for the exam screen.
 *
 * The questions, the answer key and the rules are contract data — they come
 * through `dataSource.exam()` / `dataSource.examRules()`. What lives here is
 * the screen's own furniture: the intro copy, the label for each question
 * kind, the question-map legend and the essay's paper weight.
 */

import type { ExamQuestionKind } from "../types";

export const EXAM_INTRO_LEDE =
  "Eight questions on everything from the audit to the handoff. Take your time — you have two attempts and nothing here is a trick.";

export const EXAM_ESSAY_NOTE =
  "The essay answer is read by Yara, so your result shows as pending until she gets to it.";

/** What the pill above the question says the question wants. */
export const EXAM_KIND_LABEL: Record<ExamQuestionKind, string> = {
  single: "Single choice",
  multi: "Choose all that apply",
  short: "Short answer",
  essay: "Long-form essay",
};

/** One row under the question map. `state` picks the swatch. */
export interface ExamLegendRow {
  t: string;
  state: "answered" | "current" | "none";
}

export const EXAM_LEGEND: ExamLegendRow[] = [
  { t: "Answered", state: "answered" },
  { t: "Current", state: "current" },
  { t: "Not answered", state: "none" },
];

/** The essay is out of ten and never auto-scored (D7). */
export const EXAM_ESSAY_MAX = 10;
