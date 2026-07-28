/*
 * Page-local seed for the student profile.
 *
 * Only the things the profile page states about the demo account and nobody
 * would edit in a generated dashboard: the four notification switches and the
 * two header facts. Everything editable (name, email, bio, the switch states)
 * is store state, and everything countable (courses enrolled, lessons
 * finished) is derived from the DataSource rather than restated here.
 */

/** One row of the "Email me about" list. `k` indexes `prNotif` on the store. */
export interface NotifyRow {
  k: string;
  label: string;
  sub: string;
}

export const NOTIFY_ROWS: NotifyRow[] = [
  { k: "lessons", label: "A new lesson unlocks", sub: "Once a week, the morning it opens" },
  { k: "replies", label: "Someone replies to me", sub: "Answers on your questions and threads" },
  { k: "live", label: "Live sessions", sub: "A nudge an hour before we start" },
  { k: "news", label: "School news", sub: "New courses, once in a while" },
];

/** The mono handle under the student's name. Not editable, so not store state. */
export const PROFILE_HANDLE = "@rosa.marchetti";
export const PROFILE_SINCE = "Student since February 2026";

/** The two header stats the demo does not model anywhere else. */
export const HOURS_WATCHED = "21h";
export const CURRENT_STREAK = "6 wks";
