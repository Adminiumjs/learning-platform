/*
 * The DataSource seam.
 *
 * Screens and the store never import `./demo` directly for shared, record-like
 * data — they go through `dataSource` (or `getDataSource()`), so the seeded
 * academy can be swapped for a real API without touching a single screen.
 *
 * Scope. This seam covers the collections that map onto the manifest's
 * contract tables: courses, modules, lessons, questions, exams, submissions,
 * announcements, students, enrollments. Purely presentational page copy — the
 * landing page's FAQ, the alumni directory, the notification list — lives in
 * `./screens/<view>.ts` and is imported by its screen directly. The line is
 * "would a customer expect to edit this in the dashboard?": if yes, it comes
 * through here.
 *
 * Everything here is read-only. Mutable demo state (progress, answers,
 * replies, grades, the demo clock) lives in the Zustand store, seeded once
 * from this seam.
 *
 * When `adm_pub_` publishable keys land, `setDataSource()` is where an
 * `AdminiumDataSource` gets swapped in — that is the whole point of the seam.
 */

import * as demo from "./demo";
import type {
  Announcement,
  Course,
  EnrolledCourse,
  ExamQuestion,
  FlatLesson,
  LessonKind,
  LessonKindMeta,
  LessonMeta,
  Module,
  Question,
  QueuedSubmission,
  StudentRow,
} from "./types";

/**
 * ── SIX RETURN TYPES USED TO SAY `typeof demo.X`, AND THAT IS A SEAM THAT
 *    CANNOT BE SWAPPED ───────────────────────────────────────────────────────
 *
 * `demo.INSTRUCTOR`, `demo.EXAM_RULES`, `demo.MY_ASSIGNMENT` and
 * `demo.LIVE_SESSION` are `as const` literals, so `typeof` them declared — in
 * the TYPE SYSTEM — that the instructor IS Yara Haddad, the exam IS 45 minutes
 * and the live session IS "Critique: your type specimens". A second
 * implementation could not return anything else without a type error. The seam
 * looked complete and was structurally unswappable, which is the exact failure
 * it exists to prevent, hiding in a return type.
 */
export interface Person {
  name: string;
  initials: string;
  /** A job title, not a name — so it is translated. */
  readonly role: string;
}

export interface StudentIdentity extends Person {
  email: string;
}

export interface ExamRules {
  durationMin: number;
  /** Seconds on the clock. */
  durationSec: number;
  questions: number;
  attemptsAllowed: number;
  passScore: number;
}

export interface MyAssignment {
  title: string;
  points: number;
  /** What the instructor awards when the demo grades it. */
  grade: number;
  body: string;
  files: readonly { n: string }[];
  briefFiles: readonly { n: string }[];
}

export interface LiveSession {
  title: string;
  /** Day offset from the week's Monday, and the hour it starts. */
  dayOffset: number;
  hour: number;
  durationMin: number;
  timezone: string;
}

export interface DataSource {
  /* identity */
  instructor(): Person;
  assistant(): Person;
  student(): StudentIdentity;

  /* catalogue */
  courses(): Course[];
  /** Never throws — falls back to the first course, as the comp does. */
  course(id: string | null | undefined): Course;
  learningOutcomes(): { t: string }[];

  /* curriculum */
  modules(): Module[];
  lessons(): FlatLesson[];
  lesson(id: string | null | undefined): FlatLesson | undefined;
  lessonKinds(): Record<LessonKind, LessonKindMeta>;
  lessonMeta(id: string): LessonMeta;

  /* Q&A */
  seedQuestions(): Question[];

  /* exams */
  exam(): ExamQuestion[];
  examRules(): ExamRules;

  /* the student's own work */
  myAssignment(): MyAssignment;

  /* instructor queues */
  submissions(): QueuedSubmission[];
  announcements(): Announcement[];

  /* people */
  students(): StudentRow[];
  cohortCapacity(): number;

  /* purchases */
  enrolled(): EnrolledCourse[];
  enrolledCourse(id: string): EnrolledCourse | undefined;
  /** Newest purchase first. */
  enrolledByDate(): EnrolledCourse[];
  nextOrderNo(): string;

  /* schedule */
  liveSession(): LiveSession;
  cohortWeeks(): number;
  totalLessons(): number;
}

/** Deep-ish clone so seeded collections handed to the store are never shared. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Every lesson in order, each carrying its owning module. */
function flatLessons(): FlatLesson[] {
  const out: FlatLesson[] = [];
  for (const m of demo.MODULES) {
    for (const l of m.lessons) out.push({ ...l, mod: m });
  }
  return out;
}

export const demoDataSource: DataSource = {
  instructor: () => demo.INSTRUCTOR,
  assistant: () => demo.ASSISTANT,
  student: () => demo.STUDENT,

  courses: () => demo.COURSES,
  course: (id) => demo.COURSES.find((c) => c.id === id) ?? demo.COURSES[0],
  learningOutcomes: () => demo.LEARN,

  modules: () => demo.MODULES,
  lessons: () => flatLessons(),
  lesson: (id) => (id ? flatLessons().find((l) => l.id === id) : undefined),
  lessonKinds: () => demo.KIND,
  lessonMeta: (id) => demo.LESSON_META[id] ?? demo.LESSON_META.L12,

  seedQuestions: () => clone(demo.QUESTIONS),

  exam: () => demo.EXAM,
  examRules: () => demo.EXAM_RULES,

  myAssignment: () => demo.MY_ASSIGNMENT,

  submissions: () => clone(demo.SUBMISSIONS),
  announcements: () => clone(demo.ANNOUNCEMENTS),

  students: () => demo.STUDENTS,
  cohortCapacity: () => demo.COHORT_CAPACITY,

  enrolled: () => demo.ENROLLED,
  enrolledCourse: (id) => demo.ENROLLED.find((e) => e.id === id),
  enrolledByDate: () => [...demo.ENROLLED].sort((a, b) => b.ts - a.ts),
  nextOrderNo: () => demo.NEXT_ORDER_NO,

  liveSession: () => demo.LIVE_SESSION,
  cohortWeeks: () => demo.COHORT_WEEKS,
  totalLessons: () => demo.TOTAL_LESSONS,
};

let active: DataSource = demoDataSource;

/** The live source. Screens should import this. */
export const dataSource: DataSource = new Proxy({} as DataSource, {
  get(_t, key: string) {
    return (active as unknown as Record<string, unknown>)[key];
  },
});

export function getDataSource(): DataSource {
  return active;
}

/** Swap the seam (tests, or a real backend). */
export function setDataSource(next: DataSource): void {
  active = next;
}

/**
 * True once a real backend is behind the seam.
 *
 * Read by the demo dock, which advances the drip clock, fills exam answers and
 * grades submissions: against a real cohort those controls either lie or do
 * damage, so it does not render.
 */
export function isConnected(): boolean {
  return active !== demoDataSource;
}
