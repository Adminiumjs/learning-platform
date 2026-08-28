// SPDX-License-Identifier: AGPL-3.0-only
/**
 * A `DataSource` backed by a real Adminium instance (28-public-surface.md §5.2,
 * 28-T28 wave 3).
 *
 * ── READS DO NOT BECOME ASYNC ──────────────────────────────────────────────
 * `loadSnapshot` fetches the whole read-set once, before React mounts, and
 * hands back the same SYNCHRONOUS shapes `demoDataSource` returns — so the
 * store, the schedule engine and all fifty-four screens are untouched.
 *
 * ── THE SIDE OF THE KEY DECIDES WHAT IS READ, AND THAT IS THE POINT ────────
 * §4's staff/customer split is not documentation here, it is a branch. A
 * CUSTOMER-side scope is one an operator hands out, so it reads the CATALOGUE
 * — courses, modules, lessons, instructors, the cohort's schedule and its
 * announcements — and nothing about a person. A STAFF-side scope additionally
 * reads students, their submissions and the Q&A thread. Getting this backwards
 * would put a cohort's names, e-mail-derived initials, grades and unsubmitted
 * work on a public course page.
 *
 * ── THE ANSWER KEY NEVER TRAVELS, ON EITHER SIDE ───────────────────────────
 * `exam_questions.answer` is not in the read-set. The demo ships its key in the
 * bundle and grades in the browser, which is fine for fiction and indefensible
 * against a real cohort: a staff-side build is still a browser, and a student
 * who can open the page can read the key. So connected mode carries questions
 * WITHOUT `a`, and the consequence is stated rather than hidden — client-side
 * grading has nothing to compare against and reports nothing. Grading belongs
 * to a server, which is 28-T36's work for this repo (and D7 already routes
 * essays to a human).
 *
 * ── IDENTITY IS NOT SOLVED, SO THE STUDENT'S OWN THINGS ARE EMPTY ──────────
 * `student()`, `myAssignment()`, `enrolled()` and `nextOrderNo()` describe ONE
 * signed-in learner. Nothing here knows who is reading, so they come back blank
 * rather than showing somebody else's purchases. They return when the claim
 * flow lands (§3.4, gated on O2).
 *
 * ── WHAT THE SCHEMA CANNOT SAY (WS-I gaps, marked not hidden) ──────────────
 * G-1 `courses.code` is the app's id and is TEXT — the good pattern. Everything
 *     below it (modules, lessons, students, submissions) is a `serial`, so
 *     those are row ids stringified: internally consistent, not portable.
 * G-2 There is no cover-file column, so the mono chip on a course cover is
 *     derived from its slug. Presentation, not data.
 * G-3 `LESSON_META` — a lesson's overview, resources and transcript — is app
 *     copy keyed by the SEED's lesson ids. A connected lesson id matches none
 *     of them, so the panel is empty rather than showing another lesson's
 *     transcript, which is what the seed's fallback would have done.
 * G-4 "Last active" has no column. It is derived from a student's most recent
 *     submission, and a student who has submitted nothing reads as never.
 * G-5 The landing page's learning outcomes are app copy with no table.
 */

import {
  createPublicClient,
  toTenantDay,
  type PublicClient,
  type PublicConfig,
} from "@adminiumjs/public-client";

import * as demo from "./demo";
import { withCourseDur, withLessonDur } from "./demo";
import type {
  Announcement,
  Course,
  CourseCategory,
  CourseLevel,
  EnrolledCourse,
  ExamQuestion,
  ExamQuestionKind,
  FlatLesson,
  LessonKind,
  LessonSeed,
  Module,
  Question,
  QueuedSubmission,
  StudentRow,
} from "./types";
import type { DataSource } from "./source";

/* --------------------------------------------------------------- the wire */

interface WireInstructor {
  id: number;
  name: string;
  initials: string;
}

interface WireStudent {
  id: number;
  name: string;
  initials: string;
}

interface WireCourse {
  id: number;
  code: string;
  title: string;
  slug: string;
  summary: string;
  tint: string;
  icon: string;
  /** `numeric` serializes as a STRING, not a number. */
  price: string;
  level: string;
  mode: string;
  status: string;
  category: string;
  instructor_id: number;
}

interface WireModule {
  id: number;
  course_id: number;
  title: string;
  position: number;
  week: number | null;
}

interface WireLesson {
  id: number;
  module_id: number;
  title: string;
  kind: LessonKind;
  duration_min: number;
  position: number;
}

interface WireCohort {
  id: number;
  course_id: number;
  starts_on: string;
  ends_on: string;
  capacity: number;
  status: string;
}

interface WireEnrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: string;
  progress_pct: number;
}

interface WireAssignment {
  id: number;
  lesson_id: number;
  title: string;
  due_at: string | null;
  points: number;
}

interface WireSubmission {
  id: number;
  assignment_id: number;
  enrollment_id: number;
  body: string;
  attachment: string;
  submitted_at: string;
  score: string | null;
}

interface WireExam {
  id: number;
  course_id: number;
  duration_min: number;
  attempts_allowed: number;
  pass_score: number;
}

interface WireExamQuestion {
  id: number;
  exam_id: number;
  prompt: string;
  kind: ExamQuestionKind;
  section: string;
  /** `jsonb`: parsed on postgres and mysql, TEXT on sqlite. */
  options: string[] | string | null;
  position: number;
}

interface WireAnnouncement {
  id: number;
  cohort_id: number;
  instructor_id: number;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

interface WireComment {
  id: number;
  lesson_id: number | null;
  enrollment_id: number | null;
  instructor_id: number | null;
  author_kind: "student" | "instructor";
  body: string;
  parent_id: number | null;
  created_at: string;
}

interface WireLiveSession {
  id: number;
  cohort_id: number;
  title: string;
  starts_at: string;
  duration_min: number;
}

/** The catalogue half — readable by a key an operator hands out. */
const PUBLIC_REFS = {
  instructors: ["id", "name", "initials"],
  courses: [
    "id", "code", "title", "slug", "summary", "tint", "icon",
    "price", "level", "mode", "status", "category", "instructor_id",
  ],
  modules: ["id", "course_id", "title", "position", "week"],
  lessons: ["id", "module_id", "title", "kind", "duration_min", "position"],
  cohorts: ["id", "course_id", "starts_on", "ends_on", "capacity", "status"],
  exams: ["id", "course_id", "duration_min", "attempts_allowed", "pass_score"],
  // NOTE the absence of `answer`. See the file header.
  examQuestions: ["id", "exam_id", "prompt", "kind", "section", "options", "position"],
  announcements: ["id", "cohort_id", "instructor_id", "title", "body", "pinned", "created_at"],
  liveSessions: ["id", "cohort_id", "title", "starts_at", "duration_min"],
};

/** The people half — a staff-side key only. */
const STAFF_REFS = {
  students: ["id", "name", "initials"],
  enrollments: ["id", "student_id", "course_id", "status", "progress_pct"],
  assignments: ["id", "lesson_id", "title", "due_at", "points"],
  submissions: [
    "id", "assignment_id", "enrollment_id", "body", "attachment", "submitted_at", "score",
  ],
  comments: [
    "id", "lesson_id", "enrollment_id", "instructor_id", "author_kind", "body",
    "parent_id", "created_at",
  ],
};

const LEVELS: Record<string, CourseLevel> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface Snapshot {
  side: PublicConfig["side"];
  instructor: { name: string; initials: string; role: string };
  assistant: { name: string; initials: string; role: string };
  courses: Course[];
  modules: Module[];
  lessons: FlatLesson[];
  questions: Question[];
  exam: ExamQuestion[];
  examRules: { durationMin: number; durationSec: number; questions: number; attemptsAllowed: number; passScore: number };
  submissions: QueuedSubmission[];
  announcements: Announcement[];
  students: StudentRow[];
  cohortCapacity: number;
  cohortWeeks: number;
  totalLessons: number;
  liveSession: { title: string; dayOffset: number; hour: number };
}

/**
 * The client, or null when either build-time variable is absent.
 *
 * The emptiness check is `createPublicClient`'s, not repeated here: it already
 * treats a missing or empty value as "this build has no server", and a second
 * copy of that rule is a second place for it to drift.
 */
export function clientFromEnv(): PublicClient | null {
  return createPublicClient({
    baseUrl: import.meta.env["VITE_ADMINIUM_API_BASE_URL"] as string | undefined,
    publishableKey: import.meta.env["VITE_ADMINIUM_PUBLISHABLE_KEY"] as string | undefined,
  });
}

/** Read a whole ref, a page at a time, at whatever size the scope permits. */
async function listAll<T>(
  client: PublicClient,
  ref: string,
  size: number,
  max: number,
): Promise<T[]> {
  const out: T[] = [];
  const page = Math.max(1, Math.min(size, 500));
  for (let offset = 0; offset < max; offset += page) {
    const res = await client.list<T>(ref, { limit: page, offset });
    out.push(...res.data);
    if (res.data.length < page) return out;
  }
  console.warn(`[adminium] ${ref}: stopped at ${String(max)} rows — the rest were not read.`);
  return out;
}

/** `jsonb` arrives parsed on postgres and mysql, and as text on sqlite. */
function optionsOf(value: string[] | string | null): string[] | undefined {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fetch the read-set and map it into the app's shapes.
 *
 * Returns `null` on ANY failure so the caller falls back to demo mode
 * structurally rather than in a catch — the marketplace demos are static clones
 * with no server and must keep working byte-identically.
 */
export async function loadSnapshot(client: PublicClient): Promise<Snapshot | null> {
  try {
    const config = await client.config();
    const staff = config.side === "staff";
    await client.assertRefs(staff ? { ...PUBLIC_REFS, ...STAFF_REFS } : PUBLIC_REFS);

    const tz = config.timezone;
    const cap = (ref: string): number => config.refs[ref]?.limit ?? 100;

    const [instructors, courses, modules, lessons, cohorts, exams, examQuestions, announcements, liveSessions] =
      await Promise.all([
        listAll<WireInstructor>(client, "instructors", cap("instructors"), 1_000),
        listAll<WireCourse>(client, "courses", cap("courses"), 5_000),
        listAll<WireModule>(client, "modules", cap("modules"), 20_000),
        listAll<WireLesson>(client, "lessons", cap("lessons"), 100_000),
        listAll<WireCohort>(client, "cohorts", cap("cohorts"), 5_000),
        listAll<WireExam>(client, "exams", cap("exams"), 5_000),
        listAll<WireExamQuestion>(client, "examQuestions", cap("examQuestions"), 50_000),
        listAll<WireAnnouncement>(client, "announcements", cap("announcements"), 20_000),
        listAll<WireLiveSession>(client, "liveSessions", cap("liveSessions"), 20_000),
      ]);

    /* The people half. A customer-side key never asks for these, which is
     * stronger than asking and discarding: a ref that is not read cannot leak. */
    const [students, enrollments, assignments, submissions, comments] = staff
      ? await Promise.all([
          listAll<WireStudent>(client, "students", cap("students"), 50_000),
          listAll<WireEnrollment>(client, "enrollments", cap("enrollments"), 100_000),
          listAll<WireAssignment>(client, "assignments", cap("assignments"), 20_000),
          listAll<WireSubmission>(client, "submissions", cap("submissions"), 100_000),
          listAll<WireComment>(client, "comments", cap("comments"), 100_000),
        ])
      : [[], [], [], [], []] as [
          WireStudent[], WireEnrollment[], WireAssignment[], WireSubmission[], WireComment[],
        ];

    const teacherOf = new Map(instructors.map((i) => [i.id, i]));
    const first = instructors[0];
    const second = instructors[1] ?? first;

    /* --- the catalogue ------------------------------------------------ */

    /* A draft or archived course is not on the shelf. Showing one would put a
     * half-written syllabus on a public catalogue page. */
    const published = courses.filter((c) => c.status === "published");

    const modulesByCourse = new Map<number, WireModule[]>();
    for (const row of modules) {
      const list = modulesByCourse.get(row.course_id) ?? [];
      list.push(row);
      modulesByCourse.set(row.course_id, list);
    }
    const lessonsByModule = new Map<number, WireLesson[]>();
    for (const row of lessons) {
      const list = lessonsByModule.get(row.module_id) ?? [];
      list.push(row);
      lessonsByModule.set(row.module_id, list);
    }

    /* The app draws ONE cohort course's curriculum. The first published course
     * with modules is it — a stable rule, so the drip does not reshuffle. */
    const primary = published.find((c) => (modulesByCourse.get(c.id) ?? []).length > 0) ?? published[0];

    const mappedModules: Module[] = [];
    const flat: FlatLesson[] = [];
    if (primary !== undefined) {
      const own = (modulesByCourse.get(primary.id) ?? []).sort((a, b) => a.position - b.position);
      own.forEach((row, index) => {
        const seeds: LessonSeed[] = (lessonsByModule.get(row.id) ?? [])
          .sort((a, b) => a.position - b.position)
          .map((l) => ({
            id: String(l.id),
            title: l.title,
            kind: l.kind,
            // Graded work is measured in points and everything else in time.
            // The schema has one duration column, so a graded lesson's points
            // come from its assignment when there is one, and nothing when not.
            ...(l.kind === "assignment" || l.kind === "exam"
              ? { pts: assignments.find((a) => a.lesson_id === l.id)?.points ?? 0 }
              : { secs: l.duration_min * 60 }),
            // WS-I G-2: no file column, so the mono chip is derived.
            file: `${slugify(l.title)}.mp4`,
          }));
        const mod: Module = {
          id: String(row.id),
          num: String(index + 1).padStart(2, "0"),
          title: row.title,
          // A self-paced course has no week; nothing locks, so week 1 is right.
          week: row.week ?? 1,
          lessons: seeds.map(withLessonDur),
        };
        mappedModules.push(mod);
        for (const lesson of mod.lessons) flat.push({ ...lesson, mod });
      });
    }

    const lessonCount = new Map<number, number>();
    for (const row of lessons) {
      const module = modules.find((m) => m.id === row.module_id);
      if (module === undefined) continue;
      lessonCount.set(module.course_id, (lessonCount.get(module.course_id) ?? 0) + 1);
    }
    const minutesOf = new Map<number, number>();
    for (const row of lessons) {
      const module = modules.find((m) => m.id === row.module_id);
      if (module === undefined) continue;
      minutesOf.set(module.course_id, (minutesOf.get(module.course_id) ?? 0) + row.duration_min);
    }

    const mappedCourses: Course[] = published.map((row) => {
      const teacher = teacherOf.get(row.instructor_id);
      return withCourseDur({
        // WS-I G-1: `code` is TEXT and is the app's own id — the good pattern.
        id: row.code,
        title: row.title,
        cat: row.category as CourseCategory,
        level: LEVELS[row.level] ?? "Beginner",
        kind: row.mode === "cohort" ? "cohort" : "self",
        price: Number(row.price),
        lessons: lessonCount.get(row.id) ?? 0,
        durMin: minutesOf.get(row.id) ?? 0,
        tint: row.tint,
        icon: row.icon,
        // WS-I G-2: presentation, derived from the slug.
        file: `${row.slug}.webp`,
        teacher: teacher?.name ?? "",
        teacherIni: teacher?.initials ?? "",
        blurb: row.summary,
      });
    });

    /* --- the cohort, its schedule and its noticeboard ------------------ */

    const cohort =
      cohorts.find((c) => primary !== undefined && c.course_id === primary.id && c.status === "active") ??
      cohorts.find((c) => primary !== undefined && c.course_id === primary.id) ??
      cohorts[0];

    const session = liveSessions
      .filter((s) => cohort !== undefined && s.cohort_id === cohort.id)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

    const mappedAnnouncements: Announcement[] = announcements
      .filter((a) => cohort === undefined || a.cohort_id === cohort.id)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at))
      .map((row) => ({
        id: String(row.id),
        title: row.title,
        pinned: row.pinned,
        at: toTenantDay(row.created_at, tz),
        sent: teacherOf.get(row.instructor_id)?.name ?? "",
        body: row.body,
      }));

    /* --- the exam, without its answer key ------------------------------ */

    const exam = exams.find((e) => primary !== undefined && e.course_id === primary.id) ?? exams[0];
    const questions: ExamQuestion[] = examQuestions
      .filter((q) => exam !== undefined && q.exam_id === exam.id)
      .sort((a, b) => a.position - b.position)
      .map((row) => {
        const mapped: ExamQuestion = {
          id: row.id,
          kind: row.kind,
          sec: row.section,
          q: row.prompt,
        };
        const opts = optionsOf(row.options);
        if (opts !== undefined) mapped.opts = opts;
        // `a` is deliberately never set. See the file header.
        return mapped;
      });

    /* --- the people half ----------------------------------------------- */

    const studentOf = new Map(students.map((s) => [s.id, s]));
    const enrolmentOf = new Map(enrollments.map((e) => [e.id, e]));
    const assignmentOf = new Map(assignments.map((a) => [a.id, a]));
    const lessonTitle = new Map(lessons.map((l) => [l.id, l.title]));

    const lastActive = new Map<number, string>();
    for (const row of submissions) {
      const enrolment = enrolmentOf.get(row.enrollment_id);
      if (enrolment === undefined) continue;
      const held = lastActive.get(enrolment.student_id);
      if (held === undefined || row.submitted_at > held) {
        lastActive.set(enrolment.student_id, row.submitted_at);
      }
    }
    const gradeOf = new Map<number, { total: number; count: number }>();
    for (const row of submissions) {
      if (row.score === null) continue;
      const enrolment = enrolmentOf.get(row.enrollment_id);
      if (enrolment === undefined) continue;
      const held = gradeOf.get(enrolment.student_id) ?? { total: 0, count: 0 };
      const assignment = assignmentOf.get(row.assignment_id);
      const max = assignment?.points ?? 0;
      if (max > 0) {
        held.total += (Number(row.score) / max) * 100;
        held.count += 1;
        gradeOf.set(enrolment.student_id, held);
      }
    }

    const cohortEnrolments = enrollments.filter(
      (e) => primary !== undefined && e.course_id === primary.id,
    );
    const mappedStudents: StudentRow[] = cohortEnrolments.flatMap((e) => {
      const student = studentOf.get(e.student_id);
      if (student === undefined) return [];
      const grades = gradeOf.get(e.student_id);
      const seen = lastActive.get(e.student_id);
      return [
        [
          student.name,
          e.progress_pct,
          // WS-I G-4: no "last active" column. A student who has submitted
          // nothing reads as an em dash rather than as "just now".
          seen === undefined ? "—" : toTenantDay(seen, tz),
          grades === undefined ? 0 : Math.round(grades.total / grades.count),
        ] as StudentRow,
      ];
    });

    const queue: QueuedSubmission[] = submissions
      .filter((row) => row.score === null)
      .flatMap((row) => {
        const enrolment = enrolmentOf.get(row.enrollment_id);
        const assignment = assignmentOf.get(row.assignment_id);
        if (enrolment === undefined || assignment === undefined) return [];
        const student = studentOf.get(enrolment.student_id);
        if (student === undefined) return [];
        const late = assignment.due_at !== null && row.submitted_at > assignment.due_at;
        return [
          {
            id: String(row.id),
            who: student.name,
            ini: student.initials,
            item: assignment.title,
            kind: lessonTitle.get(assignment.lesson_id) ?? "",
            max: assignment.points,
            at: toTenantDay(row.submitted_at, tz),
            // `tag` is the machine token grading switches tone on, so it must
            // NOT move with the language; `tagLabel` is the same badge spelled
            // for a reader, and there is no locale here to spell it in.
            tag: late ? "late" : "new",
            tagLabel: late ? "late" : "new",
            work: row.body,
            files: row.attachment.length === 0 ? [] : [{ n: row.attachment }],
          },
        ];
      });

    const threads: Question[] = comments
      .filter((c) => c.parent_id === null && c.lesson_id !== null)
      .map((row) => {
        const enrolment = row.enrollment_id === null ? undefined : enrolmentOf.get(row.enrollment_id);
        const student = enrolment === undefined ? undefined : studentOf.get(enrolment.student_id);
        const reply = comments.find((c) => c.parent_id === row.id);
        const replier =
          reply === undefined || reply.instructor_id === null
            ? undefined
            : teacherOf.get(reply.instructor_id);
        return {
          id: String(row.id),
          who: student?.name ?? teacherOf.get(row.instructor_id ?? -1)?.name ?? "",
          ini: student?.initials ?? teacherOf.get(row.instructor_id ?? -1)?.initials ?? "",
          lesson: lessonTitle.get(row.lesson_id ?? -1) ?? "",
          at: toTenantDay(row.created_at, tz),
          // Nothing here knows who is reading, so no thread is "mine".
          mine: false,
          text: row.body,
          reply:
            reply === undefined
              ? null
              : {
                  who: replier?.name ?? "",
                  ini: replier?.initials ?? "",
                  at: toTenantDay(reply.created_at, tz),
                  text: reply.body,
                },
        };
      });

    const weeks =
      cohort === undefined
        ? 0
        : Math.max(
            1,
            Math.round(
              (Date.parse(`${cohort.ends_on}T00:00:00Z`) - Date.parse(`${cohort.starts_on}T00:00:00Z`)) /
                (7 * 86_400_000),
            ),
          );

    return {
      side: config.side,
      instructor: { name: first?.name ?? "", initials: first?.initials ?? "", role: "" },
      assistant: { name: second?.name ?? "", initials: second?.initials ?? "", role: "" },
      courses: mappedCourses,
      modules: mappedModules,
      lessons: flat,
      questions: threads,
      exam: questions,
      examRules: {
        durationMin: exam?.duration_min ?? 0,
        durationSec: (exam?.duration_min ?? 0) * 60,
        questions: questions.length,
        attemptsAllowed: exam?.attempts_allowed ?? 0,
        passScore: exam?.pass_score ?? 0,
      },
      submissions: queue,
      announcements: mappedAnnouncements,
      students: mappedStudents,
      cohortCapacity: cohort?.capacity ?? 0,
      cohortWeeks: weeks,
      totalLessons: flat.length,
      liveSession: session === undefined
        ? { title: "", dayOffset: 0, hour: 0 }
        : {
            title: session.title,
            dayOffset: new Date(`${toTenantDay(session.starts_at, tz)}T00:00:00Z`).getUTCDay(),
            hour: hourOf(session.starts_at, tz),
          },
    };
  } catch (error) {
    console.warn("[adminium] connected mode unavailable, using demo data:", error);
    return null;
  }
}

/** The hour of an instant, in the TENANT's zone rather than the reader's. */
function hourOf(iso: string, timezone: string): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", hour12: false })
      .format(new Date(iso)),
  );
}

/** "Type specimen page" → "type-specimen-page". WS-I G-2: presentation only. */
function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** A synchronous `DataSource` over an already-fetched snapshot. */
export function snapshotSource(snap: Snapshot): DataSource {
  const flat = (): FlatLesson[] => snap.lessons;
  return {
    instructor: () => ({ ...demo.INSTRUCTOR, ...snap.instructor, role: demo.INSTRUCTOR.role }),
    assistant: () => ({ ...demo.ASSISTANT, ...snap.assistant, role: demo.ASSISTANT.role }),
    // Identity is not solved: nothing here knows who is reading. See the header.
    student: () => ({ ...demo.STUDENT, name: "", initials: "", email: "" }),

    courses: () => snap.courses,
    course: (id) => snap.courses.find((c) => c.id === id) ?? snap.courses[0] ?? demo.COURSES[0],
    // WS-I G-5: app copy, no table.
    learningOutcomes: () => demo.LEARN,

    modules: () => snap.modules,
    lessons: flat,
    lesson: (id) => (id ? flat().find((l) => l.id === id) : undefined),
    // Icons and labels for the five kinds: code, not rows.
    lessonKinds: () => demo.KIND,
    // WS-I G-3: keyed by the SEED's lesson ids, which no connected lesson has.
    // Empty rather than another lesson's transcript.
    lessonMeta: () => ({ overview: "", points: [], files: [], transcript: [] }),

    seedQuestions: () => snap.questions.map((q) => ({ ...q })),

    exam: () => snap.exam.map((q) => ({ ...q })),
    examRules: () => snap.examRules,

    myAssignment: () => ({ ...demo.MY_ASSIGNMENT, title: "", body: "", files: [], briefFiles: [] }),

    submissions: () => snap.submissions.map((s) => ({ ...s, files: [...s.files] })),
    announcements: () => snap.announcements.map((a) => ({ ...a })),

    students: () => snap.students.map((s) => [...s] as StudentRow),
    cohortCapacity: () => snap.cohortCapacity,

    // Identity again: these describe one learner's purchases.
    enrolled: (): EnrolledCourse[] => [],
    enrolledCourse: () => undefined,
    enrolledByDate: (): EnrolledCourse[] => [],
    nextOrderNo: () => "",

    liveSession: () => ({ ...demo.LIVE_SESSION, ...snap.liveSession }),
    cohortWeeks: () => snap.cohortWeeks,
    totalLessons: () => snap.totalLessons,
  };
}
