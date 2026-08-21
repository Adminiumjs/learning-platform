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
 *
 * Every `label` in this file is a MESSAGE KEY, not display text. This module is
 * plain data with no hook access, so the label is resolved with `t()` at the
 * render site (`Header`, `MobileSheet`, `Footer`, `DemoDock`) rather than here.
 * The `Labelled<T>` alias below narrows `label` from `string` to `MessageKey`,
 * so a key that does not exist in the bundle is a compile error.
 */

import type { DockScreen, NavLink, Persona, ViewId } from "../data/types";
import type { MessageKey } from "../i18n";

/** The shared-shape types carry `label: string`; here it is always a key. */
type Labelled<T extends { label: string }> = Omit<T, "label"> & { label: MessageKey };

export type NavItem = Labelled<NavLink>;
export type DockScreenItem = Labelled<DockScreen>;

/* ------------------------------------------------------------- the brand */

export const BRAND = {
  /** A proper noun — never translated, in any locale. */
  name: "Yara's Academy",
  /** The single-letter mark in the header and footer. */
  mark: "Y",
  /** Footer small print. A key: the sentence around the brand is translated. */
  legalKey: "chrome.footer.legal",
  /** The copyright year — a number, so the footer formats it through `Intl`. */
  year: 2026,
  /** The mono domain chip. Matches the demo path this app deploys to. */
  domain: "adminium.dev/demo/learning-platform",
} as const;

/* ---------------------------------------------------------------- the nav */

const STUDENT_NAV: NavItem[] = [
  { label: "chrome.nav.courses", view: "catalog", icon: "layout-grid" },
  { label: "chrome.nav.myLearning", view: "learning", icon: "graduation-cap" },
  { label: "chrome.nav.classroom", view: "classroom", icon: "monitor-play" },
  { label: "chrome.nav.discussion", view: "board", icon: "message-square-text" },
  { label: "chrome.nav.grades", view: "grades", icon: "trophy" },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { label: "chrome.nav.dashboard", view: "teach", icon: "gauge" },
  { label: "chrome.nav.content", view: "content", icon: "list-tree" },
  { label: "chrome.nav.grading", view: "grading", icon: "clipboard-check" },
  { label: "chrome.nav.qa", view: "inbox", icon: "inbox" },
  { label: "chrome.nav.analytics", view: "analytics", icon: "trending-up" },
];

export function navFor(persona: Persona): NavItem[] {
  return persona === "student" ? STUDENT_NAV : INSTRUCTOR_NAV;
}

/* ------------------------------------------------------------ the footer */

export const FOOTER_LINKS: { label: MessageKey; view: ViewId }[] = [
  { label: "chrome.nav.courses", view: "catalog" },
  { label: "chrome.nav.reviews", view: "reviews" },
  { label: "chrome.nav.discussion", view: "board" },
  { label: "chrome.nav.qa", view: "qa" },
  { label: "chrome.nav.teach", view: "teach" },
];

/* -------------------------------------------------------------- the dock */

/**
 * Every screen, grouped by persona, in the order the dock lists them.
 *
 * A screen with no entry here has no chip — which is how spec 20 §1.1 asks
 * for unbuilt screens to be handled: hidden, never a dead button. All 54 are
 * built, so all 54 are listed.
 */
export const STUDENT_SCREENS: DockScreenItem[] = [
  { view: "catalog", label: "chrome.screen.catalog", icon: "layout-grid" },
  { view: "landing", label: "chrome.screen.landing", icon: "megaphone" },
  { view: "course", label: "chrome.screen.course", icon: "book-open" },
  { view: "checkout", label: "chrome.screen.checkout", icon: "credit-card" },
  { view: "learning", label: "chrome.screen.learning", icon: "graduation-cap" },
  { view: "classroom", label: "chrome.screen.classroom", icon: "monitor-play" },
  { view: "qa", label: "chrome.screen.qa", icon: "messages-square" },
  { view: "board", label: "chrome.screen.board", icon: "message-square-text" },
  { view: "rooms", label: "chrome.screen.rooms", icon: "video" },
  { view: "assignment", label: "chrome.screen.assignment", icon: "pen-line" },
  { view: "peer", label: "chrome.screen.peer", icon: "users" },
  { view: "exam", label: "chrome.screen.exam", icon: "file-check" },
  { view: "grades", label: "chrome.screen.grades", icon: "trophy" },
  { view: "streaks", label: "chrome.screen.streaks", icon: "flame" },
  { view: "certificate", label: "chrome.screen.certificate", icon: "award" },
  { view: "archive", label: "chrome.screen.archive", icon: "folder-clock" },
  { view: "reviews", label: "chrome.screen.reviews", icon: "star" },
  { view: "alumni", label: "chrome.screen.alumni", icon: "users-round" },
  { view: "live", label: "chrome.screen.live", icon: "radio" },
  { view: "mobile", label: "chrome.screen.mobile", icon: "smartphone" },
  { view: "downloads", label: "chrome.screen.downloads", icon: "download" },
  { view: "search", label: "chrome.screen.search", icon: "search" },
  { view: "notifs", label: "chrome.screen.notifs", icon: "bell" },
  { view: "notes", label: "chrome.screen.notes", icon: "notebook-pen" },
  { view: "saved", label: "chrome.screen.saved", icon: "bookmark" },
  { view: "compare", label: "chrome.screen.compare", icon: "git-compare" },
  { view: "billing", label: "chrome.screen.billing", icon: "credit-card" },
  { view: "seats", label: "chrome.screen.seats", icon: "users-round" },
  { view: "teambilling", label: "chrome.screen.teambilling", icon: "building-2" },
  { view: "refund", label: "chrome.screen.refund", icon: "receipt" },
  { view: "scholarship", label: "chrome.screen.scholarship", icon: "heart-handshake" },
  { view: "profile", label: "chrome.screen.profile", icon: "user-round" },
  { view: "signin", label: "chrome.screen.signin", icon: "log-in" },
  { view: "onboarding", label: "chrome.screen.onboarding", icon: "sparkles" },
  { view: "empty", label: "chrome.screen.empty", icon: "box" },
  { view: "offline", label: "chrome.screen.offline", icon: "wifi-off" },
  { view: "404", label: "chrome.screen.404", icon: "unplug" },
];

export const INSTRUCTOR_SCREENS: DockScreenItem[] = [
  { view: "teach", label: "chrome.screen.teach", icon: "gauge" },
  { view: "teachonboard", label: "chrome.screen.teachonboard", icon: "sparkles" },
  { view: "content", label: "chrome.screen.content", icon: "list-tree" },
  { view: "grading", label: "chrome.screen.grading", icon: "clipboard-check" },
  { view: "inbox", label: "chrome.screen.inbox", icon: "inbox" },
  { view: "announce", label: "chrome.screen.announce", icon: "megaphone" },
  { view: "roster", label: "chrome.screen.roster", icon: "users" },
  { view: "student", label: "chrome.screen.student", icon: "user-round" },
  { view: "messages", label: "chrome.screen.messages", icon: "send" },
  { view: "editor", label: "chrome.screen.editor", icon: "settings-2" },
  { view: "lessoned", label: "chrome.screen.lessoned", icon: "film" },
  { view: "exambuilder", label: "chrome.screen.exambuilder", icon: "file-check" },
  { view: "cohort", label: "chrome.screen.cohort", icon: "calendar-cog" },
  { view: "waitlist", label: "chrome.screen.waitlist", icon: "users-round" },
  { view: "certificates", label: "chrome.screen.certificates", icon: "award" },
  { view: "analytics", label: "chrome.screen.analytics", icon: "trending-up" },
  { view: "payouts", label: "chrome.screen.payouts", icon: "banknote" },
];

export function screensFor(persona: Persona): DockScreenItem[] {
  return persona === "student" ? STUDENT_SCREENS : INSTRUCTOR_SCREENS;
}

/** The two screens that render without the header and footer. */
export const BARE_VIEWS = new Set<ViewId>(["signin", "onboarding"]);
