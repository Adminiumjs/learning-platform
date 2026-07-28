/*
 * Exam builder — page-local seed.
 *
 * The exam itself is contract data and comes through `dataSource.exam()`.
 * What lives here is the vocabulary the builder puts around it: the two names
 * each question kind goes by, and the note that explains how an open answer
 * gets marked.
 */

import type { ExamQuestionKind } from "../types";

/** The long name, used in the question list and the current-question pill. */
export const KIND_LABELS: Record<ExamQuestionKind, string> = {
  single: "Single choice",
  multi: "Choose all",
  short: "Short answer",
  essay: "Essay",
};

export interface KindOption {
  id: ExamQuestionKind;
  /** The short name — the segmented control has no room for the long one. */
  label: string;
}

export const KIND_OPTIONS: KindOption[] = [
  { id: "single", label: "Single" },
  { id: "multi", label: "Multiple" },
  { id: "short", label: "Short" },
  { id: "essay", label: "Essay" },
];

/**
 * What happens to an answer with no options.
 *
 * Only the two open kinds have one; `single` and `multi` show their options
 * instead, so the record covers exactly the kinds that need it.
 */
export const OPEN_NOTE: Record<"short" | "essay", string> = {
  essay:
    "Essays are read by you — students see “pending review” until you grade them.",
  short:
    "Short answers are matched against a list of accepted spellings. Case does not matter.",
};

/** The three exam-wide settings, in the comp's order. */
export const RULE_LABELS = {
  pass: "Pass mark",
  attempts: "Attempts allowed",
  duration: "Time limit",
} as const;
