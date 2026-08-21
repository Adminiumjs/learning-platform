/*
 * Peer-review seed — the comp's `peerV()` fixtures.
 *
 * Page-local: the review round is a module-03 exercise, not part of the
 * course contract in `dataSource`.
 *
 * Translation. What Tomás and Aisha wrote about Rosa's work is fiction and
 * stays English. The three house tips, the three marking criteria and the
 * queue's "submitted N ago" line are the exercise's own interface and move
 * with the reader — the ages through `Intl.RelativeTimeFormat` rather than a
 * hand-written "6h ago".
 */

import { number, t } from "../../i18n/ambient";
import type { MessageKey } from "../../i18n/messages";
import { ago, lazyStrings, ratio } from "../format";

/** The cohort week this review round belongs to. */
const ROUND_WEEK = 2;

export interface PeerSubmission {
  id: string;
  who: string;
  ini: string;
  /** Mono filename chip. Nothing downloads — there are no real files. */
  file: string;
  meta: string;
}

export interface PeerCriterion {
  id: string;
  label: string;
}

export interface ReceivedReview {
  id: string;
  who: string;
  ini: string;
  at: string;
  score: string;
  text: string;
  /** Seeded state of the thanks button. */
  thanked: boolean;
}

/** "Type specimen page · submitted 6 hours ago". The title itself is fiction. */
function submitted(when: string): string {
  return t("data.peer.submitted", { item: "Type specimen page", when });
}

export const PEER_QUEUE: PeerSubmission[] = [
  {
    id: "p1",
    who: "Camila Rojas",
    ini: "CR",
    file: "specimen_rojas.pdf",
    get meta() {
      return submitted(ago(6, "hour"));
    },
  },
  {
    id: "p2",
    who: "Henry Osei",
    ini: "HO",
    file: "specimen_osei.pdf",
    get meta() {
      return submitted(ago(1, "day"));
    },
  },
  {
    id: "p3",
    who: "Elif Demir",
    ini: "ED",
    file: "specimen_demir.pdf",
    get meta() {
      return submitted(ago(2, "day"));
    },
  },
];

/**
 * House rules for writing a review. Interface, so lazily translated.
 *
 * The keys are spelled out as literals — a `MessageKey` tuple rather than a
 * template — so a tip that loses its message is a compile error here instead
 * of "data.peer.tip.3" appearing on screen.
 */
const PEER_TIP_KEYS = [
  "data.peer.tip.1",
  "data.peer.tip.2",
  "data.peer.tip.3",
] as const satisfies readonly MessageKey[];

export const PEER_TIPS: string[] = lazyStrings(PEER_TIP_KEYS.length, (i) =>
  t(PEER_TIP_KEYS[i]),
);

export const PEER_CRITERIA: PeerCriterion[] = [
  {
    id: "scale",
    get label() {
      return t("data.peer.criterion.scale");
    },
  },
  {
    id: "reasoning",
    get label() {
      return t("data.peer.criterion.reasoning");
    },
  },
  {
    id: "craft",
    get label() {
      return t("data.peer.criterion.craft");
    },
  },
];

export const PEER_RECEIVED: ReceivedReview[] = [
  {
    id: "g1",
    who: "Tomás Lindqvist",
    ini: "TL",
    get at() {
      return t("data.peer.round", { week: number(ROUND_WEEK), item: "token sheet" });
    },
    get score() {
      return ratio(11, 12);
    },
    text: "Six greys from twenty-seven, and every one has a name that says its job. That is the whole exercise. Your semantic layer leans on brand-blue in two places where it probably wants a role name instead.",
    thanked: false,
  },
  {
    id: "g2",
    who: "Aisha Bello",
    ini: "AB",
    get at() {
      return t("data.peer.round", { week: number(ROUND_WEEK), item: "token sheet" });
    },
    get score() {
      return ratio(10, 12);
    },
    text: "Clear and short, which is rare. I would document the dark-mode aliases next to the light ones rather than in a second table — I kept scrolling to compare them.",
    thanked: true,
  },
];

/** Submissions in one review round — the denominator on the ring. */
export const PEER_ROUND = 3;

/** Highest score a single criterion can take. */
export const PEER_MAX_DOT = 4;

/** Below this the review will not send; at `GOOD` the counter turns positive. */
export const PEER_MIN_WORDS = 15;
export const PEER_GOOD_WORDS = 30;

/**
 * Tint for the specimen preview. It is media colour attached to the work
 * being reviewed, so it travels as data and reaches CSS as `--tint` on
 * `<Cover>` — the one sanctioned way a hex enters this app.
 */
export const PEER_WORK_TINT = "#2563eb";
