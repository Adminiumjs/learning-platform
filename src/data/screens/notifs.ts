/*
 * Notification feed seed — the comp's `NOTIFS` table.
 *
 * Page-local: the feed is presentational, and every row is really a pointer at
 * a screen that owns the truth (the classroom, the Q&A, the grade). Read state
 * lives in the store as `nfRead`, so nothing here is mutable.
 */

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
    title: "Week 3 is open — Grids and rhythm is up",
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
    title: "Yara answered your question about the 13px caption",
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
    title: "Live critique on Thursday at 18:00",
    sub: "Six specimens on the running order",
    at: "07:40",
    unread: false,
    go: "live",
  },
  {
    id: "f4",
    group: "This week",
    icon: "award",
    tone: "pos",
    title: "Your token sheet was graded · 17 / 20",
    sub: "Feedback from Yara Haddad",
    at: "Mon",
    unread: false,
    go: "grades",
  },
  {
    id: "f5",
    group: "This week",
    icon: "clock",
    tone: "warn",
    title: "Type specimen page is due Friday",
    sub: "20 points · module 03",
    at: "Mon",
    unread: false,
    go: "assignment",
  },
  {
    id: "f6",
    group: "This week",
    icon: "message-square-text",
    tone: "info",
    title: "Tomás replied in “4px or 8px spacing?”",
    sub: "Discussion · Week 3",
    at: "Sun",
    unread: false,
    go: "board",
  },
  {
    id: "f7",
    group: "This week",
    icon: "megaphone",
    tone: "accent",
    title: "Office hours move to Thursday",
    sub: "Announcement from Yara",
    at: "Fri",
    unread: false,
    go: "learning",
  },
];
