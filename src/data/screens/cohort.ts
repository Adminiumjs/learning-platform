/*
 * Cohort setup — page-local seed.
 *
 * The cohort being drafted is 04: 03 is the one running now, which every other
 * screen refers to. Its end date sits outside the demo clock's eight weeks, so
 * it is a fixed day rather than something `weekStart` can derive.
 *
 * `LIVE_DAYS` used to be a hand-written `["Mon", "Tue", …]`. It now asks
 * `Intl` for the reader's own weekday names, once per read — see `../format`
 * for the array-of-getters that lets a plain `string[]` do that.
 */

import { lazyStrings } from "../format";
import { fmtDateLong, weekdayName } from "../../lib/schedule";
import { WAITLIST } from "./waitlist";

/** The intake this page drafts. */
export const COHORT_NO = "04";

/**
 * Teaching ends here — past the demo clock, so stated rather than derived.
 *
 * `END_DATE` is formatted at module load, which stamps it in whatever locale
 * was active before React mounted. `END_DATE_ON` is the instant itself; a
 * screen wanting the reader's own format calls `fmtDateLong(END_DATE_ON)`.
 */
export const END_DATE_ON = new Date(2026, 9, 30);
export const END_DATE = fmtDateLong(END_DATE_ON);

/** The days a weekly live session can land on — Monday through Friday. */
export const LIVE_DAYS: string[] = lazyStrings(5, (i) => weekdayName(i + 1));

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
