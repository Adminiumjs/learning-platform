/*
 * Student detail — page-local seed.
 *
 * The person, their progress and their average all come from the shared
 * roster (`dataSource.students()`). What lives here is the detail the roster
 * does not carry: three submissions, four lines of activity, and the two
 * watch-time figures under the header. None of it is contract data — no other
 * screen reads a single student's activity feed.
 */

/** Tone tokens the submission rows use. Keeps the data file free of markup. */
export type SubmissionTone = "info" | "pos";

export interface StudentSubmission {
  item: string;
  /** "Submitted 2h ago" / "Graded 28 Jul". */
  at: string;
  /** "Awaiting" while it is unmarked, else "19 / 20". */
  score: string;
  icon: string;
  tone: SubmissionTone;
}

export interface StudentActivity {
  icon: string;
  text: string;
  at: string;
}

export const STUDENT_SUBMISSIONS: StudentSubmission[] = [
  { item: "Type specimen page", at: "Submitted 2h ago", score: "Awaiting", icon: "pen-line", tone: "info" },
  { item: "Build a token sheet", at: "Graded 28 Jul", score: "19 / 20", icon: "check", tone: "pos" },
  { item: "Week 2 checkpoint", at: "Graded 27 Jul", score: "9 / 10", icon: "check", tone: "pos" },
];

export const STUDENT_ACTIVITY: StudentActivity[] = [
  { icon: "play", text: "Watched Grids and rhythm to 14:02", at: "4h ago" },
  { icon: "message-circle-question", text: "Asked about breaking the baseline grid", at: "2h ago" },
  { icon: "message-square-text", text: "Replied in “4px or 8px spacing?”", at: "2 days ago" },
  { icon: "check", text: "Finished module 02", at: "28 Jul" },
];

/** Lessons watched. The denominator is `dataSource.totalLessons()`. */
export const LESSONS_WATCHED = 16;
/** Questions this student has asked in the public Q&A. */
export const QUESTIONS_ASKED = 3;
/** Mean time spent on a video lesson, "mm:ss". */
export const AVG_WATCH_TIME = "11:40";
/** Which roster row the screen shows. The comp pinned it to the second. */
export const DETAIL_ROW = 1;
