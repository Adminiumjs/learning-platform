/*
 * Waitlist — page-local seed copy.
 *
 * Fourteen people who missed cohort 03, each with the reason they gave. The
 * reason column is the whole point of the screen: it is what turns a queue
 * into fourteen decisions an instructor can actually make.
 */

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
  { name: "Sofia Marchetti", email: "sofia@studio.it", at: "2 days ago", why: "Missed cohort 03 by a day" },
  { name: "Liam Ó Braonáin", email: "liam@bordr.co", at: "4 days ago", why: "Wants the live critique" },
  { name: "Hiroshi Ito", email: "h.ito@kanso.jp", at: "5 days ago", why: "Team of three, asking about seats" },
  { name: "Amara Duru", email: "amara@fold.studio", at: "1 week ago", why: "Finished Type & Layout" },
  { name: "Jonas Weber", email: "jonas@weber.de", at: "1 week ago", why: "Repeating with a new team" },
  { name: "Clara Bianchi", email: "clara@viale.it", at: "2 weeks ago", why: "From the newsletter" },
  { name: "Yusuf Demirci", email: "yusuf@atlas.co", at: "2 weeks ago", why: "Waiting since cohort 02" },
  { name: "Maja Novak", email: "maja@novak.si", at: "3 weeks ago", why: "Wants the certificate for work" },
  { name: "Peter Halloran", email: "peter@grain.ie", at: "3 weeks ago", why: "Recommended by Ingrid" },
  { name: "Zeynep Aksoy", email: "zeynep@vela.tr", at: "4 weeks ago", why: "Newsletter, twice" },
  { name: "Ravi Kapoor", email: "ravi@kapoor.dev", at: "5 weeks ago", why: "Retaking after dropping out" },
  { name: "Ida Lindholm", email: "ida@stilla.se", at: "6 weeks ago", why: "Team lead, may bring two" },
  { name: "Bruno Sant’Anna", email: "bruno@paulo.br", at: "7 weeks ago", why: "Asked about a payment plan" },
  { name: "Elif Güneş", email: "elif@gunes.studio", at: "8 weeks ago", why: "First on the list" },
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
export const COHORT_04_OPENS = fmtDateLong(new Date(2026, 8, 7));
