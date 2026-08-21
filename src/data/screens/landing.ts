/*
 * Course landing page — page-local seed.
 *
 * Long-form marketing copy: the proof numbers, the four pains, the week
 * summaries and the FAQ. None of it is a contract table — the course record
 * itself still comes through the `dataSource` seam.
 *
 * Translation. This page is almost entirely the course describing itself —
 * the pains, the week summaries, the FAQ and Yara's biography are demo fiction
 * under 18 §3.4 and stay English. What is interface is the furniture around
 * them: the three stat captions and the "Week 01" label on each card.
 */

import { number, t } from "../../i18n/ambient";

/** The intake this page is selling. Cohort 03 is the one already running. */
export const COHORT_4 = { no: "04", seats: 30, sold: 8, funded: 6 } as const;

/** When cohort 04 opens. Fixed: it must stay ahead of the demo clock's week 8. */
export const COHORT_4_OPENS = new Date(2026, 8, 7);

/*
 * The three proof figures, as numbers — see `../format`. Written out as
 * "71%" / "4.8" / "184" they carried en-US rendering into all eight locales;
 * a German reader wants "4,8" and an Egyptian one "٧١٪".
 */
const FINISH_RATE = 0.71;
const RATING = 4.8;
const ALUMNI = 184;

export const PROOF: { k: string; v: string }[] = [
  {
    get k() {
      return t("data.landing.proof.finish");
    },
    get v() {
      return number(FINISH_RATE, { style: "percent" });
    },
  },
  {
    get k() {
      return t("data.landing.proof.rating");
    },
    get v() {
      return number(RATING, { minimumFractionDigits: 1 });
    },
  },
  {
    get k() {
      return t("data.landing.proof.alumni");
    },
    get v() {
      return number(ALUMNI);
    },
  },
];

export const PAINS: { i: string; t: string }[] = [
  {
    i: "search",
    t: "Three greys called grey, grey-2 and grey-new. Nobody remembers which shipped.",
  },
  {
    i: "git-branch",
    t: "A rebrand means touching two hundred files instead of four tokens.",
  },
  {
    i: "message-square-warning",
    t: "Every new hire rebuilds the dropdown because the old one is undocumented.",
  },
  {
    i: "clock",
    t: "You keep meaning to write it all down after this sprint. It is never after this sprint.",
  },
];

/** "Week 01" — the number is data, the word in front of it is interface. */
function weekLabel(n: number): string {
  return t("data.landing.week", {
    n: number(n, { minimumIntegerDigits: 2, useGrouping: false }),
  });
}

/** Five of the eight weeks — the sample the page advertises. */
export const WEEKS: { n: string; title: string; sub: string }[] = [
  {
    get n() {
      return weekLabel(1);
    },
    title: "Audit",
    sub: "Inventory the real thing, not the tidy version in Figma.",
  },
  {
    get n() {
      return weekLabel(2);
    },
    title: "Colour and tokens",
    sub: "Three layers, dark mode included, without a rewrite.",
  },
  {
    get n() {
      return weekLabel(3);
    },
    title: "Type and spacing",
    sub: "A scale you can defend, rhythm you can hand over.",
  },
  {
    get n() {
      return weekLabel(5);
    },
    title: "Components",
    sub: "States, edge cases and the specs engineers read.",
  },
  {
    get n() {
      return weekLabel(7);
    },
    title: "Ship and document",
    sub: "Docs, handoff, and the final exam.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How much time each week?",
    a: "Three hours is honest: about ninety minutes of lessons and the same again making something. Week 5 is heavier.",
  },
  {
    q: "What if I miss the live session?",
    a: "Recordings go up the same evening, and you can still send work for written notes. Two people in cohort 03 have never made a Thursday.",
  },
  {
    q: "Do I need a team to practise on?",
    a: "No. Half the class brings a side project. The audit works on anything with more than five screens.",
  },
  {
    q: "Is there a refund?",
    a: "Fourteen days, no questions. After that, ask anyway — we are reasonable.",
  },
];

export const TEACHER_BIO =
  "Systems for a bank, a newsroom and two very stubborn startups. I teach the parts nobody writes down: naming, negotiating, and knowing when a component is done.";
