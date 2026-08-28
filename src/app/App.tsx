/*
 * App — the whole platform, both personas.
 *
 * Routing is the `view` string on the Zustand store (house rule: no router).
 * `renderView` is an exhaustive switch over all 54 ViewIds, so adding a view
 * to the union without adding a screen here is a compile error rather than a
 * blank page.
 *
 * Around the switch sits the global chrome: the demo dock, the sticky header,
 * the mobile sheet, the footer, and the two overlays (toast, confirm modal).
 * Two screens — sign in and onboarding — render without header and footer;
 * those components return null for them rather than App branching.
 *
 * Nothing here measures the window. Every layout switch the comp made in JS
 * is a CSS media query in components.css or a screen sheet.
 */

import { useEffect } from "react";

import { isConnected } from "../data/source";
import {
  DemoDock,
  Footer,
  Header,
  INSTRUCTOR_SCREENS,
  MobileSheet,
  Modal,
  STUDENT_SCREENS,
  Toast,
} from "../components";
import type { ViewId } from "../data/types";
import { useI18n } from "../i18n";
import { setAmbient } from "../i18n/ambient";
import { useAppStore } from "../state/store";

import Alumni from "../screens/Alumni";
import Analytics from "../screens/Analytics";
import Announce from "../screens/Announce";
import Archive from "../screens/Archive";
import Assignment from "../screens/Assignment";
import Billing from "../screens/Billing";
import Board from "../screens/Board";
import Catalog from "../screens/Catalog";
import Certificate from "../screens/Certificate";
import Certificates from "../screens/Certificates";
import Checkout from "../screens/Checkout";
import Classroom from "../screens/Classroom";
import CohortSetup from "../screens/CohortSetup";
import Compare from "../screens/Compare";
import Content from "../screens/Content";
import Course from "../screens/Course";
import Downloads from "../screens/Downloads";
import Editor from "../screens/Editor";
import Empty from "../screens/Empty";
import Exam from "../screens/Exam";
import ExamBuilder from "../screens/ExamBuilder";
import Grades from "../screens/Grades";
import Grading from "../screens/Grading";
import Inbox from "../screens/Inbox";
import Landing from "../screens/Landing";
import Learning from "../screens/Learning";
import LessonEditor from "../screens/LessonEditor";
import Live from "../screens/Live";
import Messages from "../screens/Messages";
import Mobile from "../screens/Mobile";
import NotFound from "../screens/NotFound";
import Notes from "../screens/Notes";
import Notifs from "../screens/Notifs";
import Offline from "../screens/Offline";
import Onboarding from "../screens/Onboarding";
import Payouts from "../screens/Payouts";
import Peer from "../screens/Peer";
import Profile from "../screens/Profile";
import Qa from "../screens/Qa";
import Refund from "../screens/Refund";
import Reviews from "../screens/Reviews";
import Rooms from "../screens/Rooms";
import Roster from "../screens/Roster";
import Saved from "../screens/Saved";
import Scholarship from "../screens/Scholarship";
import Search from "../screens/Search";
import Seats from "../screens/Seats";
import SignIn from "../screens/SignIn";
import Streaks from "../screens/Streaks";
import StudentDetail from "../screens/StudentDetail";
import Teach from "../screens/Teach";
import TeachOnboard from "../screens/TeachOnboard";
import TeamBilling from "../screens/TeamBilling";
import Waitlist from "../screens/Waitlist";

/* --------------------------------------------------------------- routing */

/** Every id the dock lists — which is every id there is. */
const VIEW_IDS = new Set<string>(
  [...STUDENT_SCREENS, ...INSTRUCTOR_SCREENS].map((s) => s.view),
);

function isViewId(value: string): value is ViewId {
  return VIEW_IDS.has(value);
}

/** Exhaustive over ViewId — TypeScript enforces the 54. */
function renderView(view: ViewId) {
  switch (view) {
    /* --- student --- */
    case "catalog":
      return <Catalog />;
    case "landing":
      return <Landing />;
    case "course":
      return <Course />;
    case "checkout":
      return <Checkout />;
    case "learning":
      return <Learning />;
    case "classroom":
      return <Classroom />;
    case "qa":
      return <Qa />;
    case "board":
      return <Board />;
    case "rooms":
      return <Rooms />;
    case "assignment":
      return <Assignment />;
    case "peer":
      return <Peer />;
    case "exam":
      return <Exam />;
    case "grades":
      return <Grades />;
    case "streaks":
      return <Streaks />;
    case "certificate":
      return <Certificate />;
    case "archive":
      return <Archive />;
    case "reviews":
      return <Reviews />;
    case "alumni":
      return <Alumni />;
    case "live":
      return <Live />;
    case "mobile":
      return <Mobile />;
    case "downloads":
      return <Downloads />;
    case "search":
      return <Search />;
    case "notifs":
      return <Notifs />;
    case "notes":
      return <Notes />;
    case "saved":
      return <Saved />;
    case "compare":
      return <Compare />;
    case "billing":
      return <Billing />;
    case "seats":
      return <Seats />;
    case "teambilling":
      return <TeamBilling />;
    case "refund":
      return <Refund />;
    case "scholarship":
      return <Scholarship />;
    case "profile":
      return <Profile />;
    case "signin":
      return <SignIn />;
    case "onboarding":
      return <Onboarding />;
    case "empty":
      return <Empty />;
    case "offline":
      return <Offline />;
    case "404":
      return <NotFound />;

    /* --- instructor --- */
    case "teach":
      return <Teach />;
    case "teachonboard":
      return <TeachOnboard />;
    case "content":
      return <Content />;
    case "grading":
      return <Grading />;
    case "inbox":
      return <Inbox />;
    case "announce":
      return <Announce />;
    case "roster":
      return <Roster />;
    case "student":
      return <StudentDetail />;
    case "messages":
      return <Messages />;
    case "editor":
      return <Editor />;
    case "lessoned":
      return <LessonEditor />;
    case "exambuilder":
      return <ExamBuilder />;
    case "cohort":
      return <CohortSetup />;
    case "waitlist":
      return <Waitlist />;
    case "certificates":
      return <Certificates />;
    case "analytics":
      return <Analytics />;
    case "payouts":
      return <Payouts />;

    default: {
      /* Unreachable while the switch stays exhaustive. */
      const never: never = view;
      void never;
      return <NotFound />;
    }
  }
}

/* ------------------------------------------------------------- the shell */

export function App() {
  const view = useAppStore((s) => s.view);
  const theme = useAppStore((s) => s.theme);

  /*
   * Publish the live locale to the module-level bridge before anything below
   * renders. `lib/schedule.ts`, `lib/exam.ts` and the store's toast copy all
   * run outside React and cannot hold a hook; this is the one place that knows
   * both sides. Assigning during render (rather than in an effect) matters:
   * children render after this line, so the first paint after a locale switch
   * is already in the new locale instead of one frame behind.
   */
  const { locale, t, money, number } = useI18n();
  setAmbient(locale, t, money, number);

  /* --- theme: an explicit stamp always beats prefers-color-scheme --- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useSystemTheme();
  useDemoClock();
  useEscapeKey();
  useDeepLink();

  return (
    <>
      {!isConnected() && <DemoDock />}
      <div className="lp-app">
        <Header />
        <MobileSheet />
        <main className="lp-main lp-screen" key={view}>
          {renderView(view)}
        </main>
        <Footer />
      </div>
      <Toast />
      <Modal />
    </>
  );
}

/* -------------------------------------------------------------- the hooks */

/** Follow the OS palette until the user picks a side with the dock toggle. */
function useSystemTheme(): void {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = useAppStore.getState().syncSystemTheme;
    sync(mq.matches ? "dark" : "light");

    const onChange = (e: MediaQueryListEvent) => {
      useAppStore.getState().syncSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
}

/**
 * The one-second heartbeat.
 *
 * It drives the live-session countdown, the lesson player head and the exam
 * timer. Only `elapsed` (and `exLeft`, while an attempt runs) changes, so a
 * screen that selects neither never re-renders on a tick.
 */
function useDemoClock(): void {
  useEffect(() => {
    const id = window.setInterval(() => useAppStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, []);
}

/** Escape closes the modal first, then the mobile sheet. */
function useEscapeKey(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const s = useAppStore.getState();
      if (s.modal) s.closeModal();
      else if (s.menu) s.closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}

/**
 * `#screen=<view>` deep links.
 *
 * The comp used these so its screen-gallery page could iframe each screen
 * directly; keeping them means a demo link can open on any of the 54 without
 * a router. An unknown value is ignored rather than routed to 404, so a stale
 * link lands on the catalog.
 */
function useDeepLink(): void {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const screen = params.get("screen");
    if (!screen || !isViewId(screen)) return;

    const { go } = useAppStore.getState();
    /* `go` derives the persona from the view, so both halves deep-link. */
    go(screen);
  }, []);
}

export default App;
