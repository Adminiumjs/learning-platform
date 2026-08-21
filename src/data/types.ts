/*
 * Domain types for the Learning Platform demo.
 *
 * Ported from the Yara's Academy comp. Every collection the screens read is
 * typed here; the seeded values live in `./demo.ts` (shared, contract-table
 * data) or `./screens/<view>.ts` (page-local presentational seed), and the
 * shared half is reached through the DataSource seam in `./source.ts`.
 *
 * Naming note: the fictional school is "Yara's Academy"; course codes carry a
 * subject prefix (`DS-101`, `TY-140`…) and order numbers carry `YA-`.
 */

/* ------------------------------------------------------------------ views */

/** The 37 student-facing screens. */
export type StudentViewId =
  | "catalog"
  | "landing"
  | "course"
  | "checkout"
  | "learning"
  | "classroom"
  | "qa"
  | "board"
  | "rooms"
  | "assignment"
  | "peer"
  | "exam"
  | "grades"
  | "streaks"
  | "certificate"
  | "archive"
  | "reviews"
  | "alumni"
  | "live"
  | "mobile"
  | "downloads"
  | "search"
  | "notifs"
  | "notes"
  | "saved"
  | "compare"
  | "billing"
  | "seats"
  | "teambilling"
  | "refund"
  | "scholarship"
  | "profile"
  | "signin"
  | "onboarding"
  | "empty"
  | "offline"
  | "404";

/** The 17 instructor-facing screens. */
export type InstructorViewId =
  | "teach"
  | "teachonboard"
  | "content"
  | "grading"
  | "inbox"
  | "announce"
  | "roster"
  | "student"
  | "messages"
  | "editor"
  | "lessoned"
  | "exambuilder"
  | "cohort"
  | "waitlist"
  | "certificates"
  | "analytics"
  | "payouts";

/** The 54 real screens. `view` in the store is one of these — no router. */
export type ViewId = StudentViewId | InstructorViewId;

/** Which half of the app a screen belongs to. Drives the dock and the nav. */
export type Persona = "student" | "instructor";

export type ThemeName = "light" | "dark";

/** Course delivery mode. The dock's segmented control flips this globally. */
export type CourseMode = "self" | "cohort";

/* ---------------------------------------------------------------- catalog */

export type CourseCategory = "design" | "typography" | "motion" | "portfolio";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
/** A course is either open-ended or runs as a dated cohort. */
export type CourseKind = "self" | "cohort";

export interface Course {
  /** Course code, e.g. `DS-101`. Doubles as the id. */
  id: string;
  title: string;
  cat: CourseCategory;
  level: CourseLevel;
  kind: CourseKind;
  price: number;
  lessons: number;
  /**
   * Total runtime, already rendered — "8h 40m", "8 Std. 40 Min.", "٨ س ٤٠ د".
   *
   * A GETTER on the seed record, never a stored string: it used to be the
   * literal "8h 40m", which shipped an English "h" and Latin digits to all
   * eight locales. The seed now carries `durMin` and this formats it.
   */
  dur: string;
  /** Per-course tint for the gradient cover. */
  tint: string;
  /** Lucide icon name for the cover. */
  icon: string;
  /** Mono filename chip shown on the cover — there is no real image. */
  file: string;
  teacher: string;
  teacherIni: string;
  blurb: string;
}

/* -------------------------------------------------------------- curriculum */

export type LessonKind = "video" | "reading" | "assignment" | "exam" | "live";

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  /**
   * The chip on the lesson row — "18:30" for a video, "9 min" for a reading,
   * "20 pts" for an assignment. A GETTER, for the same reason as `Course.dur`:
   * the minutes marker and the digits both belong to the reader.
   */
  dur: string;
  /** Runtime in seconds. Absent on graded work, which is measured in points. */
  secs?: number;
  /** What a graded lesson is worth. Absent on everything else. */
  pts?: number;
  file: string;
}

/** What the seed in `demo.ts` writes down, before `dur` is attached. */
export type LessonSeed = Omit<Lesson, "dur">;

/** What the seed writes down for a course, before `dur` is attached. */
export type CourseSeed = Omit<Course, "dur"> & { durMin: number };

/** A module as the seed writes it — its lessons have no `dur` yet. */
export type ModuleSeed = Omit<Module, "lessons"> & { lessons: LessonSeed[] };

export interface Module {
  id: string;
  /** Zero-padded display number, e.g. "03". */
  num: string;
  title: string;
  /**
   * The cohort week this module unlocks in (1-based). In cohort mode a module
   * is locked while `week > demoClock.week`; in self-paced mode nothing locks.
   * This is the whole of the D6 drip rule — see `lib/schedule.ts`.
   */
  week: number;
  lessons: Lesson[];
}

/** A lesson with its owning module attached — what `allLessons()` returns. */
export interface FlatLesson extends Lesson {
  mod: Module;
}

export interface LessonKindMeta {
  /** Lucide icon name. */
  i: string;
  /** Human label. */
  l: string;
}

export interface TranscriptRow {
  /** "mm:ss" cue. */
  t: string;
  s: string;
}

export interface LessonMeta {
  overview: string;
  points: { t: string }[];
  files: { n: string }[];
  transcript: TranscriptRow[];
}

/* --------------------------------------------------------------------- Q&A */

export interface QuestionReply {
  who: string;
  ini: string;
  at: string;
  text: string;
}

export interface Question {
  id: string;
  who: string;
  ini: string;
  /** Title of the lesson the question hangs off. */
  lesson: string;
  at: string;
  /** True when the signed-in student is the author. */
  mine: boolean;
  text: string;
  reply?: QuestionReply | null;
}

/* -------------------------------------------------------------------- exam */

export type ExamQuestionKind = "single" | "multi" | "short" | "essay";

/**
 * One exam question. The answer key's shape follows `kind`:
 *   single → the index of the right option
 *   multi  → the set of right option indices (exact match required)
 *   short  → accepted answers, compared case/whitespace-insensitively
 *   essay  → no key at all; always routed to a human (D7)
 */
export interface ExamQuestion {
  id: number;
  kind: ExamQuestionKind;
  /** Section name, used for the per-section breakdown on the result screen. */
  sec: string;
  q: string;
  opts?: string[];
  a?: number | number[] | string[];
}

/** What a student has entered for one question. */
export type ExamAnswer = number | number[] | string | undefined;

export interface ExamSectionScore {
  /** Correct. */
  c: number;
  /** Total. */
  t: number;
}

export interface ExamScore {
  correct: number;
  total: number;
  pct: number;
  bySec: Record<string, ExamSectionScore>;
}

/* -------------------------------------------------------------- assignment */

/** Where the student's own assignment sits. Drives three different cards. */
export type SubmissionState = "draft" | "submitted" | "graded";

export interface AttachedFile {
  n: string;
}

/** A submission in the instructor's grading queue. */
export interface QueuedSubmission {
  id: string;
  who: string;
  ini: string;
  item: string;
  /** "Assignment", "Assignment · late", "Essay". */
  kind: string;
  max: number;
  at: string;
  /**
   * The badge's machine token — "2h", "late", "essay". Grading switches its
   * tone on `tag === "late"`, so this must NOT move with the language.
   */
  tag: string;
  /** The same badge, spelled for the reader. This is what gets drawn. */
  tagLabel: string;
  work: string;
  files: AttachedFile[];
}

/* ------------------------------------------------------------------ people */

/**
 * A cohort student, in the comp's positional shape:
 *   [name, progress percent, last active, grade average]
 */
export type StudentRow = [string, number, string, number];

export interface Announcement {
  id: string;
  title: string;
  pinned: boolean;
  at: string;
  sent: string;
  body: string;
}

/* -------------------------------------------------------- the demo account */

/** A course the signed-in student has bought, for archive + billing. */
export interface EnrolledCourse {
  id: string;
  title: string;
  tint: string;
  icon: string;
  state: "active" | "paused" | "retired";
  /** Lessons completed. `null` for the cohort course, which reads live. */
  done: number | null;
  total: number;
  next?: string;
  price: number;
  order: string;
  date: string;
  /** Sortable stamp, `YYYYMMDD`. */
  ts: number;
}

/* ------------------------------------------------------------------ chrome */

export interface ToastState {
  msg: string;
  /** Lucide icon name. */
  icon: string;
  actionLabel?: string;
  action?: () => void;
}

export interface ModalState {
  title: string;
  body: string;
  icon?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
}

export interface NavLink {
  label: string;
  view: ViewId;
  icon: string;
}

/** One chip in the demo dock's screen picker. */
export interface DockScreen {
  view: ViewId;
  label: string;
  icon: string;
}

/** A per-screen action button in the dock. */
export interface DockAction {
  label: string;
  icon: string;
  run: () => void;
}
