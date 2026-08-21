/*
 * Search's type filter.
 *
 * The results themselves are not seed data — they are assembled live from the
 * `dataSource` catalogue, the lesson list, the board threads and the Q&A, so
 * anything the demo adds this session is searchable a keystroke later. The
 * only page-local thing is which buckets the chips offer.
 */

import { t } from "../../i18n/ambient";

/** "all" is the sentinel; the rest match a result's `type`. */
export type SearchType = "all" | "course" | "lesson" | "thread" | "qa";

export interface SearchTypeOption {
  id: SearchType;
  label: string;
}

export const SEARCH_TYPES: SearchTypeOption[] = [
  {
    id: "all",
    get label() {
      return t("data.search.type.all");
    },
  },
  {
    id: "course",
    get label() {
      return t("data.search.type.course");
    },
  },
  {
    id: "lesson",
    get label() {
      return t("data.search.type.lesson");
    },
  },
  {
    id: "thread",
    get label() {
      return t("data.search.type.thread");
    },
  },
  {
    id: "qa",
    get label() {
      return t("data.search.type.qa");
    },
  },
];
