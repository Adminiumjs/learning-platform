/*
 * Teach dashboard — page-local seed.
 *
 * The buckets and bar geometry are presentational: nobody would edit them in a
 * generated dashboard, so they sit beside the screen rather than behind the
 * `dataSource` seam. The roster they count over is shared data and comes
 * through the seam.
 */

export interface ProgressBucket {
  label: string;
  /** Inclusive lower bound, in percent. */
  from: number;
  /** Exclusive upper bound — the last bucket runs to 101 so 100% lands in it. */
  to: number;
}

/** The four columns of the "Class progress" chart. */
export const PROGRESS_BUCKETS: ProgressBucket[] = [
  { label: "0–25%", from: 0, to: 25 },
  { label: "25–50%", from: 25, to: 50 },
  { label: "50–75%", from: 50, to: 75 },
  { label: "75–100%", from: 75, to: 101 },
];

/** Buckets before this index read as "behind" and take the warn tone. */
export const BEHIND_BUCKETS = 2;

/** Bar height in px: the tallest bucket, plus the floor an empty one still draws. */
export const BAR_MAX_PX = 86;
export const BAR_MIN_PX = 8;

/** RSVPs in for this week's critique — in-fiction, like the roster. */
export const RSVP_YES = 24;

/**
 * Full weekday names, indexed by `Date.getDay()`.
 *
 * `lib/schedule` only carries the three-letter form, and the dashboard's lede
 * wants the recurring plural ("live Thursdays"). Kept here rather than added
 * to the shared engine, which no other screen needs it in.
 */
export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
