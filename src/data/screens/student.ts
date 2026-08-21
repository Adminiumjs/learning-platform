/*
 * Student detail — page-local seed.
 *
 * The person, their progress and their average all come from the shared
 * roster (`dataSource.students()`). What lives here is the detail the roster
 * does not carry: three submissions, four lines of activity, and the two
 * watch-time figures under the header. None of it is contract data — no other
 * screen reads a single student's activity feed.
 *
 * Translation. The assignment names are the curriculum's and stay English; the
 * app's own narration of what happened to them — "Submitted 2 hours ago",
 * "Awaiting" — is interface. Dates and ages go through `Intl` rather than
 * being written as "28 Jul".
 */

import { t } from "../../i18n/ambient";
import { ago, ratio } from "../format";
import { fmtDayMonth } from "../../lib/schedule";

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

/** The two days this student's earlier work was marked on. */
const GRADED_TOKENS = new Date(2026, 6, 28);
const GRADED_CHECKPOINT = new Date(2026, 6, 27);

export const STUDENT_SUBMISSIONS: StudentSubmission[] = [
  {
    item: "Type specimen page",
    get at() {
      return t("data.student.submittedAgo", { when: ago(2, "hour") });
    },
    get score() {
      return t("data.student.awaiting");
    },
    icon: "pen-line",
    tone: "info",
  },
  {
    item: "Build a token sheet",
    get at() {
      return t("data.student.gradedOn", { date: fmtDayMonth(GRADED_TOKENS) });
    },
    get score() {
      return ratio(19, 20);
    },
    icon: "check",
    tone: "pos",
  },
  {
    item: "Week 2 checkpoint",
    get at() {
      return t("data.student.gradedOn", {
        date: fmtDayMonth(GRADED_CHECKPOINT),
      });
    },
    get score() {
      return ratio(9, 10);
    },
    icon: "check",
    tone: "pos",
  },
];

export const STUDENT_ACTIVITY: StudentActivity[] = [
  {
    icon: "play",
    get text() {
      return t("data.student.activity.watched", {
        lesson: "Grids and rhythm",
        at: "14:02",
      });
    },
    get at() {
      return ago(4, "hour");
    },
  },
  {
    icon: "message-circle-question",
    get text() {
      return t("data.student.activity.asked");
    },
    get at() {
      return ago(2, "hour");
    },
  },
  {
    icon: "message-square-text",
    get text() {
      return t("data.student.activity.replied", {
        thread: "4px or 8px spacing?",
      });
    },
    get at() {
      return ago(2, "day");
    },
  },
  {
    icon: "check",
    get text() {
      return t("data.student.activity.finishedModule", { no: "02" });
    },
    get at() {
      return fmtDayMonth(GRADED_TOKENS);
    },
  },
];

/** Lessons watched. The denominator is `dataSource.totalLessons()`. */
export const LESSONS_WATCHED = 16;
/** Questions this student has asked in the public Q&A. */
export const QUESTIONS_ASKED = 3;
/** Mean time spent on a video lesson, "mm:ss". */
export const AVG_WATCH_TIME = "11:40";
/** Which roster row the screen shows. The comp pinned it to the second. */
export const DETAIL_ROW = 1;
