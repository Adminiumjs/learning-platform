/*
 * The demo dock (spec 20 §4.5).
 *
 * This is the demo. It sits above the app — no device frame, because this is
 * a responsive web app rather than a terminal — and carries, left to right:
 *
 *   • a "Demo" label chip;
 *   • the persona segment, Student | Instructor. Switching it is what closes
 *     the loop: grade a submission as the instructor, switch back, and the
 *     grade is on the student's screen;
 *   • the course-mode segment, Self-paced | Cohort, which turns the whole
 *     drip system on and off;
 *   • the demo-clock controls. "Advance one week" is the single most
 *     important button in the app — it is what makes a locked lesson visibly
 *     unlock inside a sixty-second demo (D6);
 *   • a theme toggle;
 *   • screen chips for the active persona;
 *   • per-screen context actions.
 *
 * Unbuilt screens would simply have no chip (§1.1: never a dead button). All
 * 54 are built, so all 54 are listed.
 */

import { useMemo } from "react";
import { EXAM_RULES, MY_ASSIGNMENT } from "../data/demo";
import type { CourseMode, DockAction, Persona } from "../data/types";
import { clockLabel } from "../lib/schedule";
import { useAppStore } from "../state/store";
import { screensFor } from "./chrome";
import { Icon } from "./Icon";
import { Segmented } from "./Primitives";

const PERSONAS: { id: Persona; label: string; icon: string }[] = [
  { id: "student", label: "Student", icon: "graduation-cap" },
  { id: "instructor", label: "Instructor", icon: "presentation" },
];

const MODES: { id: CourseMode; label: string }[] = [
  { id: "self", label: "Self-paced" },
  { id: "cohort", label: "Cohort" },
];

export function DemoDock() {
  const view = useAppStore((s) => s.view);
  const persona = useAppStore((s) => s.persona);
  const mode = useAppStore((s) => s.mode);
  const week = useAppStore((s) => s.week);
  const theme = useAppStore((s) => s.theme);
  const actions = useDockActions();

  const setPersona = useAppStore((s) => s.setPersona);
  const setMode = useAppStore((s) => s.setMode);
  const advanceWeek = useAppStore((s) => s.advanceWeek);
  const resetWeek = useAppStore((s) => s.resetWeek);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const go = useAppStore((s) => s.go);

  const screens = screensFor(persona);

  return (
    <div className="lp-dock">
      <div className="lp-dock__panel">
        <div className="lp-dock__top">
          <span className="lp-dock__label">
            <Icon name="app-window" size={14} />
            Demo
          </span>

          <Segmented
            options={PERSONAS}
            value={persona}
            onChange={setPersona}
            label="Persona"
          />

          <span className="lp-dock__rule" />

          <Segmented options={MODES} value={mode} onChange={setMode} label="Course mode" />

          <span className="lp-dock__rule" />

          <div className="lp-dock__clock">
            <button type="button" className="lp-gi lp-dock__btn" onClick={advanceWeek}>
              <Icon name="calendar-arrow-up" size={14} />
              Advance one week
            </button>
            <button type="button" className="lp-gi lp-dock__btn" onClick={resetWeek}>
              <Icon name="rotate-ccw" size={14} />
              Reset to week 1
            </button>
            <span className="lp-dock__readout">{clockLabel(week)}</span>
          </div>

          <button
            type="button"
            className="lp-gi lp-iconbtn lp-dock__theme"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          </button>
        </div>

        <div className="lp-dock__bottom">
          <div className="lp-dock__screens">
            {screens.map((s) => (
              <button
                key={s.view}
                type="button"
                className={`lp-chip lp-dock__chip${view === s.view ? " is-active" : ""}`}
                onClick={() => go(s.view)}
                aria-pressed={view === s.view}
              >
                <Icon name={s.icon} size={14} />
                {s.label}
              </button>
            ))}
          </div>

          {actions.length > 0 ? (
            <>
              <span className="lp-dock__rule lp-dock__rule--strong" />
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="lp-gi lp-dock__btn"
                  onClick={a.run}
                >
                  <Icon name={a.icon} size={14} />
                  {a.label}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- per-screen actions -- */

/**
 * The context actions for the current screen.
 *
 * Each one exists to make something reachable in a demo that would otherwise
 * take real time: grading that arrives, an answer that appears, a week that
 * passes. They are the shortcuts a presenter needs, not app features.
 */
function useDockActions(): DockAction[] {
  const view = useAppStore((s) => s.view);
  const ckDecline = useAppStore((s) => s.ckDecline);
  const lvJoined = useAppStore((s) => s.lvJoined);
  const dbThread = useAppStore((s) => s.dbThread);
  const dbAdded = useAppStore((s) => s.dbAdded);

  const set = useAppStore((s) => s.set);
  const reload = useAppStore((s) => s.reload);
  const showToast = useAppStore((s) => s.showToast);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const completeAll = useAppStore((s) => s.completeAll);
  const fillExam = useAppStore((s) => s.fillExam);
  const simulateAnswer = useAppStore((s) => s.simulateAnswer);
  const gradeMine = useAppStore((s) => s.gradeMine);

  return useMemo(() => {
    switch (view) {
      case "catalog":
      case "learning":
      case "reviews":
        return [{ label: "Reload list", icon: "refresh-cw", run: reload }];

      case "checkout":
        return [
          {
            label: ckDecline ? "Card will decline" : "Card will approve",
            icon: ckDecline ? "x-circle" : "check-circle",
            run: () => set({ ckDecline: !ckDecline, ckError: false }),
          },
          {
            label: "Reset checkout",
            icon: "rotate-ccw",
            run: () => set({ ckDone: false, ckError: false, ckBusy: false }),
          },
        ];

      case "classroom":
        return [
          { label: "Reset progress", icon: "rotate-ccw", run: resetProgress },
          { label: "Complete all", icon: "check-check", run: completeAll },
        ];

      case "exam":
        return [
          { label: "Fill answers", icon: "wand-2", run: fillExam },
          {
            label: "Reset exam",
            icon: "rotate-ccw",
            run: () =>
              set({
                exStarted: false,
                exSubmitted: false,
                exI: 0,
                exAns: {},
                exLeft: EXAM_RULES.durationSec,
                exAttempts: 0,
              }),
          },
        ];

      case "qa":
      case "inbox":
        return [{ label: "Simulate an answer", icon: "sparkles", run: simulateAnswer }];

      case "assignment":
        return [
          { label: "Simulate grading", icon: "award", run: gradeMine },
          {
            label: "Reset submission",
            icon: "rotate-ccw",
            run: () => set({ asState: "draft", asAt: null, gradedMine: false }),
          },
        ];

      case "grading":
        return [
          {
            label: "Reset queue",
            icon: "rotate-ccw",
            run: () => set({ gqDone: {}, gqI: 0, gqPts: "", gqFb: "" }),
          },
        ];

      case "board":
        return [
          {
            label: "Simulate a reply",
            icon: "sparkles",
            run: () => {
              const id = dbThread ?? "t2";
              const next = { ...dbAdded };
              next[id] = [
                ...(next[id] ?? []),
                {
                  who: "Nadia Brandt",
                  ini: "NB",
                  role: "Teaching assistant",
                  staff: true,
                  at: "Just now",
                  votes: 0,
                  text: "Jumping in: write the rule down in the thread once you land on it, and I'll fold it into the week 4 notes so nobody has to scroll for it.",
                },
              ];
              set({ dbAdded: next, dbThread: id });
              showToast("Nadia replied in the thread.", "sparkles");
            },
          },
        ];

      case "grades":
      case "certificate":
        return [
          {
            label: "Finish everything",
            icon: "trophy",
            run: () => {
              completeAll();
              set({ exSubmitted: true, exStarted: true, gradedMine: true, asState: "graded" });
              showToast("Course complete — the certificate is unlocked.", "trophy");
            },
          },
        ];

      case "live":
        return [
          {
            label: lvJoined ? "Rewind to before" : "Jump to after the session",
            icon: lvJoined ? "rewind" : "fast-forward",
            run: () => set({ lvJoined: !lvJoined }),
          },
        ];

      case "content":
        return [
          {
            label: "Reset releases",
            icon: "rotate-ccw",
            run: () => {
              set({ rel: {} });
              showToast("Release schedule back to the seeded dates.", "rotate-ccw");
            },
          },
        ];

      case "peer":
        return [
          {
            label: "Reset reviews",
            icon: "rotate-ccw",
            run: () => set({ prvDone: {}, prvI: 0, prvScore: {}, prvText: {} }),
          },
        ];

      case "streaks":
        return [
          {
            label: "Log today",
            icon: "flame",
            run: () => {
              set({ stToday: true });
              showToast("Today logged. Streak intact.", "flame");
            },
          },
        ];

      case "certificates":
        return [
          {
            label: "Issue all",
            icon: "award",
            run: () => showToast("Demo certificates — nothing is issued here.", "award"),
          },
        ];

      case "offline":
        return [
          {
            label: "Try again",
            icon: "refresh-cw",
            run: () => {
              set({ ofTrying: true });
              showToast("Still offline. That is the point of this screen.", "wifi-off");
            },
          },
        ];

      case "student":
        return [
          {
            label: "Grade the specimen",
            icon: "award",
            run: () => {
              gradeMine();
              showToast(
                `Graded ${MY_ASSIGNMENT.grade} / ${MY_ASSIGNMENT.points} — switch to Student to see it land.`,
                "award",
              );
            },
          },
        ];

      default:
        return [];
    }
  }, [
    view, ckDecline, lvJoined, dbThread, dbAdded,
    set, reload, showToast, resetProgress, completeAll, fillExam, simulateAnswer, gradeMine,
  ]);
}
