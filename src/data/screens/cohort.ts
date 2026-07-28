/*
 * Cohort setup — page-local seed.
 *
 * The cohort being drafted is 04: 03 is the one running now, which every other
 * screen refers to. Its end date sits outside the demo clock's eight weeks, so
 * it is a fixed day rather than something `weekStart` can derive.
 */

import { fmtDateLong } from "../../lib/schedule";
import { WAITLIST } from "./waitlist";

/** The intake this page drafts. */
export const COHORT_NO = "04";

/** Teaching ends here — past the demo clock, so stated rather than derived. */
export const END_DATE = fmtDateLong(new Date(2026, 9, 30));

/** The days a weekly live session can land on. */
export const LIVE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/** Seats move in pairs, between a workable minimum and a room-sized maximum. */
export const SEATS_MIN = 6;
export const SEATS_MAX = 60;
export const SEATS_STEP = 2;

/**
 * How many people are queued for a seat.
 *
 * Read off the waitlist itself rather than restated, so opening enrolment
 * promises exactly as many emails as that screen lists. The import is the one
 * place this screen reaches across to another's seed.
 */
export const WAITLIST_COUNT = WAITLIST.length;
