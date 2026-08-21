/*
 * Page-local seed for the exam screen.
 *
 * The questions, the answer key and the rules are contract data — they come
 * through `dataSource.exam()` / `dataSource.examRules()`. What lives here is
 * the screen's own furniture: the intro copy, the label for each question
 * kind, the question-map legend and the essay's paper weight.
 *
 * The furniture is interface, so the kind labels and the legend are getters.
 * The two ledes are module-level `const`s and cannot be — their translations
 * are `data.exam.introLede` and `data.exam.essayNote`.
 */

import { t } from "../../i18n/ambient";
import type { ExamQuestionKind } from "../types";

export const EXAM_INTRO_LEDE =
  "Eight questions on everything from the audit to the handoff. Take your time — you have two attempts and nothing here is a trick.";

export const EXAM_ESSAY_NOTE =
  "The essay answer is read by Yara, so your result shows as pending until she gets to it.";

/** What the pill above the question says the question wants. */
export const EXAM_KIND_LABEL: Record<ExamQuestionKind, string> = {
  get single() {
    return t("data.exam.kind.single");
  },
  get multi() {
    return t("data.exam.kind.multi");
  },
  get short() {
    return t("data.exam.kind.short");
  },
  get essay() {
    return t("data.exam.kind.essay");
  },
};

/** One row under the question map. `state` picks the swatch. */
export interface ExamLegendRow {
  t: string;
  state: "answered" | "current" | "none";
}

export const EXAM_LEGEND: ExamLegendRow[] = [
  {
    get t() {
      return t("data.exam.legend.answered");
    },
    state: "answered",
  },
  {
    get t() {
      return t("data.exam.legend.current");
    },
    state: "current",
  },
  {
    get t() {
      return t("data.exam.legend.none");
    },
    state: "none",
  },
];

/** The essay is out of ten and never auto-scored (D7). */
export const EXAM_ESSAY_MAX = 10;
