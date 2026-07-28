/*
 * Mobile-app screen seed — the copy and the tiles that only this screen shows.
 *
 * Page-local on purpose: none of it is a record a customer would edit in the
 * generated dashboard, so it stays out of the `dataSource` contract. The
 * numbers are in-fiction and verbatim from the comp.
 */

import type { ViewId } from "../types";

/** The three sections of the phone app; also the bottom tab bar. */
export type MobileTab = "learn" | "discuss" | "you";

export interface MobileTabDef {
  id: MobileTab;
  label: string;
  icon: string;
}

export const MOBILE_TABS: MobileTabDef[] = [
  { id: "learn", label: "Learn", icon: "play" },
  { id: "discuss", label: "Discuss", icon: "message-square-text" },
  { id: "you", label: "You", icon: "user-round" },
];

/** Kicker + title per tab — the phone's own page head. */
export const MOBILE_HEADS: Record<MobileTab, { kicker: string | null; title: string }> = {
  /** Learn's kicker is the demo clock's "Week n of 8", so it cannot be seeded. */
  learn: { kicker: null, title: "Keep going" },
  discuss: { kicker: "Cohort 03", title: "Discussion" },
  you: { kicker: "Your account", title: "You" },
};

export const MOBILE_INTRO = {
  title: "The app",
  body:
    "Same course, pocket-sized. Download a lesson on the train, answer a thread at lunch, tick it off on the way home.",
  /** The footnote under the phone; the platform line is mono. */
  offline: "Lessons download for offline · ",
  platforms: "iOS 17+ · Android 12+",
};

export const MOBILE_STATS: { value: string; label: string }[] = [
  { value: "21h", label: "Watched" },
  { value: "2", label: "Courses" },
  { value: "17/20", label: "Last grade" },
  { value: "3", label: "Downloads" },
];

export interface MobileAccountRow {
  label: string;
  icon: string;
  /** Static readout. The certificate row's is computed from progress instead. */
  value?: string;
  /** Where the row goes; null rows only toast. */
  view: ViewId | null;
}

export const MOBILE_ACCOUNT_ROWS: MobileAccountRow[] = [
  { label: "Downloads", icon: "download", value: "3 lessons · 412 MB", view: null },
  { label: "Certificate", icon: "award", view: "certificate" },
  { label: "Grades", icon: "trophy", value: "88%", view: "grades" },
  { label: "Notifications", icon: "bell", value: "On", view: "profile" },
];

/** The streak the account card brags about. */
export const MOBILE_STREAK = "6-week streak";
