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

export interface DataSource {
  /* identity */
  instructor(): typeof demo.INSTRUCTOR;
  assistant(): typeof demo.ASSISTANT;
  student(): typeof demo.STUDENT;

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
  examRules(): typeof demo.EXAM_RULES;

  /* the student's own work */
  myAssignment(): typeof demo.MY_ASSIGNMENT;

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
  liveSession(): typeof demo.LIVE_SESSION;
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

/** Swap the seam (tests, or a future real backend). */
export function setDataSource(next: DataSource): void {
  active = next;
}
