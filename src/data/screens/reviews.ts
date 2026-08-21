/*
 * Course reviews seed — the comp's `REVIEWS` table and its filter row.
 *
 * Page-local: only this screen reads a review, so it stays out of the shared
 * `dataSource` contract. Copy, ratings and helpful counts are in-fiction and
 * verbatim — six people wrote those six paragraphs.
 *
 * The filter row and the word each star count goes by are interface. So is the
 * age column, which was a hand-written "2 weeks ago" and now comes from
 * `Intl.RelativeTimeFormat`, derived from `ageDays` so the label and the sort
 * key can never disagree.
 */

import { number, t } from "../../i18n/ambient";
import type { MessageKey } from "../../i18n/messages";
import { ago, lazyStrings } from "../format";

export interface Review {
  id: string;
  who: string;
  /** Two-letter monogram — the app renders no avatar images. */
  ini: string;
  /** 1–5. */
  stars: number;
  /** Age as written ("2 weeks ago"). */
  at: string;
  /**
   * The same age as a number. The comp shipped a "Most recent" chip with no
   * implementation behind it; sorting needs something orderable, and the
   * human string is not it.
   */
  ageDays: number;
  helpful: number;
  /** True when the reviewer's enrolment actually completed. */
  verified: boolean;
  text: string;
  /** The instructor's public reply, when there is one. */
  reply?: string;
}

export interface ReviewFilter {
  /** "5"/"4" filter by rating; "recent" sorts; "all" is the reset. */
  id: string;
  label: string;
}

export const REVIEW_FILTERS: ReviewFilter[] = [
  {
    id: "all",
    get label() {
      return t("data.reviews.filter.all");
    },
  },
  {
    id: "5",
    get label() {
      return t("data.reviews.filter.stars", { count: number(5) }, 5);
    },
  },
  {
    id: "4",
    get label() {
      return t("data.reviews.filter.stars", { count: number(4) }, 4);
    },
  },
  {
    id: "recent",
    get label() {
      return t("data.reviews.filter.recent");
    },
  },
];

/**
 * Indexed by the star count, so index 0 is deliberately empty — hence the
 * leading `null`, which is the one slot with no message behind it.
 *
 * Spelled out rather than assembled from the index: a key built at runtime
 * cannot be checked against the bundles, so a missing star word would only
 * show up as "data.reviews.star.4" under somebody's rating.
 */
const STAR_KEYS = [
  null,
  "data.reviews.star.1",
  "data.reviews.star.2",
  "data.reviews.star.3",
  "data.reviews.star.4",
  "data.reviews.star.5",
] as const satisfies readonly (MessageKey | null)[];

export const STAR_LABELS: string[] = lazyStrings(STAR_KEYS.length, (i) => {
  const key = STAR_KEYS[i];
  return key === null ? "" : t(key);
});

export const REVIEWS: Review[] = [
  {
    id: "r1",
    who: "Ingrid Halvorsen",
    ini: "IH",
    stars: 5,
    get at() {
      return ago(2, "week");
    },
    ageDays: 14,
    helpful: 14,
    verified: true,
    text: "I came in with a folder of components and left with a system I can defend in a meeting. The naming lesson alone paid for the course — we renamed eleven things the week after and the arguments stopped.",
  },
  {
    id: "r2",
    who: "Chidera Obi",
    ini: "CO",
    stars: 5,
    get at() {
      return ago(3, "week");
    },
    ageDays: 21,
    helpful: 9,
    verified: true,
    text: "Yara is blunt in the best way. My critique in week 4 was three minutes long and I rebuilt half the library after it. Bring work you are not precious about.",
  },
  {
    id: "r3",
    who: "Jonas Weber",
    ini: "JW",
    stars: 4,
    get at() {
      return ago(1, "month");
    },
    ageDays: 30,
    helpful: 6,
    verified: true,
    text: "Excellent on tokens and documentation. The components module moves fast — I watched two lessons twice. Would happily pay for a slower companion course on states.",
    reply:
      "Fair, and noted. I'm splitting the components module into two next cohort, with the states work getting its own week.",
  },
  {
    id: "r4",
    who: "Aisha Bello",
    ini: "AB",
    stars: 5,
    get at() {
      return ago(1, "month");
    },
    ageDays: 31,
    helpful: 11,
    verified: true,
    text: "The office hours are the course. Watching someone else get critiqued taught me more than my own turn did.",
  },
  {
    id: "r5",
    who: "Diego Ferreira",
    ini: "DF",
    stars: 4,
    get at() {
      return ago(2, "month");
    },
    ageDays: 60,
    helpful: 3,
    verified: true,
    text: "Solid, practical, no fluff. Three hours a week is honest — I needed four most weeks, and I have a full-time job.",
  },
  {
    id: "r6",
    who: "Nora Lindgren",
    ini: "NL",
    stars: 5,
    get at() {
      return ago(2, "month");
    },
    ageDays: 61,
    helpful: 8,
    verified: true,
    text: "I have taken four design courses and this is the only one where I shipped something real while it was running. The audit template is still on my desk.",
  },
];
