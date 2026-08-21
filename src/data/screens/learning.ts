/*
 * Page-local seed for "My learning".
 *
 * The greeting and the announcement teaser are page copy the comp defined
 * inside `learningV()`, so they stay out of the DataSource seam: the academy's
 * announcement *records* live in `demo.ts` and are reached through
 * `dataSource.announcements()`, while this is the short teaser the dashboard
 * sidebar shows next to the course list. Its date is not seeded — the screen
 * stamps it from the demo clock.
 *
 * The announcement is Yara writing to her cohort and stays English with the
 * rest of the fiction. The greeting is the app talking; it is a module-level
 * `const` and so cannot be a getter, but its translation is filed under
 * `data.learning.greeting` and takes the student's first name as `{name}`.
 */

export const LEARNING_GREETING =
  "Welcome back, Rosa. You are halfway through Design Systems — keep going.";

export interface LearningAnnouncement {
  title: string;
  body: string;
  /** Time of day only; the date comes from the demo clock. */
  time: string;
}

export const LEARNING_ANNOUNCEMENT: LearningAnnouncement = {
  title: "Week 3 is open",
  body: "Grids and rhythm is up, and the specimen brief is attached. Bring something rough to Thursday — rough is the point.",
  time: "09:12",
};
