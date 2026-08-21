/*
 * Notification feed seed — the comp's `NOTIFS` table.
 *
 * Page-local: the feed is presentational, and every row is really a pointer at
 * a screen that owns the truth (the classroom, the Q&A, the grade). Read state
 * lives in the store as `nfRead`, so nothing here is mutable.
 *
 * Translation. A notification is the product talking, not a character, so the
 * lines are translated — with the lesson and course titles left inside them in
 * English, because those are the fiction's own names. `NOTIF_GROUPS` stays as
 * written: those two strings are the `group` discriminator every row is
 * bucketed by, and their reader-facing names are `data.notifs.group.*`.
 *
 * The `at` column was a hand-written "Mon" / "Fri"; it now asks `Intl` for the
 * weekday, so a Czech reader gets "po" and an Egyptian one "الاثنين".
 */

import { t } from "../../i18n/ambient";
import { weekdayName } from "../../lib/schedule";
import type { ViewId } from "../types";

/** The two buckets the feed groups by, in the order they render. */
export const NOTIF_GROUPS = ["Today", "This week"] as const;

export type NotifGroup = (typeof NOTIF_GROUPS)[number];

export interface Notif {
  id: string;
  group: NotifGroup;
  /** Kebab-case lucide name. */
  icon: string;
  /** Token pair for the tile — unlocks are accent, deadlines warn. */
  tone: "accent" | "pos" | "warn" | "info";
  title: string;
  sub: string;
  /** Clock or weekday, as written. */
  at: string;
  unread: boolean;
  /** Where the row goes when tapped. */
  go: ViewId;
}

export const NOTIFS: Notif[] = [
  {
    id: "f1",
    group: "Today",
    icon: "unlock",
    tone: "accent",
    get title() {
      return t("data.notifs.weekOpen");
    },
    sub: "Design Systems from Scratch",
    at: "09:12",
    unread: true,
    go: "classroom",
  },
  {
    id: "f2",
    group: "Today",
    icon: "message-circle-reply",
    tone: "pos",
    get title() {
      return t("data.notifs.answered");
    },
    sub: "A type scale you can defend",
    at: "08:12",
    unread: true,
    go: "qa",
  },
  {
    id: "f3",
    group: "Today",
    icon: "radio",
    tone: "accent",
    get title() {
      return t("data.notifs.liveCritique");
    },
    get sub() {
      return t("data.notifs.liveCritiqueSub");
    },
    at: "07:40",
    unread: false,
    go: "live",
  },
  {
    id: "f4",
    group: "This week",
    icon: "award",
    tone: "pos",
    get title() {
      return t("data.notifs.graded");
    },
    get sub() {
      return t("data.notifs.gradedSub");
    },
    get at() {
      return weekdayName(1);
    },
    unread: false,
    go: "grades",
  },
  {
    id: "f5",
    group: "This week",
    icon: "clock",
    tone: "warn",
    get title() {
      return t("data.notifs.dueFriday");
    },
    get sub() {
      return t("data.notifs.dueFridaySub");
    },
    get at() {
      return weekdayName(1);
    },
    unread: false,
    go: "assignment",
  },
  {
    id: "f6",
    group: "This week",
    icon: "message-square-text",
    tone: "info",
    get title() {
      return t("data.notifs.replied");
    },
    get sub() {
      return t("data.notifs.repliedSub");
    },
    get at() {
      return weekdayName(0);
    },
    unread: false,
    go: "board",
  },
  {
    id: "f7",
    group: "This week",
    icon: "megaphone",
    tone: "accent",
    get title() {
      return t("data.notifs.officeHours");
    },
    get sub() {
      return t("data.notifs.officeHoursSub");
    },
    get at() {
      return weekdayName(5);
    },
    unread: false,
    go: "learning",
  },
];
