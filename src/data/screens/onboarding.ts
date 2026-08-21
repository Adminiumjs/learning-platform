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
 *
 * Translation. The quiz is a form: its questions, its options and the plan it
 * prints are interface, so they are getters. `GOAL_COURSE` and the plan's
 * `goal` fallback are course titles and stay English with the rest of the
 * catalogue.
 */

import { number, t } from "../../i18n/ambient";

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
    get title() {
      return t("data.onboarding.goal.title");
    },
    get sub() {
      return t("data.onboarding.goal.sub");
    },
    opts: [
      {
        k: "system",
        get label() {
          return t("data.onboarding.goal.system");
        },
        get sub() {
          return t("data.onboarding.goal.systemSub");
        },
        icon: "layout-grid",
      },
      {
        k: "type",
        get label() {
          return t("data.onboarding.goal.type");
        },
        get sub() {
          return t("data.onboarding.goal.typeSub");
        },
        icon: "type",
      },
      {
        k: "motion",
        get label() {
          return t("data.onboarding.goal.motion");
        },
        get sub() {
          return t("data.onboarding.goal.motionSub");
        },
        icon: "orbit",
      },
      {
        k: "portfolio",
        get label() {
          return t("data.onboarding.goal.portfolio");
        },
        get sub() {
          return t("data.onboarding.goal.portfolioSub");
        },
        icon: "briefcase",
      },
    ],
  },
  {
    key: "hours",
    get title() {
      return t("data.onboarding.hours.title");
    },
    get sub() {
      return t("data.onboarding.hours.sub");
    },
    opts: [
      {
        k: "1",
        get label() {
          return t("data.onboarding.hours.one");
        },
        get sub() {
          return t("data.onboarding.hours.oneSub");
        },
        icon: "clock",
      },
      {
        k: "3",
        get label() {
          return t("data.onboarding.hours.three");
        },
        get sub() {
          return t("data.onboarding.hours.threeSub");
        },
        icon: "calendar-days",
      },
      {
        k: "6",
        get label() {
          return t("data.onboarding.hours.six");
        },
        get sub() {
          return t("data.onboarding.hours.sixSub");
        },
        icon: "flame",
      },
    ],
  },
  {
    key: "remind",
    get title() {
      return t("data.onboarding.remind.title");
    },
    get sub() {
      return t("data.onboarding.remind.sub");
    },
    opts: [
      {
        k: "mon",
        get label() {
          return t("data.onboarding.remind.mon");
        },
        get sub() {
          return t("data.onboarding.remind.monSub");
        },
        icon: "sunrise",
      },
      {
        k: "thu",
        get label() {
          return t("data.onboarding.remind.thu");
        },
        get sub() {
          return t("data.onboarding.remind.thuSub");
        },
        icon: "radio",
      },
      {
        k: "none",
        get label() {
          return t("data.onboarding.remind.none");
        },
        get sub() {
          return t("data.onboarding.remind.noneSub");
        },
        icon: "x-circle",
      },
    ],
  },
];

/* ------------------------------------------------------------- the plan */

/** Answer → the course the plan opens with. Course titles are fiction. */
export const GOAL_COURSE: Record<string, string> = {
  system: "Design Systems from Scratch",
  type: "Type & Layout Fundamentals",
  motion: "Motion for Interfaces",
  portfolio: "Portfolio Studio",
};

/** "3 hours a week" — the plural belongs to the message, not to the key. */
function paceLabel(hours: number, plus = false): string {
  return t(
    plus ? "data.onboarding.pacePlus" : "data.onboarding.pace",
    { count: number(hours) },
    hours,
  );
}

export const PACE_LABEL: Record<string, string> = {
  get "1"() {
    return paceLabel(1);
  },
  get "3"() {
    return paceLabel(3);
  },
  get "6"() {
    return paceLabel(6, true);
  },
};

export const NUDGE_LABEL: Record<string, string> = {
  get mon() {
    return t("data.onboarding.nudge.mon");
  },
  get thu() {
    return t("data.onboarding.nudge.thu");
  },
  get none() {
    return t("data.onboarding.nudge.none");
  },
};

/**
 * What the plan says when a question was somehow skipped. Unreachable through
 * the UI — "Next" refuses an unanswered question — but the plan reads from a
 * free-form map, so it states a sensible default rather than a blank row.
 */
export const PLAN_FALLBACK = {
  goal: "Design Systems from Scratch",
  get pace() {
    return paceLabel(3);
  },
  get nudge() {
    return t("data.onboarding.nudge.mon");
  },
};

/** Days after "now" the first milestone lands on. */
export const MILESTONE_DAYS = 5;
