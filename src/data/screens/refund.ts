/*
 * Refund request — page-local seed copy.
 *
 * The five reasons and the three-step timeline are this screen's own writing,
 * not catalogue data, so they live here. Both are deliberately short: the
 * whole point of the screen is that asking for money back is not an ordeal.
 */

export interface RefundReason {
  id: string;
  label: string;
}

export const REFUND_REASONS: RefundReason[] = [
  { id: "pace", label: "The pace is not right for me" },
  { id: "time", label: "My week got away from me" },
  { id: "expected", label: "Not what I expected" },
  { id: "tech", label: "Something is broken" },
  { id: "other", label: "Another reason" },
];

export interface RefundStep {
  label: string;
  /** When it happens, not a date — nobody can promise a date. */
  at: string;
  icon: string;
  done: boolean;
}

export const REFUND_TIMELINE: RefundStep[] = [
  { label: "Request received", at: "Just now", icon: "check", done: true },
  { label: "Read by a human", at: "Within 2 days", icon: "user-round", done: false },
  { label: "Money back on your card", at: "3–5 days after", icon: "banknote", done: false },
];

/** The reference the confirmation hands back. */
export const REFUND_REF = "Reference YA-RF-118";

/**
 * The 14-day window closes at the end of week 2 of the cohort, so the demo
 * clock decides which policy line the form shows.
 */
export const REFUND_WINDOW_WEEKS = 2;

export const REFUND_POLICY = {
  inside:
    "You are inside the 14-day window, so this is automatic. The money is back with you in 3–5 days.",
  late: "You are past the 14-day window, so this one gets read by a person. Tell us what happened — we are reasonable.",
} as const;
