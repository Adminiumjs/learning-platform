/*
 * Search's type filter.
 *
 * The results themselves are not seed data — they are assembled live from the
 * `dataSource` catalogue, the lesson list, the board threads and the Q&A, so
 * anything the demo adds this session is searchable a keystroke later. The
 * only page-local thing is which buckets the chips offer.
 */

/** "all" is the sentinel; the rest match a result's `type`. */
export type SearchType = "all" | "course" | "lesson" | "thread" | "qa";

export interface SearchTypeOption {
  id: SearchType;
  label: string;
}

export const SEARCH_TYPES: SearchTypeOption[] = [
  { id: "all", label: "Everything" },
  { id: "course", label: "Courses" },
  { id: "lesson", label: "Lessons" },
  { id: "thread", label: "Threads" },
  { id: "qa", label: "Q&A" },
];
