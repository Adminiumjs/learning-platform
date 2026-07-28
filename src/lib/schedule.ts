/*
 * The drip / unlock engine (spec 20 D6).
 *
 * This is the thing that makes the app an *ongoing class* rather than a video
 * dump, and it is deliberately pure: every function here takes the demo clock
 * as an argument and returns a value. Nothing reads `Date.now()`.
 *
 * Why the demo clock is not the real clock
 * ----------------------------------------
 * If locks were computed from the wall clock, the demo would look different
 * every week and be un-testable. Instead the cohort's week 1 is pinned to
 * Monday 20 July 2026 (`COHORT_WEEK_ONE`) and the store holds a `week` number
 * from 1 to 8. The dock's "Advance one week" / "Reset to week 1" buttons move
 * it, so the drip is visible inside a 60-second demo and identical on every
 * machine.
 *
 * The rule, in full:
 *   • Self-paced mode: nothing is ever locked.
 *   • Cohort mode: a module is locked while its `week` is past the demo
 *     clock's current week. Its lessons inherit that lock and render with the
 *     unlock date ("Unlocks Mon 3 Aug").
 *
 * A lesson marked `preview` would be open before enrolment; the seeded
 * curriculum marks previews on the course sales page rather than on the
 * lesson record, so `isPreviewLesson` reads the index and is exported for the
 * course page to use.
 */

import { COHORT_WEEK_ONE, COHORT_WEEKS, MODULES, TOTAL_LESSONS } from "../data/demo";
import type { CourseMode, FlatLesson, Module } from "../data/types";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/* ------------------------------------------------------------ the clock */

/** The Monday that starts cohort week `n` (1-based). */
export function weekStart(n: number): Date {
  const d = new Date(COHORT_WEEK_ONE.year, COHORT_WEEK_ONE.month, COHORT_WEEK_ONE.day);
  d.setDate(d.getDate() + 7 * (Math.max(1, n) - 1));
  return d;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * "Now" on the demo clock: Tuesday of the current week at 10:20.
 *
 * Mid-week on purpose — week 3's lessons are open, week 3's assignment is not
 * yet overdue, and Thursday's live session is still ahead.
 */
export function demoNow(week: number): Date {
  const d = weekStart(week);
  d.setDate(d.getDate() + 1);
  d.setHours(10, 20, 0, 0);
  return d;
}

/** The scheduled live session for the current week. */
export function liveDate(week: number, dayOffset = 3, hour = 18): Date {
  const d = addDays(weekStart(week), dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** The week-3 assignment deadline — fixed, so it can go overdue as time moves. */
export function dueDate(): Date {
  return addDays(weekStart(3), 4);
}

/* ---------------------------------------------------------- formatting */

/** "Mon 3 Aug" */
export function fmtDate(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Mon 3 Aug 2026" */
export function fmtDateLong(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Week 3 of 8 · Mon 3 Aug" — the dock's readout. */
export function clockLabel(week: number): string {
  return `Week ${week} of ${COHORT_WEEKS} · ${fmtDate(weekStart(week))}`;
}

/**
 * A live countdown, formatted "2d 04h 31m 12s".
 *
 * `elapsed` is seconds since the app mounted; it is the only place a real
 * ticking clock leaks in, and it only ever makes the countdown run down.
 */
export function countdown(week: number, elapsed: number): string {
  let ms = liveDate(week).getTime() - demoNow(week).getTime() - elapsed * 1000;
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${d > 0 ? `${d}d ` : ""}${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
}

/* -------------------------------------------------------------- the drip */

/** True when the app is running the dated-cohort story. */
export function isCohort(mode: CourseMode): boolean {
  return mode === "cohort";
}

/** D6: a module is locked when its week is still ahead on the demo clock. */
export function isModuleLocked(m: Module, week: number, mode: CourseMode): boolean {
  return isCohort(mode) && m.week > week;
}

/** "Unlocks Mon 3 Aug" — the chip a locked row carries. */
export function unlockLabel(m: Module): string {
  return `Unlocks ${fmtDate(weekStart(m.week))}`;
}

/** The two lessons the sales page opens before enrolment (D6 `preview`). */
export function isPreviewLesson(lessonId: string): boolean {
  return lessonId === "L1" || lessonId === "L2";
}

/* ----------------------------------------------------------- curriculum */

/** Every lesson in order, each carrying its owning module. */
export function allLessons(): FlatLesson[] {
  const out: FlatLesson[] = [];
  for (const m of MODULES) {
    for (const l of m.lessons) out.push({ ...l, mod: m });
  }
  return out;
}

export function lessonById(id: string): FlatLesson | undefined {
  return allLessons().find((l) => l.id === id);
}

/** How many of the 22 lessons are ticked off. */
export function doneCount(done: Record<string, number>): number {
  return Object.keys(done).filter((k) => done[k]).length;
}

/** Course completion, 0–100. */
export function progressPct(done: Record<string, number>): number {
  return Math.round((doneCount(done) / TOTAL_LESSONS) * 100);
}

/** Runtime of a lesson in seconds, parsed from its "mm:ss" duration. */
export function lessonSeconds(id: string): number {
  const l = lessonById(id);
  if (!l) return 600;
  const parts = (l.dur || "").split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 600;
}

/* --------------------------------------------------------------- clocks */

/** "04:32" */
export function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** "00:44:58" */
export function hhmmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return [
    String(Math.floor(s / 3600)).padStart(2, "0"),
    String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    String(s % 60).padStart(2, "0"),
  ].join(":");
}

/**
 * Where the player head sits, 0–1.
 *
 * Paused: whatever the user last scrubbed to. Playing: that anchor plus the
 * seconds elapsed since play was pressed, clamped at the end of the lesson.
 */
export function playheadPos(args: {
  playing: boolean;
  pos: number;
  lessonId: string;
  elapsed: number;
  playAnchor: number;
}): number {
  if (!args.playing) return args.pos;
  const dur = lessonSeconds(args.lessonId) || 600;
  return Math.min(1, args.pos + (args.elapsed - args.playAnchor) / dur);
}
