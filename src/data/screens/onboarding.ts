/*
 * Page-local seed for the onboarding quiz.
 *
 * Three questions, then a plan assembled from the answers. The plan's course
 * names are copy rather than course records on purpose: the quiz runs before
 * anyone has enrolled, so it recommends by title and only the classroom that
 * follows touches the catalogue.
 *
 * Two icons the comp asked for are not in the shared registry ("moon",
 * "bell-off"), and the registry is a shared file this port may not edit. Both
 * are replaced with names that carry the same meaning and are already there —
 * "radio" is the app's live-session glyph, which is exactly what the Thursday
 * option is about, and "x-circle" is the plainest "no".
 */

export interface QuizOption {
  /** Stored in `obA[question.key]`. */
  k: string;
  label: string;
  sub: string;
  /** Kebab-case lucide name for the option tile. */
  icon: string;
}

export interface QuizQuestion {
  /** Key into `obA` on the store. */
  key: string;
  title: string;
  sub: string;
  opts: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    key: "goal",
    title: "What are you trying to build?",
    sub: "It changes what we put in front of you first.",
    opts: [
      {
        k: "system",
        label: "A design system",
        sub: "For a product team that keeps re-inventing buttons",
        icon: "layout-grid",
      },
      { k: "type", label: "Better typography", sub: "Scales, measure, rhythm, restraint", icon: "type" },
      {
        k: "motion",
        label: "Motion that means something",
        sub: "Easing and choreography, not fireworks",
        icon: "orbit",
      },
      {
        k: "portfolio",
        label: "A portfolio that lands",
        sub: "Three case studies that say what you did",
        icon: "briefcase",
      },
    ],
  },
  {
    key: "hours",
    title: "How much time have you got each week?",
    sub: "Be honest. We will pace the reminders around it.",
    opts: [
      { k: "1", label: "About an hour", sub: "A lesson a week, no assignments", icon: "clock" },
      {
        k: "3",
        label: "Three hours",
        sub: "The cohort pace — lessons plus the assignment",
        icon: "calendar-days",
      },
      { k: "6", label: "Six or more", sub: "You will finish early and you know it", icon: "flame" },
    ],
  },
  {
    key: "remind",
    title: "When should we nudge you?",
    sub: "One message a week. You can turn it off later.",
    opts: [
      { k: "mon", label: "Monday morning", sub: "When the week opens", icon: "sunrise" },
      { k: "thu", label: "Thursday evening", sub: "Just before the live session", icon: "radio" },
      { k: "none", label: "Do not nudge me", sub: "You will remember. Probably.", icon: "x-circle" },
    ],
  },
];

/* ------------------------------------------------------------- the plan */

/** Answer → the course the plan opens with. */
export const GOAL_COURSE: Record<string, string> = {
  system: "Design Systems from Scratch",
  type: "Type & Layout Fundamentals",
  motion: "Motion for Interfaces",
  portfolio: "Portfolio Studio",
};

export const PACE_LABEL: Record<string, string> = {
  "1": "1 hour a week",
  "3": "3 hours a week",
  "6": "6+ hours a week",
};

export const NUDGE_LABEL: Record<string, string> = {
  mon: "Monday mornings",
  thu: "Thursday evenings",
  none: "No reminders",
};

/**
 * What the plan says when a question was somehow skipped. Unreachable through
 * the UI — "Next" refuses an unanswered question — but the plan reads from a
 * free-form map, so it states a sensible default rather than a blank row.
 */
export const PLAN_FALLBACK = {
  goal: "Design Systems from Scratch",
  pace: "3 hours a week",
  nudge: "Monday mornings",
} as const;

/** Days after "now" the first milestone lands on. */
export const MILESTONE_DAYS = 5;
