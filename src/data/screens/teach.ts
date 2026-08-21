/*
 * Teach dashboard — page-local seed.
 *
 * The buckets and bar geometry are presentational: nobody would edit them in a
 * generated dashboard, so they sit beside the screen rather than behind the
 * `dataSource` seam. The roster they count over is shared data and comes
 * through the seam.
 *
 * The bucket labels are chart axis text — interface — so they are getters and
 * their digits come from `Intl` rather than being typed into a string.
 */

import { number, t } from "../../i18n/ambient";

export interface ProgressBucket {
  label: string;
  /** Inclusive lower bound, in percent. */
  from: number;
  /** Exclusive upper bound — the last bucket runs to 101 so 100% lands in it. */
  to: number;
}

/** "0–25%" — the digits are the locale's, the dash is CLDR's range separator. */
function bucketLabel(from: number, to: number): string {
  return t("data.teach.bucket", { from: number(from), to: number(to) });
}

/** The four columns of the "Class progress" chart. */
export const PROGRESS_BUCKETS: ProgressBucket[] = [
  {
    get label() {
      return bucketLabel(0, 25);
    },
    from: 0,
    to: 25,
  },
  {
    get label() {
      return bucketLabel(25, 50);
    },
    from: 25,
    to: 50,
  },
  {
    get label() {
      return bucketLabel(50, 75);
    },
    from: 50,
    to: 75,
  },
  {
    get label() {
      return bucketLabel(75, 100);
    },
    from: 75,
    to: 101,
  },
];

/** Buckets before this index read as "behind" and take the warn tone. */
export const BEHIND_BUCKETS = 2;

/** Bar height in px: the tallest bucket, plus the floor an empty one still draws. */
export const BAR_MAX_PX = 86;
export const BAR_MIN_PX = 8;

/** RSVPs in for this week's critique — in-fiction, like the roster. */
export const RSVP_YES = 24;

/*
 * A hardcoded `WEEKDAYS_LONG` array used to live here so the dashboard lede
 * could say "live Thursdays". It was English-only — as every hand-written
 * weekday list is — and has been replaced by `fmtWeekdayLong` in
 * `lib/schedule`, which asks `Intl` for the reader's own weekday names.
 */
