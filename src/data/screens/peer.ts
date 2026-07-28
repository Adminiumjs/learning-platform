/*
 * Peer-review seed — the comp's `peerV()` fixtures.
 *
 * Page-local: the review round is a module-03 exercise, not part of the
 * course contract in `dataSource`.
 */

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

export const PEER_QUEUE: PeerSubmission[] = [
  {
    id: "p1",
    who: "Camila Rojas",
    ini: "CR",
    file: "specimen_rojas.pdf",
    meta: "Type specimen page · submitted 6h ago",
  },
  {
    id: "p2",
    who: "Henry Osei",
    ini: "HO",
    file: "specimen_osei.pdf",
    meta: "Type specimen page · submitted yesterday",
  },
  {
    id: "p3",
    who: "Elif Demir",
    ini: "ED",
    file: "specimen_demir.pdf",
    meta: "Type specimen page · submitted 2 days ago",
  },
];

export const PEER_TIPS: string[] = [
  "Say what the work does well before what it does not. It gets read either way.",
  "Point at a specific size, line or spacing. “Feels off” helps nobody.",
  "One change is enough. Three is a lecture.",
];

export const PEER_CRITERIA: PeerCriterion[] = [
  { id: "scale", label: "Scale is defensible" },
  { id: "reasoning", label: "Reasoning is written down" },
  { id: "craft", label: "Craft and detail" },
];

export const PEER_RECEIVED: ReceivedReview[] = [
  {
    id: "g1",
    who: "Tomás Lindqvist",
    ini: "TL",
    at: "Week 2 · token sheet",
    score: "11 / 12",
    text:
      "Six greys from twenty-seven, and every one has a name that says its job. That is the whole exercise. Your semantic layer leans on brand-blue in two places where it probably wants a role name instead.",
    thanked: false,
  },
  {
    id: "g2",
    who: "Aisha Bello",
    ini: "AB",
    at: "Week 2 · token sheet",
    score: "10 / 12",
    text:
      "Clear and short, which is rare. I would document the dark-mode aliases next to the light ones rather than in a second table — I kept scrolling to compare them.",
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
