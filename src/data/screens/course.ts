/*
 * Course page — page-local seed.
 *
 * Sales copy and the cohort's shop-window numbers. None of it is a contract
 * table: a customer edits the course record and the curriculum in the
 * dashboard (those come through the `dataSource` seam), not the perk list or
 * the instructor's biography.
 */

import { LIVE_SESSION } from "../demo";

/** The cohort currently on sale. `no` is what the sticky bar shows. */
export const COHORT = { no: "03", label: "03 · summer" } as const;

/**
 * Seats in the shop window.
 *
 * The comp hardcoded "6 of 36 seats left" next to a bar filled to 83.3%; both
 * are derived here so the number and the bar cannot drift apart. Note this is
 * the *sales* capacity — `COHORT_CAPACITY` (30) is the roster the instructor
 * side counts, which is why 30 of 36 are gone.
 */
export const SEATS = { total: 36, remaining: 6 } as const;

export const SEATS_LABEL = `${SEATS.remaining} of ${SEATS.total} seats left`;
export const SEATS_TAKEN_PCT = ((SEATS.total - SEATS.remaining) / SEATS.total) * 100;

/** Monday-relative day names, indexed by `LIVE_SESSION.dayOffset`. */
const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

/** "Thursdays 18:00 CET" — kept in step with the live session the app runs. */
export const LIVE_SLOT = `${WEEKDAYS[LIVE_SESSION.dayOffset]}s ${LIVE_SESSION.hour}:00 ${LIVE_SESSION.timezone}`;

export const EFFORT = "~3 hours a week";

export const SELF_PACED_BLURB =
  "Start today, finish whenever. Every lesson is open from the minute you enrol, and it stays yours.";

export const PERKS: { i: string; t: string }[] = [
  { i: "infinity", t: "Lifetime access to every lesson" },
  { i: "message-square-text", t: "Q&A answered by Yara and Nadia" },
  { i: "badge-check", t: "Certificate when you finish" },
];

export const INSTRUCTOR_TAGLINE = "Design lead, 14 years · your instructor";

export const INSTRUCTOR_BIO =
  "I've built systems for a bank, a newsroom and two very stubborn startups. I teach the parts nobody writes down: naming, negotiating, and knowing when a component is done. Nadia Brandt, our TA, reads every submission with me.";
