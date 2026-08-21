/*
 * Exam builder — page-local seed.
 *
 * The exam itself is contract data and comes through `dataSource.exam()`.
 * What lives here is the vocabulary the builder puts around it: the two names
 * each question kind goes by, and the note that explains how an open answer
 * gets marked. Vocabulary is interface, so every string in this file is a
 * getter and follows the reader's language.
 */

import { t } from "../../i18n/ambient";
import type { ExamQuestionKind } from "../types";

/** The long name, used in the question list and the current-question pill. */
export const KIND_LABELS: Record<ExamQuestionKind, string> = {
  get single() {
    return t("data.exambuilder.kind.single");
  },
  get multi() {
    return t("data.exambuilder.kind.multi");
  },
  get short() {
    return t("data.exambuilder.kind.short");
  },
  get essay() {
    return t("data.exambuilder.kind.essay");
  },
};

export interface KindOption {
  id: ExamQuestionKind;
  /** The short name — the segmented control has no room for the long one. */
  label: string;
}

export const KIND_OPTIONS: KindOption[] = [
  {
    id: "single",
    get label() {
      return t("data.exambuilder.short.single");
    },
  },
  {
    id: "multi",
    get label() {
      return t("data.exambuilder.short.multi");
    },
  },
  {
    id: "short",
    get label() {
      return t("data.exambuilder.short.short");
    },
  },
  {
    id: "essay",
    get label() {
      return t("data.exambuilder.short.essay");
    },
  },
];

/**
 * What happens to an answer with no options.
 *
 * Only the two open kinds have one; `single` and `multi` show their options
 * instead, so the record covers exactly the kinds that need it.
 */
export const OPEN_NOTE: Record<"short" | "essay", string> = {
  get essay() {
    return t("data.exambuilder.note.essay");
  },
  get short() {
    return t("data.exambuilder.note.short");
  },
};

/** The three exam-wide settings, in the comp's order. */
export const RULE_LABELS = {
  get pass() {
    return t("data.exambuilder.rule.pass");
  },
  get attempts() {
    return t("data.exambuilder.rule.attempts");
  },
  get duration() {
    return t("data.exambuilder.rule.duration");
  },
};
