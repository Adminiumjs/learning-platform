/*
 * Refund request — page-local seed copy.
 *
 * The five reasons and the three-step timeline are this screen's own writing,
 * not catalogue data, so they live here. Both are deliberately short: the
 * whole point of the screen is that asking for money back is not an ordeal.
 *
 * Every string here is interface — a form's options, a progress timeline and
 * a policy sentence — so all of it is translated. The reference number is an
 * id and stays as written.
 */

import { number, t } from "../../i18n/ambient";

export interface RefundReason {
  id: string;
  label: string;
}

export const REFUND_REASONS: RefundReason[] = [
  {
    id: "pace",
    get label() {
      return t("data.refund.reason.pace");
    },
  },
  {
    id: "time",
    get label() {
      return t("data.refund.reason.time");
    },
  },
  {
    id: "expected",
    get label() {
      return t("data.refund.reason.expected");
    },
  },
  {
    id: "tech",
    get label() {
      return t("data.refund.reason.tech");
    },
  },
  {
    id: "other",
    get label() {
      return t("data.refund.reason.other");
    },
  },
];

export interface RefundStep {
  label: string;
  /** When it happens, not a date — nobody can promise a date. */
  at: string;
  icon: string;
  done: boolean;
}

export const REFUND_TIMELINE: RefundStep[] = [
  {
    get label() {
      return t("data.refund.step.received");
    },
    get at() {
      return t("data.refund.step.receivedAt");
    },
    icon: "check",
    done: true,
  },
  {
    get label() {
      return t("data.refund.step.read");
    },
    get at() {
      return t("data.refund.step.readAt", { count: number(2) }, 2);
    },
    icon: "user-round",
    done: false,
  },
  {
    get label() {
      return t("data.refund.step.money");
    },
    get at() {
      return t("data.refund.step.moneyAt");
    },
    icon: "banknote",
    done: false,
  },
];

/** The reference the confirmation hands back. */
export const REFUND_REF = "Reference YA-RF-118";

/**
 * The 14-day window closes at the end of week 2 of the cohort, so the demo
 * clock decides which policy line the form shows.
 */
export const REFUND_WINDOW_WEEKS = 2;

export const REFUND_POLICY = {
  get inside() {
    return t("data.refund.policy.inside");
  },
  get late() {
    return t("data.refund.policy.late");
  },
};
