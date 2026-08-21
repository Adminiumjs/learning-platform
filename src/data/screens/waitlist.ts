/*
 * Waitlist — page-local seed copy.
 *
 * Fourteen people who missed cohort 03, each with the reason they gave. The
 * reason column is the whole point of the screen: it is what turns a queue
 * into fourteen decisions an instructor can actually make.
 *
 * The reasons are what fourteen people wrote, so they stay English. The `at`
 * column is the app's own arithmetic and now goes through
 * `Intl.RelativeTimeFormat` instead of a hand-written "2 days ago".
 */

import { ago } from "../format";
import { fmtDateLong } from "../../lib/schedule";

export interface WaitlistPerson {
  name: string;
  email: string;
  /** Relative, because the demo clock only moves inside the cohort. */
  at: string;
  why: string;
}

/** Oldest last — the list reads newest-first, as a queue does. */
export const WAITLIST: WaitlistPerson[] = [
  {
    name: "Sofia Marchetti",
    email: "sofia@studio.it",
    get at() {
      return ago(2, "day");
    },
    why: "Missed cohort 03 by a day",
  },
  {
    name: "Liam Ó Braonáin",
    email: "liam@bordr.co",
    get at() {
      return ago(4, "day");
    },
    why: "Wants the live critique",
  },
  {
    name: "Hiroshi Ito",
    email: "h.ito@kanso.jp",
    get at() {
      return ago(5, "day");
    },
    why: "Team of three, asking about seats",
  },
  {
    name: "Amara Duru",
    email: "amara@fold.studio",
    get at() {
      return ago(1, "week");
    },
    why: "Finished Type & Layout",
  },
  {
    name: "Jonas Weber",
    email: "jonas@weber.de",
    get at() {
      return ago(1, "week");
    },
    why: "Repeating with a new team",
  },
  {
    name: "Clara Bianchi",
    email: "clara@viale.it",
    get at() {
      return ago(2, "week");
    },
    why: "From the newsletter",
  },
  {
    name: "Yusuf Demirci",
    email: "yusuf@atlas.co",
    get at() {
      return ago(2, "week");
    },
    why: "Waiting since cohort 02",
  },
  {
    name: "Maja Novak",
    email: "maja@novak.si",
    get at() {
      return ago(3, "week");
    },
    why: "Wants the certificate for work",
  },
  {
    name: "Peter Halloran",
    email: "peter@grain.ie",
    get at() {
      return ago(3, "week");
    },
    why: "Recommended by Ingrid",
  },
  {
    name: "Zeynep Aksoy",
    email: "zeynep@vela.tr",
    get at() {
      return ago(4, "week");
    },
    why: "Newsletter, twice",
  },
  {
    name: "Ravi Kapoor",
    email: "ravi@kapoor.dev",
    get at() {
      return ago(5, "week");
    },
    why: "Retaking after dropping out",
  },
  {
    name: "Ida Lindholm",
    email: "ida@stilla.se",
    get at() {
      return ago(6, "week");
    },
    why: "Team lead, may bring two",
  },
  {
    name: "Bruno Sant’Anna",
    email: "bruno@paulo.br",
    get at() {
      return ago(7, "week");
    },
    why: "Asked about a payment plan",
  },
  {
    name: "Elif Güneş",
    email: "elif@gunes.studio",
    get at() {
      return ago(8, "week");
    },
    why: "First on the list",
  },
];

/**
 * Seats gone in cohort 04.
 *
 * The comp kept this on a `COHORT4` record shared with the landing page; the
 * seat count itself is contract data (`dataSource.cohortCapacity()`), so only
 * the sold figure lives here.
 */
export const COHORT_04_SOLD = 8;

/** Cohort 04 opens outside the demo clock's eight weeks, so it is a fixed day. */
export const COHORT_04_OPENS_ON = new Date(2026, 8, 7);
export const COHORT_04_OPENS = fmtDateLong(COHORT_04_OPENS_ON);
