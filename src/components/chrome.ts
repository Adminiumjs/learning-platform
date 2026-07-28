/*
 * Chrome configuration: the brand, the nav, the dock's screen lists, and the
 * footer links.
 *
 * Kept out of the components so the dock and the mobile sheet quote the same
 * arrays, and so adding a screen is a one-line edit in one file.
 *
 * Naming: the app is "Learning Platform" — that is the repo, the package and
 * the marketplace listing. "Yara's Academy" is the fictional school the demo
 * portrays, the same way the storefront demo is "Northline". Brand strings
 * live here; nothing else in the app hardcodes them.
 */

import type { DockScreen, NavLink, Persona, ViewId } from "../data/types";

/* ------------------------------------------------------------- the brand */

export const BRAND = {
  name: "Yara's Academy",
  /** The single-letter mark in the header and footer. */
  mark: "Y",
  /** Shown in the footer, under the wordmark. */
  legal: "© 2026 Yara's Academy. A demo course platform shipped with Adminium.",
  /** The mono domain chip. Matches the demo path this app deploys to. */
  domain: "adminium.dev/demo/learning-platform",
} as const;

/* ---------------------------------------------------------------- the nav */

const STUDENT_NAV: NavLink[] = [
  { label: "Courses", view: "catalog", icon: "layout-grid" },
  { label: "My learning", view: "learning", icon: "graduation-cap" },
  { label: "Classroom", view: "classroom", icon: "monitor-play" },
  { label: "Discussion", view: "board", icon: "message-square-text" },
  { label: "Grades", view: "grades", icon: "trophy" },
];

const INSTRUCTOR_NAV: NavLink[] = [
  { label: "Dashboard", view: "teach", icon: "gauge" },
  { label: "Content", view: "content", icon: "list-tree" },
  { label: "Grading", view: "grading", icon: "clipboard-check" },
  { label: "Q&A", view: "inbox", icon: "inbox" },
  { label: "Analytics", view: "analytics", icon: "trending-up" },
];

export function navFor(persona: Persona): NavLink[] {
  return persona === "student" ? STUDENT_NAV : INSTRUCTOR_NAV;
}

/* ------------------------------------------------------------ the footer */

export const FOOTER_LINKS: { label: string; view: ViewId }[] = [
  { label: "Courses", view: "catalog" },
  { label: "Reviews", view: "reviews" },
  { label: "Discussion", view: "board" },
  { label: "Q&A", view: "qa" },
  { label: "Teach", view: "teach" },
];

/* -------------------------------------------------------------- the dock */

/**
 * Every screen, grouped by persona, in the order the dock lists them.
 *
 * A screen with no entry here has no chip — which is how spec 20 §1.1 asks
 * for unbuilt screens to be handled: hidden, never a dead button. All 54 are
 * built, so all 54 are listed.
 */
export const STUDENT_SCREENS: DockScreen[] = [
  { view: "catalog", label: "Catalog", icon: "layout-grid" },
  { view: "landing", label: "Landing page", icon: "megaphone" },
  { view: "course", label: "Course", icon: "book-open" },
  { view: "checkout", label: "Checkout", icon: "credit-card" },
  { view: "learning", label: "My learning", icon: "graduation-cap" },
  { view: "classroom", label: "Classroom", icon: "monitor-play" },
  { view: "qa", label: "Q&A", icon: "messages-square" },
  { view: "board", label: "Discussion", icon: "message-square-text" },
  { view: "rooms", label: "Study rooms", icon: "video" },
  { view: "assignment", label: "Assignment", icon: "pen-line" },
  { view: "peer", label: "Peer review", icon: "users" },
  { view: "exam", label: "Exam", icon: "file-check" },
  { view: "grades", label: "Grades", icon: "trophy" },
  { view: "streaks", label: "Streaks", icon: "flame" },
  { view: "certificate", label: "Certificate", icon: "award" },
  { view: "archive", label: "Archive", icon: "folder-clock" },
  { view: "reviews", label: "Reviews", icon: "star" },
  { view: "alumni", label: "Alumni", icon: "users-round" },
  { view: "live", label: "Live", icon: "radio" },
  { view: "mobile", label: "Mobile app", icon: "smartphone" },
  { view: "downloads", label: "Downloads", icon: "download" },
  { view: "search", label: "Search", icon: "search" },
  { view: "notifs", label: "Notifications", icon: "bell" },
  { view: "notes", label: "Notes", icon: "notebook-pen" },
  { view: "saved", label: "Saved", icon: "bookmark" },
  { view: "compare", label: "Compare", icon: "git-compare" },
  { view: "billing", label: "Orders", icon: "credit-card" },
  { view: "seats", label: "Team seats", icon: "users-round" },
  { view: "teambilling", label: "Organisation", icon: "building-2" },
  { view: "refund", label: "Refund", icon: "receipt" },
  { view: "scholarship", label: "Scholarship", icon: "heart-handshake" },
  { view: "profile", label: "Profile", icon: "user-round" },
  { view: "signin", label: "Sign in", icon: "log-in" },
  { view: "onboarding", label: "Onboarding", icon: "sparkles" },
  { view: "empty", label: "Empty states", icon: "box" },
  { view: "offline", label: "Offline", icon: "wifi-off" },
  { view: "404", label: "404", icon: "unplug" },
];

export const INSTRUCTOR_SCREENS: DockScreen[] = [
  { view: "teach", label: "Dashboard", icon: "gauge" },
  { view: "teachonboard", label: "Get started", icon: "sparkles" },
  { view: "content", label: "Course content", icon: "list-tree" },
  { view: "grading", label: "Grading queue", icon: "clipboard-check" },
  { view: "inbox", label: "Q&A inbox", icon: "inbox" },
  { view: "announce", label: "Announcements", icon: "megaphone" },
  { view: "roster", label: "Roster", icon: "users" },
  { view: "student", label: "Student", icon: "user-round" },
  { view: "messages", label: "Messages", icon: "send" },
  { view: "editor", label: "Course editor", icon: "settings-2" },
  { view: "lessoned", label: "Lesson editor", icon: "film" },
  { view: "exambuilder", label: "Exam builder", icon: "file-check" },
  { view: "cohort", label: "Cohort setup", icon: "calendar-cog" },
  { view: "waitlist", label: "Waitlist", icon: "users-round" },
  { view: "certificates", label: "Certificates", icon: "award" },
  { view: "analytics", label: "Analytics", icon: "trending-up" },
  { view: "payouts", label: "Payouts", icon: "banknote" },
];

export function screensFor(persona: Persona): DockScreen[] {
  return persona === "student" ? STUDENT_SCREENS : INSTRUCTOR_SCREENS;
}

/** The two screens that render without the header and footer. */
export const BARE_VIEWS = new Set<ViewId>(["signin", "onboarding"]);
