/*
 * The single Zustand store.
 *
 * Modelled on the comp's one big `state` object, with four deliberate
 * changes:
 *
 *   • The JS window width is gone. The comp branched on `S.w < 1000` in a
 *     dozen places; here every one of those is a real CSS media query in the
 *     screen's stylesheet. Nothing in this app measures the viewport.
 *
 *   • `theme` is stamped onto <html> as `data-theme` and the palette comes
 *     from tokens.css, rather than a `themeVars` object rebuilt on render.
 *
 *   • The demo clock is first-class: `week` (1–8) drives every date, lock and
 *     due date in the app, and only the dock moves it (spec 20 D6).
 *
 *   • `elapsed` is the one real ticking value — seconds since mount. It feeds
 *     the live-session countdown, the lesson player head and the exam timer.
 *     Screens that do not select it never re-render on a tick.
 *
 * Screens read with a selector and write with `set`:
 *
 *   const week = useAppStore((s) => s.week);
 *   const set  = useAppStore((s) => s.set);
 *   set({ qaFilter: "open" });
 *
 * Routing is the `view` string. There is no router.
 */

import { create } from "zustand";
import {
  ANNOUNCEMENTS,
  COHORT_WEEKS,
  EXAM_FILL_ESSAY,
  EXAM_RULES,
  INSTRUCTOR,
  MY_ASSIGNMENT,
  STUDENT,
  TOTAL_LESSONS,
} from "../data/demo";
import type {
  AttachedFile,
  CourseMode,
  ExamAnswer,
  ModalState,
  Persona,
  Question,
  SubmissionState,
  ThemeName,
  ToastState,
  ViewId,
} from "../data/types";
/*
 * Toast copy is produced inside actions, which are plain functions with no hook
 * to call — so the store reads the live `t` / `number` off the ambient bridge
 * `<App>` refreshes on every render. Same lookup table, same `Intl` rules, no
 * second runtime.
 */
import { number as fmtNumber, t } from "../i18n/ambient";
import { filledAnswers } from "../lib/exam";
import {
  allLessons,
  demoNow,
  fmtDate,
  fmtTime,
  isModuleLocked,
  lessonById,
  playheadPos,
  weekStart,
} from "../lib/schedule";
import { answerOldest, newQuestion, questionList } from "../lib/thread";
import type { ReplyMap } from "../lib/thread";

/** Instructor-side views — used to keep persona and view in step. */
const INSTRUCTOR_VIEWS = new Set<string>([
  "teach", "teachonboard", "content", "grading", "inbox", "announce", "roster",
  "student", "messages", "editor", "lessoned", "exambuilder", "cohort",
  "waitlist", "certificates", "analytics", "payouts",
]);

export function personaFor(view: ViewId): Persona {
  return INSTRUCTOR_VIEWS.has(view) ? "instructor" : "student";
}

/** How long a toast stays up. Longer when it carries an undo action. */
const TOAST_MS = 2600;
const TOAST_ACTION_MS = 5200;
/** The skeleton window on "Reload list". */
const RELOAD_MS = 900;

/* ------------------------------------------------------------ the shape */

export interface AppState {
  /* --- shell --- */
  persona: Persona;
  view: ViewId;
  theme: ThemeName;
  /** True once the user has toggled by hand; stops the OS preference winning. */
  themeManual: boolean;
  menu: boolean;
  loading: boolean;
  toast: ToastState | null;
  modal: ModalState | null;

  /* --- the demo clock (D6) --- */
  mode: CourseMode;
  week: number;
  /** Seconds since mount. The only real ticking value. */
  elapsed: number;

  /* --- catalog + course --- */
  cat: string;
  q: string;
  courseId: string;
  openMods: Record<string, boolean>;

  /* --- checkout --- */
  ckDecline: boolean;
  ckDone: boolean;
  ckBusy: boolean;
  ckError: boolean;
  ckEmail: string;
  ckCard: string;
  ckExp: string;
  ckCvc: string;
  ckName: string;

  /* --- classroom --- */
  done: Record<string, number>;
  lesson: string;
  tab: string;
  playing: boolean;
  pos: number;
  playAnchor: number;
  clDrawer: boolean;
  notes: string;
  noteSaved: string;

  /* --- Q&A (D8) --- */
  qaText: string;
  qaFilter: string;
  qaReplies: ReplyMap;
  qaAdded: Question[];

  /* --- assignment --- */
  asText: string;
  asFiles: AttachedFile[];
  asState: SubmissionState;
  asAt: string | null;
  gradedMine: boolean;

  /* --- exam (D7) --- */
  exStarted: boolean;
  exI: number;
  exAns: Record<number, ExamAnswer>;
  exSubmitted: boolean;
  exLeft: number;
  exAttempts: number;

  /* --- live session --- */
  lvJoined: boolean;

  /* --- instructor: grading queue --- */
  gqI: number;
  gqPts: string;
  gqFb: string;
  gqDone: Record<string, number>;

  /* --- instructor: Q&A inbox --- */
  qiDraft: Record<string, string>;
  qiDone: Record<string, number>;

  /* --- instructor: content release schedule --- */
  rel: Record<string, string>;

  /* --- instructor: announcements --- */
  anTitle: string;
  anBody: string;
  anPin: boolean;
  annsAdded: typeof ANNOUNCEMENTS;
  roFilter: string;

  /* --- profile --- */
  prName: string;
  prEmail: string;
  prTz: string;
  prLink: string;
  prBio: string;
  prNotif: Record<string, boolean>;
  prSavedAt: string;

  /* --- reviews --- */
  rvFilter: string;
  rvStars: number;
  rvText: string;
  rvAdded: unknown[];
  rvHelpful: Record<string, number>;

  /* --- discussion board --- */
  dbCat: string;
  dbThread: string | null;
  dbReply: string;
  dbVotes: Record<string, number>;
  dbAdded: Record<string, unknown[]>;

  /* --- analytics + mobile --- */
  anRange: string;
  mbTab: string;

  /* --- downloads / saved / compare --- */
  dlWifi: boolean;
  dlState: Record<string, string>;
  svRemoved: Record<string, number>;
  cmPick: string;

  /*
   * --- cohort setup ---
   *
   * The four fields below are `null` until the teacher types in them, and
   * `null` means "whatever this is in the reader's language and format".
   *
   * They cannot simply be seeded with a string. `INITIAL` is a module-level
   * object literal, so any value built from `Intl` or `t()` here would be
   * computed before <App> mounts — frozen into English for the life of the
   * tab, exactly the trap `data/format.ts` warns about. Worse for `csDay`:
   * `LIVE_DAYS` is Intl-driven, so a hard-coded "Thu" matched no option in
   * the other seven locales and the day picker rendered with nothing chosen.
   *
   * `null` rather than `""` because an empty string is a real edit — the
   * teacher clearing the field — and must stay empty rather than snapping
   * back to the default. The screens resolve `?? <localised default>`.
   */
  csStart: string | null;
  csWeeks: string | null;
  csDay: string | null;
  csTime: string;
  csTz: string;
  csSeats: number;
  csPrice: string | null;
  csWait: boolean;
  csSavedAt: string;

  /* --- messages --- */
  msI: number;
  msText: string;
  msSent: Record<string, unknown[]>;

  /* --- exam builder --- */
  ebI: number;
  ebText: Record<string, string>;
  ebKind: Record<string, string>;
  ebOpt: Record<string, string>;
  ebRight: Record<string, number>;
  ebSec: Record<string, string>;
  /* `null` = the seeded rule, in the reader's digits and units. See above. */
  ebPass: string | null;
  ebAttempts: string | null;
  ebDur: string | null;

  /* --- certificate --- */
  ctWording: string;
  ctExam: boolean;

  /* --- waitlist + offline --- */
  wlInvited: Record<string, number>;
  ofTrying: boolean;

  /* --- landing / onboarding / study rooms --- */
  lpFaq: number;
  ioDone: Record<string, boolean>;
  srIn: string | null;
  srMuted: boolean;
  srRsvp: Record<string, number>;

  /* --- scholarship --- */
  scCourse: string;
  scAmount: string;
  scSit: string;
  scText: string;
  scForward: boolean;
  scDone: boolean;

  /* --- archive + peer review --- */
  arFilter: string;
  prvI: number;
  prvDone: Record<string, number>;
  prvScore: Record<string, number>;
  prvText: Record<string, string>;
  prvAnonOn: boolean;

  /* --- streaks + alumni --- */
  stToday: boolean;
  stFreeze: number;
  alQuery: string;
  alFilter: string;
  alConnected: Record<string, number>;
  alListed: boolean;

  /* --- sign in + onboarding --- */
  siEmail: string;
  siPass: string;
  siBusy: boolean;
  obStep: number;
  obA: Record<string, string>;

  /* --- search / notifications / notes --- */
  sqQ: string;
  sqType: string;
  nfTab: string;
  nfRead: Record<string, number>;
  ntQuery: string;
  ntDeleted: Record<string, number>;

  /* --- team seats + refunds --- */
  tsSeats: number;
  tsInvite: string;
  tsCourse: string;
  rfReason: string;
  rfText: string;
  rfDone: boolean;
  sdNote: string;

  /* --- course + lesson editor --- */
  edTitle: string;
  edCode: string;
  /* `null` = the course's own price, in the reader's currency format. */
  edPrice: string | null;
  edLevel: string;
  edTint: string;
  edIcon: string;
  edPublished: boolean;
  edSavedAt: string;
  edDesc: string;
  edLearn: string[];
  leTitle: string;
  leKind: string;
  leDur: string;
  lePoints: string;
  leFileOn: boolean;
  leRel: string;
  leRes: string[];
  leDesc: string;
  ccDraft: Record<string, string>;
}

export interface AppActions {
  /** The general-purpose patch. Screens use this for their own local state. */
  set: (patch: Partial<AppState>) => void;

  /* --- navigation --- */
  go: (view: ViewId) => void;
  setPersona: (persona: Persona) => void;
  openCourse: (id: string) => void;
  openLesson: (id: string) => void;
  openMenu: () => void;
  closeMenu: () => void;

  /* --- chrome --- */
  showToast: (msg: string, icon?: string, actionLabel?: string, action?: () => void) => void;
  dismissToast: () => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  confirmModal: () => void;
  toggleTheme: () => void;
  syncSystemTheme: (theme: ThemeName) => void;
  reload: () => void;

  /* --- the demo clock (D6) --- */
  advanceWeek: () => void;
  resetWeek: () => void;
  setMode: (mode: CourseMode) => void;

  /* --- classroom --- */
  togglePlay: () => void;
  scrubTo: (fraction: number) => void;
  markComplete: () => void;
  resetProgress: () => void;
  completeAll: () => void;

  /* --- Q&A (D8) --- */
  askQuestion: () => void;
  simulateAnswer: () => void;

  /* --- assignment --- */
  submitAssignment: () => void;
  gradeMine: () => void;

  /* --- exam (D7) --- */
  startExam: () => void;
  fillExam: () => void;
  submitExam: () => void;
  retakeExam: () => void;

  /* --- the ticking clock --- */
  tick: () => void;
}

export type Store = AppState & AppActions;

/* --------------------------------------------------------- initial state */

const INITIAL: AppState = {
  persona: "student",
  view: "catalog",
  theme: "light",
  themeManual: false,
  menu: false,
  loading: false,
  toast: null,
  modal: null,

  mode: "cohort",
  week: 3,
  elapsed: 0,

  cat: "all",
  q: "",
  courseId: "DS-101",
  openMods: { m3: true },

  ckDecline: false,
  ckDone: false,
  ckBusy: false,
  ckError: false,
  ckEmail: STUDENT.email,
  ckCard: "4242 4242 4242 4242",
  ckExp: "04 / 29",
  ckCvc: "318",
  ckName: STUDENT.name,

  /* Eleven of 22 lessons done — halfway, mid-cohort, mid-use. */
  done: {
    L1: 1, L2: 1, L3: 1, L4: 1, L5: 1, L6: 1,
    L7: 1, L8: 1, L9: 1, L10: 1, L11: 1,
  },
  lesson: "L12",
  tab: "overview",
  playing: false,
  pos: 0.39,
  playAnchor: 0,
  clDrawer: false,
  notes: "",
  noteSaved: "",

  qaText: "",
  qaFilter: "all",
  qaReplies: {},
  qaAdded: [],

  asText: MY_ASSIGNMENT.body,
  asFiles: [...MY_ASSIGNMENT.files],
  asState: "draft",
  asAt: null,
  gradedMine: false,

  exStarted: false,
  exI: 0,
  exAns: {},
  exSubmitted: false,
  exLeft: EXAM_RULES.durationSec,
  exAttempts: 0,

  lvJoined: false,

  gqI: 0,
  gqPts: "",
  gqFb: "",
  gqDone: {},

  qiDraft: {},
  qiDone: {},

  rel: {},

  anTitle: "",
  anBody: "",
  anPin: false,
  annsAdded: [],
  roFilter: "co",

  prName: STUDENT.name,
  prEmail: STUDENT.email,
  prTz: "Europe/Rome",
  prLink: "marchetti.studio",
  prBio:
    "Product designer in Bologna. Currently untangling a nine-year-old admin tool, one component at a time.",
  prNotif: { lessons: true, replies: true, live: true, news: false },
  prSavedAt: "",

  rvFilter: "all",
  rvStars: 5,
  rvText: "",
  rvAdded: [],
  rvHelpful: {},

  dbCat: "all",
  dbThread: null,
  dbReply: "",
  dbVotes: {},
  dbAdded: {},

  anRange: "8w",
  mbTab: "learn",

  dlWifi: true,
  dlState: { L11: "done", L9: "done" },
  svRemoved: {},
  cmPick: "",

  csStart: null,
  csWeeks: null,
  csDay: null,
  csTime: "18:00",
  csTz: "CET",
  csSeats: 30,
  csPrice: null,
  csWait: true,
  csSavedAt: "",

  msI: 0,
  msText: "",
  msSent: {},

  ebI: 0,
  ebText: {},
  ebKind: {},
  ebOpt: {},
  ebRight: {},
  ebSec: {},
  ebPass: null,
  ebAttempts: null,
  ebDur: null,

  ctWording:
    "completed the eight-week course Design Systems from Scratch, including four graded assignments and a final exam.",
  ctExam: true,

  wlInvited: {},
  ofTrying: false,

  lpFaq: 0,
  ioDone: { profile: true, course: true },
  srIn: null,
  srMuted: false,
  srRsvp: {},

  scCourse: "DS-101",
  scAmount: "100%",
  scSit: "",
  scText: "",
  scForward: true,
  scDone: false,

  arFilter: "all",
  prvI: 0,
  prvDone: {},
  prvScore: {},
  prvText: {},
  prvAnonOn: false,

  stToday: false,
  stFreeze: 2,
  alQuery: "",
  alFilter: "all",
  alConnected: {},
  alListed: false,

  siEmail: STUDENT.email,
  siPass: "demo1234",
  siBusy: false,
  obStep: 0,
  obA: {},

  sqQ: "tokens",
  sqType: "all",
  nfTab: "all",
  nfRead: {},
  ntQuery: "",
  ntDeleted: {},

  tsSeats: 5,
  tsInvite: "",
  tsCourse: "ds",
  rfReason: "",
  rfText: "",
  rfDone: false,
  sdNote: "",

  edTitle: "Design Systems from Scratch",
  edCode: "DS-101",
  edPrice: null,
  edLevel: "Intermediate",
  edTint: "#7c3aed",
  edIcon: "layout-grid",
  edPublished: true,
  edSavedAt: "",
  edDesc:
    "Build a real system from an honest audit to a documented, shipped library. Eight weeks, weekly critique, and one very stubborn button component.",
  edLearn: [
    "Audit an existing interface without drowning in screenshots",
    "Name things so the next person understands them",
    "Build a token layer that survives a rebrand",
    "Design components with states, not just happy paths",
  ],
  leTitle: "Grids and rhythm",
  leKind: "video",
  leDur: "18:30",
  lePoints: "—",
  leFileOn: true,
  leRel: "pub",
  leRes: ["grid_starter.fig", "spacing_scale.json"],
  leDesc:
    "Rhythm is what makes a page feel settled before anyone reads a word. We build a spacing scale from the type scale, then lay a 12-column grid over three real screens.",
  ccDraft: {},
};

/* ------------------------------------------------------------- the store */

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

function scrollTop(): void {
  try {
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch {
    /* jsdom and other non-browser hosts */
  }
}

export const useAppStore = create<Store>((set, get) => ({
  ...INITIAL,

  set: (patch) => set(patch),

  /* ------------------------------------------------------- navigation -- */

  go: (view) => {
    set({ view, menu: false, persona: personaFor(view) });
    scrollTop();
  },

  setPersona: (persona) => {
    set({
      persona,
      view: persona === "student" ? "catalog" : "teach",
      menu: false,
    });
    scrollTop();
  },

  openCourse: (id) => {
    set({ courseId: id, view: "course", menu: false, persona: "student" });
    scrollTop();
  },

  /**
   * Open a lesson from the sidebar.
   *
   * Three things can happen: a locked lesson refuses with its unlock date
   * (D6), a lesson whose kind has its own screen routes there, and everything
   * else loads into the player.
   */
  openLesson: (id) => {
    const s = get();
    const l = lessonById(id);
    if (!l) return;

    if (isModuleLocked(l.mod, s.week, s.mode)) {
      s.showToast(
        t("chrome.toast.locked", { date: fmtDate(weekStart(l.mod.week)) }),
        "lock",
      );
      return;
    }

    if (l.kind === "exam") return s.go("exam");
    if (l.kind === "assignment") return s.go("assignment");
    if (l.kind === "live") return s.go("live");

    set({ lesson: id, pos: 0, playing: false, tab: "overview" });
  },

  openMenu: () => set({ menu: true }),
  closeMenu: () => set({ menu: false }),

  /* ----------------------------------------------------------- chrome -- */

  showToast: (msg, icon = "check", actionLabel, action) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { msg, icon, actionLabel, action } });
    toastTimer = setTimeout(
      () => set({ toast: null }),
      action ? TOAST_ACTION_MS : TOAST_MS,
    );
  },

  dismissToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: null });
  },

  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  confirmModal: () => {
    const m = get().modal;
    set({ modal: null });
    m?.onConfirm?.();
  },

  toggleTheme: () =>
    set({ theme: get().theme === "dark" ? "light" : "dark", themeManual: true }),

  /** The OS preference only wins until the user picks a side by hand. */
  syncSystemTheme: (theme) => {
    if (!get().themeManual) set({ theme });
  },

  reload: () => {
    if (reloadTimer) clearTimeout(reloadTimer);
    set({ loading: true });
    reloadTimer = setTimeout(() => set({ loading: false }), RELOAD_MS);
  },

  /* ------------------------------------------------- the demo clock -- */

  advanceWeek: () => {
    const week = Math.min(COHORT_WEEKS, get().week + 1);
    set({ week, elapsed: 0 });
    get().showToast(
      t("chrome.toast.weekAdvanced", {
        week: fmtNumber(week),
        date: fmtDate(weekStart(week)),
      }),
      "calendar-arrow-up",
    );
  },

  resetWeek: () => {
    set({ week: 1, elapsed: 0 });
    get().showToast(
      t("chrome.toast.weekReset", { week: fmtNumber(1), date: fmtDate(weekStart(1)) }),
      "rotate-ccw",
    );
  },

  setMode: (mode) => {
    set({ mode });
    get().showToast(
      t(mode === "cohort" ? "chrome.toast.modeCohort" : "chrome.toast.modeSelf"),
      mode === "cohort" ? "users" : "infinity",
    );
  },

  /* -------------------------------------------------------- classroom -- */

  togglePlay: () => {
    const s = get();
    if (s.playing) {
      set({
        playing: false,
        pos: playheadPos({
          playing: true,
          pos: s.pos,
          lessonId: s.lesson,
          elapsed: s.elapsed,
          playAnchor: s.playAnchor,
        }),
      });
    } else {
      set({ playing: true, playAnchor: s.elapsed });
    }
  },

  scrubTo: (fraction) =>
    set({ pos: Math.min(1, Math.max(0, fraction)), playAnchor: get().elapsed }),

  markComplete: () => {
    const s = get();
    const lessons = allLessons();
    const idx = lessons.findIndex((l) => l.id === s.lesson);
    const current = lessons[idx];
    if (!current) return;

    const done = { ...s.done, [current.id]: 1 };
    const next = lessons[idx + 1];

    if (next && !isModuleLocked(next.mod, s.week, s.mode)) {
      set({ done, lesson: next.id, pos: 0, playing: false, tab: "overview" });
      /* The lesson title is in-fiction content; only the sentence is translated. */
      s.showToast(t("chrome.toast.lessonDone", { title: current.title }), "check");
      return;
    }

    set({ done });
    s.showToast(
      next
        ? t("chrome.toast.nextModule", { date: fmtDate(weekStart(next.mod.week)) })
        : t("chrome.toast.lastLesson"),
      "check",
    );
  },

  resetProgress: () => {
    set({ done: {}, lesson: "L1" });
    get().showToast(t("chrome.toast.progressReset"), "rotate-ccw");
  },

  completeAll: () => {
    const done: Record<string, number> = {};
    for (const l of allLessons()) done[l.id] = 1;
    set({ done });
    get().showToast(
      t("chrome.toast.allComplete", { count: fmtNumber(TOTAL_LESSONS) }, TOTAL_LESSONS),
      "check-check",
    );
  },

  /* -------------------------------------------------------------- Q&A -- */

  askQuestion: () => {
    const s = get();
    const text = s.qaText.trim();
    if (!text) {
      s.showToast(t("chrome.toast.askFirst"), "info");
      return;
    }
    const lesson = lessonById(s.lesson)?.title ?? "Grids and rhythm";
    set({
      qaAdded: [newQuestion(text, s.qaAdded.length, lesson), ...s.qaAdded],
      qaText: "",
    });
    s.showToast(t("chrome.toast.posted", { name: INSTRUCTOR.name }), "send");
  },

  simulateAnswer: () => {
    const s = get();
    const result = answerOldest(questionList(s.qaAdded, s.qaReplies), s.qaReplies);
    if (!result) {
      s.showToast(t("chrome.toast.allAnswered"), "check");
      return;
    }
    set({ qaReplies: result.replies });
    s.showToast(
      t("chrome.toast.answeredAs", {
        excerpt: result.answered.text.slice(0, 34),
        name: INSTRUCTOR.name,
      }),
      "sparkles",
    );
  },

  /* ------------------------------------------------------- assignment -- */

  submitAssignment: () => {
    const s = get();
    /*
     * "Mon, Aug 3 · 10:20" — 10:20 is the demo clock's own "now", so the
     * timestamp comes from `demoNow` through `Intl` rather than being spelled
     * out. A US reader gets "10:20 AM"; an Arabic one gets ١٠:٢٠ ص.
     */
    const at = `${fmtDate(weekStart(s.week))} · ${fmtTime(demoNow(s.week))}`;
    set({ asState: "submitted", asAt: at });
    s.showToast(
      t("chrome.toast.submitted", { name: INSTRUCTOR.name }),
      "check",
      t("chrome.toast.undo"),
      () => set({ asState: "draft", asAt: null }),
    );
    scrollTop();
  },

  /** The instructor half grading the student's own work — the loop closing. */
  gradeMine: () => {
    const s = get();
    if (s.asState === "draft") {
      s.showToast(t("chrome.toast.submitFirst", { name: INSTRUCTOR.name }), "info");
      return;
    }
    set({ asState: "graded", gradedMine: true });
    s.showToast(
      t("chrome.toast.gradedSpecimen", {
        name: INSTRUCTOR.name,
        grade: fmtNumber(MY_ASSIGNMENT.grade),
        points: fmtNumber(MY_ASSIGNMENT.points),
      }),
      "award",
    );
  },

  /* ------------------------------------------------------------- exam -- */

  startExam: () =>
    set({ exStarted: true, exI: 0, exLeft: EXAM_RULES.durationSec }),

  fillExam: () => {
    set({ exAns: filledAnswers(EXAM_FILL_ESSAY), exStarted: true });
    get().showToast(t("chrome.toast.answersFilled"), "wand-2");
  },

  submitExam: () => {
    set({ exSubmitted: true, exAttempts: get().exAttempts + 1 });
    scrollTop();
    get().showToast(
      t("chrome.toast.examSubmitted", { name: INSTRUCTOR.name }),
      "file-check",
    );
  },

  retakeExam: () => set({ exSubmitted: false, exI: 0 }),

  /* ------------------------------------------------------------- tick -- */

  /**
   * One second of demo time.
   *
   * Only `elapsed` moves on every tick; the exam clock moves too, but only
   * while an attempt is actually running. Both are separate keys so a screen
   * that selects neither never re-renders.
   */
  tick: () => {
    const s = get();
    const patch: Partial<AppState> = { elapsed: s.elapsed + 1 };
    if (s.view === "exam" && s.exStarted && !s.exSubmitted && s.exLeft > 0) {
      patch.exLeft = s.exLeft - 1;
    }
    set(patch);
  },
}));
