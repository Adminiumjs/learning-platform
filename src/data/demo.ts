/*
 * The seeded academy — shared demo data.
 *
 * This file holds the collections that map onto the manifest's contract
 * tables (courses, modules, lessons, questions, exams, submissions,
 * announcements, students, enrollments). Screens never import it directly;
 * they go through the `dataSource` seam in `./source.ts` so the dataset can
 * be swapped for a real API without touching a screen.
 *
 * Page-local presentational seed — the landing page's FAQ, the alumni
 * directory rows, the notification list and so on — lives in
 * `./screens/<view>.ts` beside the screen that renders it. The line is
 * "would this be a row in the customer's database?": if yes it belongs here.
 *
 * Everything below is demo fiction under /demo/**, exempt from the launch
 * copy sweep (18 §3.4). Prices, seat counts and order numbers are props.
 *
 * Translation. The fiction stays English — course titles, blurbs, the exam
 * paper, the students' names and every word they wrote. What does NOT stay
 * English is the handful of fields that are really UI vocabulary wearing a
 * record's clothes: the three roles and the five lesson-kind labels. Those are
 * getters (see `./format` for why), so they follow the reader's language.
 *
 * The collections `source.ts` hands out through `structuredClone` — questions,
 * submissions, announcements — DO carry getters for their timestamps, and that
 * is safe because every one of those accessors is called per render:
 * `dataSource.submissions()` and `.announcements()` clone on each call, and
 * `lib/thread.ts`'s `questionList` re-spreads `QUESTIONS` on each call. The
 * clone therefore happens after <App> has pushed the live locale into the
 * ambient bridge, and the value it freezes is this render's, not module load's.
 * A getter added to a collection that is cloned ONCE at start-up would freeze
 * in English — that is the trap, not getters as such.
 */

import { locale, number, t } from "../i18n/ambient";
import { ago, clock, shortUnit } from "./format";
import type {
  Announcement,
  Course,
  CourseSeed,
  EnrolledCourse,
  ExamQuestion,
  Lesson,
  LessonKind,
  LessonKindMeta,
  LessonMeta,
  LessonSeed,
  Module,
  ModuleSeed,
  Question,
  QueuedSubmission,
  StudentRow,
} from "./types";

/* ------------------------------------------------------------- the people */

export const INSTRUCTOR = {
  name: "Yara Haddad",
  initials: "YH",
  /** A job title, not a name — so it is translated. */
  get role() {
    return t("data.role.instructor");
  },
};

export const ASSISTANT = {
  name: "Nadia Brandt",
  initials: "NB",
  get role() {
    return t("data.role.assistant");
  },
};

export const STUDENT = {
  name: "Rosa Marchetti",
  initials: "RM",
  get role() {
    return t("data.role.student");
  },
  email: "rosa@marchetti.studio",
};

/* ------------------------------------------------------------------ dates */

/**
 * Week 1 of the cohort starts Monday 20 July 2026.
 *
 * The demo clock counts weeks from here; nothing in the app reads the real
 * `Date.now()` for anything a viewer can see, so a lesson that is locked is
 * locked on every machine on every day (D6). See `lib/schedule.ts`.
 */
export const COHORT_WEEK_ONE = { year: 2026, month: 6, day: 20 } as const;

/** The cohort runs eight weeks. */
export const COHORT_WEEKS = 8;

/** Total lessons in the cohort course — the progress denominator. */
export const TOTAL_LESSONS = 22;

/* ------------------------------------------------------------ timestamps */

/*
 * The seed used to write its timestamps out in English — "2h ago", "Yesterday
 * 21:04", "Mon 3 Aug · 09:12", "Just now". They are now derived: relative ones
 * from `Intl.RelativeTimeFormat` via `../format`'s `ago`, absolute ones from a
 * real instant on the demo clock. CLDR owns the phrasing, so Arabic gets its
 * dual ("منذ ساعتين") without anyone here knowing Arabic has a dual.
 */

/** A day on the demo clock: `week` (1-based) plus a 0–6 offset from Monday. */
function cohortDay(week: number, dayOffset: number): Date {
  const d = new Date(COHORT_WEEK_ONE.year, COHORT_WEEK_ONE.month, COHORT_WEEK_ONE.day);
  d.setDate(d.getDate() + 7 * (Math.max(1, week) - 1) + dayOffset);
  return d;
}

/**
 * "Mon 3 Aug · 09:12" — a dated stamp in the reader's own field order.
 *
 * Built with `Intl` here rather than borrowed from `lib/schedule.ts`: that
 * module imports this one, so reaching back would be a cycle.
 */
function stamp(day: Date, hour: number, minute: number): string {
  const date = new Intl.DateTimeFormat(locale(), {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(day);
  return `${date} · ${clock(hour, minute)}`;
}

/* --------------------------------------------------------- duration chips */

/*
 * `dur` is the one field on a course or a lesson that is INTERFACE rather
 * than fiction. The titles, blurbs and lesson names below stay English on
 * purpose (18 §3.4); "8h 40m", "9 min" and "20 pts" never should have — the
 * unit markers are English words and the digits are Latin.
 *
 * The seed now carries numbers (`durMin`, `secs`, `pts`) and the two helpers
 * below attach `dur` as a GETTER, so it is formatted at render — after <App>
 * has pushed the live locale into the ambient bridge — and not frozen into
 * English at module load. Same trap `data/format.ts` documents.
 */

/** "8h 40m" / "8 Std. 40 Min." / "٨ س ٤٠ د" — a course's total runtime. */
function withCourseDur(seed: CourseSeed): Course {
  return {
    ...seed,
    get dur() {
      const h = Math.floor(seed.durMin / 60);
      const m = seed.durMin % 60;
      return `${shortUnit(h, "hour")} ${shortUnit(m, "minute")}`;
    },
  };
}

/** The chip on a lesson row: mm:ss for video, minutes for prose, points for graded work. */
function withLessonDur(seed: LessonSeed): Lesson {
  return {
    ...seed,
    get dur() {
      if (seed.pts !== undefined) {
        return t("data.lesson.points", { count: number(seed.pts) }, seed.pts);
      }
      const s = seed.secs ?? 0;
      /* Video is scrubbed to the second, so it keeps a clock. Everything else
         is read or attended, and a round minute count is what the comp shows.
         `short` not `narrow` here — the comp's chip is "9 min", where a course
         total's tighter "8h 40m" wants the narrow form. */
      return seed.kind === "video"
        ? clock(Math.floor(s / 60), s % 60)
        : number(Math.round(s / 60), {
            style: "unit",
            unit: "minute",
            unitDisplay: "short",
          });
    },
  };
}

/* ---------------------------------------------------------------- catalog */

const COURSE_SEED: CourseSeed[] = [
  {
    id: "DS-101",
    title: "Design Systems from Scratch",
    cat: "design",
    level: "Intermediate",
    kind: "cohort",
    price: 180,
    lessons: 22,
    durMin: 520,
    tint: "#7c3aed",
    icon: "layout-grid",
    file: "ds101_cover.png",
    teacher: "Yara Haddad",
    teacherIni: "YH",
    blurb:
      "Build a real system from an honest audit to a documented, shipped library. Eight weeks, weekly critique, and one very stubborn button component.",
  },
  {
    id: "TY-140",
    title: "Type & Layout Fundamentals",
    cat: "typography",
    level: "Beginner",
    kind: "self",
    price: 95,
    lessons: 18,
    durMin: 365,
    tint: "#2563eb",
    icon: "type",
    file: "ty140_cover.png",
    teacher: "Yara Haddad",
    teacherIni: "YH",
    blurb:
      "Scales, measure, rhythm, and the small decisions that make a page feel calm. Start today and take as long as you like.",
  },
  {
    id: "MO-220",
    title: "Motion for Interfaces",
    cat: "motion",
    level: "Advanced",
    kind: "self",
    price: 120,
    lessons: 14,
    durMin: 320,
    tint: "#0d9488",
    icon: "orbit",
    file: "mo220_cover.png",
    teacher: "Nadia Brandt",
    teacherIni: "NB",
    blurb:
      "Easing, duration, and choreography for interfaces that explain themselves. Motion as a sentence, not a firework.",
  },
  {
    id: "PF-310",
    title: "Portfolio Studio",
    cat: "portfolio",
    level: "Intermediate",
    kind: "cohort",
    price: 150,
    lessons: 12,
    durMin: 270,
    tint: "#e11d48",
    icon: "briefcase",
    file: "pf310_cover.png",
    teacher: "Yara Haddad",
    teacherIni: "YH",
    blurb:
      "Six weeks of writing, editing and cutting until three case studies say exactly what you did and why it mattered.",
  },
];

export const COURSES: Course[] = COURSE_SEED.map(withCourseDur);

/** "What you'll learn" for the cohort course. */
export const LEARN: { t: string }[] = [
  { t: "Audit an existing interface without drowning in screenshots" },
  { t: "Name things so the next person understands them" },
  { t: "Build a token layer that survives a rebrand" },
  { t: "Design components with states, not just happy paths" },
  { t: "Make dark mode a decision, not a rewrite" },
  { t: "Write docs your engineers actually read" },
];

/* ------------------------------------------------------------- curriculum */

const MODULE_SEED: ModuleSeed[] = [
  {
    id: "m1",
    num: "01",
    title: "Foundations",
    week: 1,
    lessons: [
      {
        id: "L1",
        title: "Why systems win",
        kind: "video",
        secs: 500,
        file: "lesson_01_why.mp4",
      },
      {
        id: "L2",
        title: "Inventory your UI",
        kind: "video",
        secs: 760,
        file: "lesson_02_inventory.mp4",
      },
      {
        id: "L3",
        title: "Naming things",
        kind: "reading",
        secs: 540,
        file: "naming_things.md",
      },
      {
        id: "L4",
        title: "Primitives vs components",
        kind: "video",
        secs: 845,
        file: "lesson_04_primitives.mp4",
      },
      {
        id: "L5",
        title: "Audit walkthrough",
        kind: "video",
        secs: 690,
        file: "lesson_05_audit.mp4",
      },
    ],
  },
  {
    id: "m2",
    num: "02",
    title: "Colour and tokens",
    week: 2,
    lessons: [
      {
        id: "L6",
        title: "Colour that scales",
        kind: "video",
        secs: 910,
        file: "lesson_06_colour.mp4",
      },
      {
        id: "L7",
        title: "Token layers",
        kind: "video",
        secs: 805,
        file: "lesson_07_tokens.mp4",
      },
      {
        id: "L8",
        title: "Contrast in practice",
        kind: "reading",
        secs: 420,
        file: "contrast_notes.md",
      },
      {
        id: "L9",
        title: "Dark mode without a rewrite",
        kind: "video",
        secs: 1000,
        file: "lesson_09_dark.mp4",
      },
      {
        id: "L10",
        title: "Assignment: build a token sheet",
        kind: "assignment",
        pts: 20,
        file: "brief_tokens.pdf",
      },
    ],
  },
  {
    id: "m3",
    num: "03",
    title: "Type and spacing",
    week: 3,
    lessons: [
      {
        id: "L11",
        title: "A type scale you can defend",
        kind: "video",
        secs: 735,
        file: "lesson_11_scale.mp4",
      },
      {
        id: "L12",
        title: "Grids and rhythm",
        kind: "video",
        secs: 1110,
        file: "lesson_03_grids.mp4",
      },
      {
        id: "L13",
        title: "Spacing tokens",
        kind: "reading",
        secs: 360,
        file: "spacing_tokens.md",
      },
      {
        id: "L14",
        title: "Live: critique of your specimens",
        kind: "live",
        secs: 3600,
        file: "session_wk3.ics",
      },
      {
        id: "L15",
        title: "Assignment: type specimen page",
        kind: "assignment",
        pts: 20,
        file: "brief_specimen.pdf",
      },
    ],
  },
  {
    id: "m4",
    num: "04",
    title: "Components in practice",
    week: 5,
    lessons: [
      {
        id: "L16",
        title: "Buttons, properly",
        kind: "video",
        secs: 840,
        file: "lesson_16_buttons.mp4",
      },
      {
        id: "L17",
        title: "Forms and states",
        kind: "video",
        secs: 1160,
        file: "lesson_17_forms.mp4",
      },
      {
        id: "L18",
        title: "Accessibility notes",
        kind: "reading",
        secs: 480,
        file: "a11y_notes.md",
      },
      {
        id: "L19",
        title: "Assignment: component spec",
        kind: "assignment",
        pts: 25,
        file: "brief_spec.pdf",
      },
    ],
  },
  {
    id: "m5",
    num: "05",
    title: "Ship and document",
    week: 7,
    lessons: [
      {
        id: "L20",
        title: "Docs that get read",
        kind: "video",
        secs: 705,
        file: "lesson_20_docs.mp4",
      },
      {
        id: "L21",
        title: "Handoff checklist",
        kind: "reading",
        secs: 300,
        file: "handoff.md",
      },
      {
        id: "L22",
        title: "Final exam",
        kind: "exam",
        secs: 2700,
        file: "exam_final.json",
      },
    ],
  },
];

export const MODULES: Module[] = MODULE_SEED.map((m) => ({
  ...m,
  lessons: m.lessons.map(withLessonDur),
}));

/**
 * Icon + label per lesson kind.
 *
 * `l` is the human label and is translated; the record's key is the machine
 * token every screen switches on and never changes.
 */
export const KIND: Record<LessonKind, LessonKindMeta> = {
  video: {
    i: "play",
    get l() {
      return t("data.lessonKind.video");
    },
  },
  reading: {
    i: "book-open",
    get l() {
      return t("data.lessonKind.reading");
    },
  },
  assignment: {
    i: "pen-line",
    get l() {
      return t("data.lessonKind.assignment");
    },
  },
  exam: {
    i: "file-check",
    get l() {
      return t("data.lessonKind.exam");
    },
  },
  live: {
    i: "radio",
    get l() {
      return t("data.lessonKind.live");
    },
  },
};

/** Long-form content for the lessons the classroom can open. */
export const LESSON_META: Record<string, LessonMeta> = {
  L12: {
    overview:
      "Rhythm is what makes a page feel settled before anyone reads a word. We build a spacing scale from the type scale — not the other way round — then lay a 12-column grid over three real screens and watch where it fights us. By the end you'll have a grid you can hand to an engineer without an apology.",
    points: [
      { t: "Derive spacing from your line-height, not from a round number" },
      {
        t: "Where a 12-column grid helps, and where it quietly ruins a dashboard",
      },
      { t: "Vertical rhythm across cards, tables and long-form text" },
    ],
    files: [{ n: "grid_starter.fig" }, { n: "spacing_scale.json" }],
    transcript: [
      {
        t: "00:00",
        s: "Let me start with the thing nobody says out loud: most grids are decoration.",
      },
      {
        t: "01:48",
        s: "A grid earns its place when it makes a decision for you. If you're still nudging things after you've drawn it, it isn't a grid — it's a background image.",
      },
      {
        t: "04:32",
        s: "So we build the spacing scale first, from line-height. Body text at 16 with a 1.6 line-height gives us 25.6, and we round to 24. That is our unit.",
      },
      {
        t: "07:12",
        s: "Watch what happens when I set the card padding to 24 and the gap between cards to 24. The card stops looking like a box and starts looking like a place.",
      },
      {
        t: "11:05",
        s: "Now the twelve columns. On a dashboard, twelve is often a lie — you really have three regions and a rail.",
      },
      {
        t: "15:40",
        s: "Last thing. Print your page at 40% and squint. If the rhythm survives that, it will survive a phone.",
      },
    ],
  },
};

/* --------------------------------------------------------------------- Q&A */

export const QUESTIONS: Question[] = [
  {
    id: "q6",
    who: "Tomás Lindqvist",
    ini: "TL",
    lesson: "Grids and rhythm",
    get at() {
      return ago(2, "hour");
    },
    mine: false,
    text: "When you say the baseline grid is a suggestion — at what point does breaking it stop being a choice and start being a mess?",
  },
  {
    id: "q5",
    who: "Priya Raman",
    ini: "PR",
    lesson: "Spacing tokens",
    get at() {
      return ago(5, "hour");
    },
    mine: false,
    text: "Our engineers want spacing in a 4px scale, but the design file is on 8. Do I hand over both, or pick a fight?",
  },
  {
    id: "q4",
    who: "Rosa Marchetti",
    ini: "RM",
    lesson: "A type scale you can defend",
    get at() {
      return `${ago(1, "day")} ${clock(21, 4)}`;
    },
    mine: true,
    text: "I have a 13px caption that only exists because a table needed it. Is that a real size or am I fooling myself?",
    reply: {
      who: "Yara Haddad",
      ini: "YH",
      get at() {
        return `${ago(0, "day")} ${clock(8, 12)}`;
      },
      text: "It's real if the table is real. Give it a name that says the job — caption, or table-dense — and write down where it's allowed. A size with a job is a decision; a size without one is debris.",
    },
  },
  {
    id: "q3",
    who: "Ben Ahlgren",
    ini: "BA",
    lesson: "Dark mode without a rewrite",
    get at() {
      return ago(2, "day");
    },
    mine: false,
    text: "Do you keep the same accent hue in dark mode, or lighten it? Mine looks muddy on the dark surface.",
    reply: {
      who: "Yara Haddad",
      ini: "YH",
      get at() {
        return ago(2, "day");
      },
      text: "Lighten it, always. Same hue, more light — that's why our indigo becomes a much paler blue in dark. Then check contrast against the text sitting on top, not against the background.",
    },
  },
  {
    id: "q2",
    who: "Chidera Obi",
    ini: "CO",
    lesson: "Token layers",
    get at() {
      return ago(4, "day");
    },
    mine: false,
    text: "How many token layers is too many? I've got primitive, semantic and component and it already feels like a lot.",
    reply: {
      who: "Nadia Brandt",
      ini: "NB",
      get at() {
        return ago(4, "day");
      },
      text: "Three is the sweet spot and you have exactly three. Add a fourth only when you can name the thing it protects you from.",
    },
  },
  {
    id: "q1",
    who: "Mette Sørensen",
    ini: "MS",
    lesson: "Inventory your UI",
    get at() {
      return ago(1, "week");
    },
    mine: false,
    text: "My audit spreadsheet has 340 rows and I've lost the will to live. How do you know when the audit is done?",
    reply: {
      who: "Yara Haddad",
      ini: "YH",
      get at() {
        return ago(1, "week");
      },
      text: "When new screens stop producing new rows. That usually happens far earlier than people expect — around screen fifteen. Stop there and start grouping.",
    },
  },
];

/** What the dock's "Simulate an answer" posts, as the instructor. */
export const SIMULATED_REPLY = {
  who: "Yara Haddad",
  ini: "YH",
  get at() {
    return t("chrome.time.justNow");
  },
  text: "Good question — and the honest answer is that it depends on who reads it next. Write down the rule you land on, put it in the docs, and we'll pressure-test it on Thursday.",
} as const;

/* -------------------------------------------------------------------- exam */

export const EXAM: ExamQuestion[] = [
  {
    id: 1,
    kind: "single",
    sec: "Foundations",
    q: "A design token is best described as…",
    opts: [
      "A hex value stored in a variable",
      "A named decision that can change in one place",
      "A component with no logic",
      "A Figma style, exported",
    ],
    a: 1,
  },
  {
    id: 2,
    kind: "multi",
    sec: "Components",
    q: "Which of these belong in a component spec? Choose all that apply.",
    opts: [
      "Every state, including empty and error",
      "The exact pixel width",
      "Content rules and edge cases",
      "Accessibility behaviour",
      "A list of who has used it",
    ],
    a: [0, 2, 3],
  },
  {
    id: 3,
    kind: "short",
    sec: "Type and spacing",
    q: "What contrast ratio does WCAG AA ask for on body text?",
    a: ["4.5:1", "4.5", "4.5 : 1"],
  },
  {
    id: 4,
    kind: "single",
    sec: "Foundations",
    q: "Your audit turns up 27 shades of grey. What is the first move?",
    opts: [
      "Delete 26 of them and see who shouts",
      "Group them by the job they do, then name the jobs",
      "Pick the most used one as the new default",
      "Ask engineering which ones ship today",
    ],
    a: 1,
  },
  {
    id: 5,
    kind: "multi",
    sec: "Colour and tokens",
    q: "Which changes are safe to make inside the token layer alone?",
    opts: [
      "Swapping the value behind surface-2",
      "Re-mapping the dark mode aliases",
      "Changing a button’s padding",
      "Adding a new semantic role",
      "Renaming a component prop",
    ],
    a: [0, 1, 3],
  },
  {
    id: 6,
    kind: "short",
    sec: "Colour and tokens",
    q: "Name the token layer that maps raw values to roles.",
    a: ["semantic", "semantic layer", "semantic tokens"],
  },
  {
    id: 7,
    kind: "single",
    sec: "Components",
    q: "Which button state gets forgotten most often?",
    opts: ["Hover", "Focus-visible", "Disabled", "Loading"],
    a: 1,
  },
  {
    id: 8,
    kind: "essay",
    sec: "Essay",
    q: "A team wants to skip the documentation to ship faster. Write the case you would make to them.",
  },
];

/** Exam rules — the intro card and the D7 attempt/pass logic both read these. */
export const EXAM_RULES = {
  durationMin: 45,
  /** Seconds on the clock. */
  durationSec: 2700,
  questions: 8,
  attemptsAllowed: 2,
  passScore: 70,
} as const;

/** The essay the dock's "Fill answers" drops in. */
export const EXAM_FILL_ESSAY =
  "Documentation is not a tax on shipping — it is the thing that stops us rebuilding the same button in March. Every undocumented component is a decision one person is holding in their head, and that person will be on holiday when it matters. Two paragraphs and a usage note buys back a week of Slack threads.";

/* ------------------------------------------------- the student's own work */

export const MY_ASSIGNMENT = {
  title: "Type specimen page",
  points: 20,
  /** What the instructor awards when the demo grades it. */
  grade: 18,
  body: "I started from the type scale we built in week 2 and pushed it into a specimen page — headings at 1.25, body at 16/1.6, and a caption size I can actually defend.\n\nStill unsure about the display size. It looks right on desktop and far too shouty on a phone.",
  files: [{ n: "type_specimen.pdf" }, { n: "scale_tokens.json" }],
  briefFiles: [{ n: "brief_specimen.pdf" }, { n: "scale_reference.fig" }],
} as const;

/* ------------------------------------------------------ the grading queue */

export const SUBMISSIONS: QueuedSubmission[] = [
  {
    id: "s1",
    who: "Tomás Lindqvist",
    ini: "TL",
    item: "Type specimen page",
    get kind() {
      return t("data.submissionKind.assignment");
    },
    max: 20,
    get at() {
      return ago(2, "hour");
    },
    tag: "2h",
    get tagLabel() {
      return shortUnit(2, "hour");
    },
    work: "Five sizes, all from the 1.25 scale. I wrote the job of each one underneath, which was harder than setting the type.\n\nThe caption is the one I'm least sure about — it only exists for table rows, and I can't tell if that's a real need or me protecting a decision I already made.",
    files: [{ n: "specimen_lindqvist.pdf" }, { n: "scale.json" }],
  },
  {
    id: "s2",
    who: "Priya Raman",
    ini: "PR",
    item: "Type specimen page",
    get kind() {
      return t("data.submissionKind.assignment");
    },
    max: 20,
    get at() {
      return ago(5, "hour");
    },
    tag: "5h",
    get tagLabel() {
      return shortUnit(5, "hour");
    },
    work: "I built the scale twice: once on 1.2 and once on 1.333, then set the same paragraph in both. The 1.2 version is calmer and I think that suits a dashboard.\n\nWhat I couldn't solve is the display size on mobile — it wraps to three lines and looks silly.",
    files: [{ n: "specimen_raman.pdf" }],
  },
  {
    id: "s3",
    who: "Ben Ahlgren",
    ini: "BA",
    item: "Build a token sheet",
    get kind() {
      return t("data.submissionKind.assignmentLate");
    },
    max: 20,
    get at() {
      return ago(1, "day");
    },
    tag: "late",
    get tagLabel() {
      return t("data.submissionTag.late");
    },
    work: "Late, sorry — work got loud. Primitive, semantic and component layers, with the dark mode aliases mapped in the semantic layer as you suggested.\n\nI stripped 27 greys down to 6. It hurt and then it didn't.",
    files: [{ n: "tokens_ahlgren.json" }, { n: "before_after.png" }],
  },
  {
    id: "s4",
    who: "Chidera Obi",
    ini: "CO",
    item: "Final exam · essay answer",
    get kind() {
      return t("data.submissionKind.essay");
    },
    max: 10,
    get at() {
      return ago(3, "hour");
    },
    tag: "essay",
    get tagLabel() {
      return t("data.submissionTag.essay");
    },
    work: "Skipping documentation is borrowing time at a terrible rate. The team saves two days now and pays three weeks later, when the same dropdown gets rebuilt by someone who never saw the original.\n\nMy case would be small: one page per component, written while the decision is fresh. Not a manual — a note to the next person, who is usually you in four months.",
    files: [],
  },
];

/* --------------------------------------------------------- announcements */

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Week 3 is open",
    pinned: true,
    get at() {
      return stamp(cohortDay(3, 0), 9, 12);
    },
    sent: "Sent to 30 students",
    body: "Grids and rhythm is up, and the specimen brief is attached to lesson 15. Bring something rough on Thursday — rough is the point. If you are behind on week 2, do the token sheet first; everything this week leans on it.",
  },
  {
    id: "a2",
    title: "Office hours move to Thursday",
    pinned: false,
    get at() {
      return stamp(cohortDay(2, 4), 17, 40);
    },
    sent: "Sent to 30 students",
    body: "From this week our live session sits at 18:00 CET on Thursdays so the folks in Lagos and São Paulo can make it. Recordings still go up the same evening.",
  },
];

/* --------------------------------------------------------------- the roster */

/** [name, progress %, last active, grade average] */
export const STUDENTS: StudentRow[] = [
  ["Adaeze Nwosu", 86, "2h ago", 94],
  ["Tomás Lindqvist", 73, "4h ago", 88],
  ["Priya Raman", 68, "1h ago", 91],
  ["Ben Ahlgren", 55, "Yesterday", 79],
  ["Chidera Obi", 91, "30m ago", 96],
  ["Mette Sørensen", 50, "2 days ago", 84],
  ["Rosa Marchetti", 50, "Just now", 88],
  ["Kwame Mensah", 45, "3 days ago", 72],
  ["Ingrid Halvorsen", 77, "5h ago", 90],
  ["Diego Ferreira", 41, "4 days ago", 66],
  ["Yuki Tanaka", 82, "1h ago", 93],
  ["Sofia Kovač", 64, "Yesterday", 85],
  ["Omar Haddadi", 36, "6 days ago", 61],
  ["Lena Brandt", 59, "8h ago", 87],
  ["Marcus Feld", 27, "9 days ago", 54],
  ["Aisha Bello", 73, "3h ago", 89],
  ["Jonas Weber", 50, "Yesterday", 81],
  ["Camila Rojas", 68, "2h ago", 92],
  ["Henry Osei", 45, "2 days ago", 76],
  ["Nora Lindgren", 86, "1h ago", 95],
  ["Ravi Kapoor", 32, "7 days ago", 58],
  ["Elif Demir", 59, "6h ago", 86],
  ["Pablo Serra", 55, "Yesterday", 83],
  ["Anna Kowalski", 77, "4h ago", 90],
  ["Thabo Molefe", 41, "3 days ago", 70],
  ["Julia Nowak", 64, "5h ago", 88],
  ["Sami Rahal", 50, "2 days ago", 80],
  ["Freya Nilsen", 91, "20m ago", 97],
  ["Louis Girard", 36, "5 days ago", 63],
  ["Hana Suzuki", 68, "3h ago", 89],
];

/** How many seats the cohort holds. */
export const COHORT_CAPACITY = 30;

/* ------------------------------------------------- the student's purchases */

export const ENROLLED: EnrolledCourse[] = [
  {
    id: "DS-101",
    title: "Design Systems from Scratch",
    tint: "#7c3aed",
    icon: "layout-grid",
    state: "active",
    done: null,
    total: 22,
    price: 180,
    order: "YA-2041",
    date: "20 Jul 2026",
    ts: 20260720,
  },
  {
    id: "TY-140",
    title: "Type & Layout Fundamentals",
    tint: "#2563eb",
    icon: "type",
    state: "active",
    done: 6,
    total: 18,
    next: "Measure and line length",
    price: 95,
    order: "YA-1904",
    date: "14 Mar 2026",
    ts: 20260314,
  },
  {
    id: "MO-220",
    title: "Motion for Interfaces",
    tint: "#0d9488",
    icon: "orbit",
    state: "paused",
    done: 5,
    total: 14,
    price: 120,
    order: "YA-1712",
    date: "11 Nov 2025",
    ts: 20251111,
  },
  {
    id: "PF-201",
    title: "Writing for Interfaces",
    tint: "#e11d48",
    icon: "pen-tool",
    state: "retired",
    done: 16,
    total: 16,
    price: 0,
    order: "YA-1877",
    date: "08 Sep 2025",
    ts: 20250908,
  },
];

/** The next order number the checkout mints. Seeded history ends at 2040. */
export const NEXT_ORDER_NO = "YA-2041";

/* -------------------------------------------------------- the live session */

export const LIVE_SESSION = {
  title: "Critique: your type specimens",
  /** Day offset from the week's Monday, and the hour it starts. */
  dayOffset: 3,
  hour: 18,
  durationMin: 60,
  timezone: "CET",
} as const;
