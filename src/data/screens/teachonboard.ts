/*
 * Instructor onboarding — page-local seed copy.
 *
 * The six setup steps, the payout facts and the house rules. All of it is the
 * marketplace talking to a new instructor, so it belongs to this screen and
 * not to the `dataSource` seam.
 *
 * All of it is also interface — a checklist, a facts table and four house
 * rules — so all of it is translated. The two `meta` chips that quote a course
 * code ("PF-310 · draft") keep the code and translate the word beside it.
 */

import { money, number, t } from "../../i18n/ambient";
import type { MessageKey } from "../../i18n/messages";
import { lazyStrings } from "../format";
import type { ViewId } from "../types";

export interface OnboardStep {
  /** Key into the store's `ioDone` map. */
  k: string;
  title: string;
  body: string;
  cta: string;
  /** Where the CTA sends them to actually do the thing. */
  go: ViewId;
  /** Mono status chip under the body, where the step has one. */
  meta?: string;
}

export const ONBOARD_STEPS: OnboardStep[] = [
  {
    k: "profile",
    get title() {
      return t("data.teachonboard.bio.title");
    },
    get body() {
      return t("data.teachonboard.bio.body");
    },
    get cta() {
      return t("data.teachonboard.bio.cta");
    },
    go: "profile",
    get meta() {
      return t("data.teachonboard.bio.meta");
    },
  },
  {
    k: "course",
    get title() {
      return t("data.teachonboard.course.title");
    },
    get body() {
      return t("data.teachonboard.course.body");
    },
    get cta() {
      return t("data.teachonboard.course.cta");
    },
    go: "editor",
    get meta() {
      return t("data.teachonboard.draft", { id: "PF-310" });
    },
  },
  {
    k: "lessons",
    get title() {
      return t("data.teachonboard.lessons.title");
    },
    get body() {
      return t("data.teachonboard.lessons.body");
    },
    get cta() {
      return t("data.teachonboard.lessons.cta");
    },
    go: "content",
    get meta() {
      return t("data.teachonboard.lessons.meta", {
        done: number(4),
        total: number(12),
      });
    },
  },
  {
    k: "cohort",
    get title() {
      return t("data.teachonboard.cohort.title");
    },
    get body() {
      return t("data.teachonboard.cohort.body");
    },
    get cta() {
      return t("data.teachonboard.cohort.cta");
    },
    go: "cohort",
    get meta() {
      return t("data.teachonboard.cohort.meta", {
        no: number(4, { minimumIntegerDigits: 2, useGrouping: false }),
      });
    },
  },
  {
    k: "payouts",
    get title() {
      return t("data.teachonboard.payouts.title");
    },
    get body() {
      return t("data.teachonboard.payouts.body");
    },
    get cta() {
      return t("data.teachonboard.payouts.cta");
    },
    go: "payouts",
  },
  {
    k: "review",
    get title() {
      return t("data.teachonboard.review.title");
    },
    get body() {
      return t("data.teachonboard.review.body");
    },
    get cta() {
      return t("data.teachonboard.review.cta");
    },
    go: "teach",
  },
];

export interface PayRow {
  icon: string;
  label: string;
  value: string;
  /** Renders the value in the mono face — the one that is a figure. */
  mono?: boolean;
}

export const ONBOARD_PAY: PayRow[] = [
  {
    icon: "percent",
    get label() {
      return t("data.teachonboard.pay.share");
    },
    get value() {
      return t("data.teachonboard.pay.shareValue", { pct: number(88) });
    },
  },
  {
    icon: "calendar",
    get label() {
      return t("data.teachonboard.pay.paid");
    },
    get value() {
      return t("data.teachonboard.pay.paidValue");
    },
  },
  {
    icon: "banknote",
    get label() {
      return t("data.teachonboard.pay.minimum");
    },
    get value() {
      return money(50);
    },
    mono: true,
  },
];

/**
 * The four promises an instructor makes by teaching here.
 *
 * Written out as literal keys so all four are checked against every bundle;
 * a key assembled from the index would only fail in front of a reader.
 */
const ONBOARD_RULE_KEYS = [
  "data.teachonboard.rule.1",
  "data.teachonboard.rule.2",
  "data.teachonboard.rule.3",
  "data.teachonboard.rule.4",
] as const satisfies readonly MessageKey[];

export const ONBOARD_RULES: string[] = lazyStrings(
  ONBOARD_RULE_KEYS.length,
  (i) => t(ONBOARD_RULE_KEYS[i]),
);
