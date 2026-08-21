/*
 * Course page — page-local seed.
 *
 * Sales copy and the cohort's shop-window numbers. None of it is a contract
 * table: a customer edits the course record and the curriculum in the
 * dashboard (those come through the `dataSource` seam), not the perk list or
 * the instructor's biography.
 *
 * Translation. The perks and the intake label are interface and are getters.
 * The blurb and Yara's biography are hers to write and stay English. The three
 * bare strings at the bottom cannot be getters — a module-level `const` is
 * evaluated once, before React exists — so they keep their English here and
 * their translations under `data.course.*` for the screen to resolve.
 */

import { t } from "../../i18n/ambient";
import { fmtWeekdayLong, liveDate, fmtTime } from "../../lib/schedule";
import { LIVE_SESSION } from "../demo";

/** The cohort currently on sale. `no` is what the sticky bar shows. */
export const COHORT = {
  no: "03",
  /** "03 · summer" — the season is a word, so it moves. */
  get label() {
    return t("data.course.cohortLabel", { no: "03" });
  },
};

/**
 * Seats in the shop window.
 *
 * The comp hardcoded "6 of 36 seats left" next to a bar filled to 83.3%; both
 * are derived here so the number and the bar cannot drift apart. Note this is
 * the *sales* capacity — `COHORT_CAPACITY` (30) is the roster the instructor
 * side counts, which is why 30 of 36 are gone.
 */
export const SEATS = { total: 36, remaining: 6 } as const;

/**
 * "6 of 36 seats left".
 *
 * Still English here, for the module-const reason above. The screen has the
 * numbers on `SEATS` already, so `t("data.course.seatsLeft", { remaining, total })`
 * is the whole of the fix at the render site.
 */
export const SEATS_LABEL = `${SEATS.remaining} of ${SEATS.total} seats left`;
export const SEATS_TAKEN_PCT =
  ((SEATS.total - SEATS.remaining) / SEATS.total) * 100;

/**
 * The weekly session, as a date the reader's own locale can render.
 *
 * The comp wrote "Thursdays 18:00 CET" from a hand-kept weekday list and a
 * `${hour}:00` template — English weekday, 24-hour clock, wrong on both counts
 * for half the locales here. Week 1's session is a real instant, so `Intl`
 * names the day and prints the time.
 */
export const LIVE_SESSION_AT = liveDate(
  1,
  LIVE_SESSION.dayOffset,
  LIVE_SESSION.hour,
);

/**
 * "Every Thursday, 6:00 PM CET".
 *
 * A FUNCTION, not a const, and it goes through `data.course.liveSlot` — which
 * was already translated into all eight languages and, until now, read by
 * nobody. The const it replaces had two faults: it glued an "s" onto the
 * weekday to pluralise it, which yields "Donnerstags" by luck in German and
 * "الخميسs" in Arabic; and being a module-level template literal it ran
 * `fmtWeekdayLong` before <App> had set the locale, freezing the day name in
 * English for the life of the tab.
 */
export function liveSlot(): string {
  return t("data.course.liveSlot", {
    day: fmtWeekdayLong(LIVE_SESSION_AT),
    time: fmtTime(LIVE_SESSION_AT),
    tz: LIVE_SESSION.timezone,
  });
}

/** "~3 hours a week" — likewise a stranded key until now. */
export function effort(): string {
  return t("data.course.effort");
}

export const SELF_PACED_BLURB =
  "Start today, finish whenever. Every lesson is open from the minute you enrol, and it stays yours.";

export const PERKS: { i: string; t: string }[] = [
  {
    i: "infinity",
    get t() {
      return t("data.course.perk.lifetime");
    },
  },
  {
    i: "message-square-text",
    get t() {
      return t("data.course.perk.qa");
    },
  },
  {
    i: "badge-check",
    get t() {
      return t("data.course.perk.certificate");
    },
  },
];

export const INSTRUCTOR_TAGLINE = "Design lead, 14 years · your instructor";

export const INSTRUCTOR_BIO =
  "I've built systems for a bank, a newsroom and two very stubborn startups. I teach the parts nobody writes down: naming, negotiating, and knowing when a component is done. Nadia Brandt, our TA, reads every submission with me.";
