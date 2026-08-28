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
import { dataSource } from "../data/source";
import type { CourseMode, DockAction, Persona } from "../data/types";
import { LOCALES, LOCALE_TAGS, useI18n, type LocaleTag, type MessageKey } from "../i18n";
import { clockLabel } from "../lib/schedule";
import { useAppStore } from "../state/store";
import { screensFor } from "./chrome";
import { Icon } from "./Icon";
import { Segmented } from "./Primitives";

/* Both tables carry message KEYS; the dock resolves them with `t` on render. */
const PERSONAS: { id: Persona; label: MessageKey; icon: string }[] = [
  { id: "student", label: "chrome.dock.student", icon: "graduation-cap" },
  { id: "instructor", label: "chrome.dock.instructor", icon: "presentation" },
];

const MODES: { id: CourseMode; label: MessageKey }[] = [
  { id: "self", label: "chrome.dock.selfPaced" },
  { id: "cohort", label: "chrome.dock.cohort" },
];

export function DemoDock() {
  const view = useAppStore((s) => s.view);
  const persona = useAppStore((s) => s.persona);
  const mode = useAppStore((s) => s.mode);
  const week = useAppStore((s) => s.week);
  const theme = useAppStore((s) => s.theme);
  const actions = useDockActions();
  const { t, locale, number, setLocale } = useI18n();

  const personas = PERSONAS.map((p) => ({ ...p, label: t(p.label) }));
  const modes = MODES.map((m) => ({ ...m, label: t(m.label) }));

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
            {t("chrome.dock.demo")}
          </span>

          <Segmented
            options={personas}
            value={persona}
            onChange={setPersona}
            label={t("chrome.dock.persona")}
          />

          <span className="lp-dock__rule" />

          <Segmented
            options={modes}
            value={mode}
            onChange={setMode}
            label={t("chrome.dock.courseMode")}
          />

          <span className="lp-dock__rule" />

          <div className="lp-dock__clock">
            <button type="button" className="lp-gi lp-dock__btn" onClick={advanceWeek}>
              <Icon name="calendar-arrow-up" size={14} />
              {t("chrome.dock.advanceWeek")}
            </button>
            <button type="button" className="lp-gi lp-dock__btn" onClick={resetWeek}>
              <Icon name="rotate-ccw" size={14} />
              {t("chrome.dock.resetWeek", { week: number(1) })}
            </button>
            <span className="lp-dock__readout">{clockLabel(week)}</span>
          </div>

          {/*
            The locale picker. Every language is listed by its own endonym —
            someone looking for their language reads it in their language, not
            in yours. `ar-EG` also flips the whole document to RTL, so this is
            the fastest way to prove the layout holds.
          */}
          <label className="lp-dock__lang">
            <Icon name="languages" size={14} />
            <select
              className="lp-dock__langsel"
              value={locale}
              aria-label={t("dock.language")}
              onChange={(e) => setLocale(e.target.value as LocaleTag)}
            >
              {LOCALE_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {LOCALES[tag].native}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="lp-gi lp-iconbtn lp-dock__theme"
            onClick={toggleTheme}
            title={t("chrome.dock.toggleTheme")}
            aria-label={t("chrome.dock.toggleTheme")}
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
                {t(s.label)}
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
  const { t, number } = useI18n();
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
        return [{ label: t("chrome.dock.reloadList"), icon: "refresh-cw", run: reload }];

      case "checkout":
        return [
          {
            label: t(ckDecline ? "chrome.dock.cardDeclines" : "chrome.dock.cardApproves"),
            icon: ckDecline ? "x-circle" : "check-circle",
            run: () => set({ ckDecline: !ckDecline, ckError: false }),
          },
          {
            label: t("chrome.dock.resetCheckout"),
            icon: "rotate-ccw",
            run: () => set({ ckDone: false, ckError: false, ckBusy: false }),
          },
        ];

      case "classroom":
        return [
          { label: t("chrome.dock.resetProgress"), icon: "rotate-ccw", run: resetProgress },
          { label: t("chrome.dock.completeAll"), icon: "check-check", run: completeAll },
        ];

      case "exam":
        return [
          { label: t("chrome.dock.fillAnswers"), icon: "wand-2", run: fillExam },
          {
            label: t("chrome.dock.resetExam"),
            icon: "rotate-ccw",
            run: () =>
              set({
                exStarted: false,
                exSubmitted: false,
                exI: 0,
                exAns: {},
                exLeft: dataSource.examRules().durationSec,
                exAttempts: 0,
              }),
          },
        ];

      case "qa":
      case "inbox":
        return [
          { label: t("chrome.dock.simulateAnswer"), icon: "sparkles", run: simulateAnswer },
        ];

      case "assignment":
        return [
          { label: t("chrome.dock.simulateGrading"), icon: "award", run: gradeMine },
          {
            label: t("chrome.dock.resetSubmission"),
            icon: "rotate-ccw",
            run: () => set({ asState: "draft", asAt: null, gradedMine: false }),
          },
        ];

      case "grading":
        return [
          {
            label: t("chrome.dock.resetQueue"),
            icon: "rotate-ccw",
            run: () => set({ gqDone: {}, gqI: 0, gqPts: "", gqFb: "" }),
          },
        ];

      case "board":
        return [
          {
            label: t("chrome.dock.simulateReply"),
            icon: "sparkles",
            run: () => {
              /*
               * The assistant's identity comes off the data seam rather than
               * being spelled out here, so her name and role badge stay in one
               * place. The post body itself is in-fiction demo content and is
               * deliberately not a message key (18 §3.4).
               */
              const ta = dataSource.assistant();
              const id = dbThread ?? "t2";
              const next = { ...dbAdded };
              next[id] = [
                ...(next[id] ?? []),
                {
                  who: ta.name,
                  ini: ta.initials,
                  role: ta.role,
                  staff: true,
                  at: t("chrome.time.justNow"),
                  votes: 0,
                  text: "Jumping in: write the rule down in the thread once you land on it, and I'll fold it into the week 4 notes so nobody has to scroll for it.",
                },
              ];
              set({ dbAdded: next, dbThread: id });
              showToast(t("chrome.dock.repliedToast", { name: ta.name }), "sparkles");
            },
          },
        ];

      case "grades":
      case "certificate":
        return [
          {
            label: t("chrome.dock.finishEverything"),
            icon: "trophy",
            run: () => {
              completeAll();
              set({ exSubmitted: true, exStarted: true, gradedMine: true, asState: "graded" });
              showToast(t("chrome.dock.finishedToast"), "trophy");
            },
          },
        ];

      case "live":
        return [
          {
            label: t(lvJoined ? "chrome.dock.rewindSession" : "chrome.dock.skipSession"),
            icon: lvJoined ? "rewind" : "fast-forward",
            run: () => set({ lvJoined: !lvJoined }),
          },
        ];

      case "content":
        return [
          {
            label: t("chrome.dock.resetReleases"),
            icon: "rotate-ccw",
            run: () => {
              set({ rel: {} });
              showToast(t("chrome.dock.releasesToast"), "rotate-ccw");
            },
          },
        ];

      case "peer":
        return [
          {
            label: t("chrome.dock.resetReviews"),
            icon: "rotate-ccw",
            run: () => set({ prvDone: {}, prvI: 0, prvScore: {}, prvText: {} }),
          },
        ];

      case "streaks":
        return [
          {
            label: t("chrome.dock.logToday"),
            icon: "flame",
            run: () => {
              set({ stToday: true });
              showToast(t("chrome.dock.loggedToast"), "flame");
            },
          },
        ];

      case "certificates":
        return [
          {
            label: t("chrome.dock.issueAll"),
            icon: "award",
            run: () => showToast(t("chrome.dock.issueAllToast"), "award"),
          },
        ];

      case "offline":
        return [
          {
            label: t("chrome.dock.tryAgain"),
            icon: "refresh-cw",
            run: () => {
              set({ ofTrying: true });
              showToast(t("chrome.dock.tryAgainToast"), "wifi-off");
            },
          },
        ];

      case "student":
        return [
          {
            label: t("chrome.dock.gradeSpecimen"),
            icon: "award",
            run: () => {
              gradeMine();
              showToast(
                t("chrome.dock.gradedToast", {
                  grade: number(dataSource.myAssignment().grade),
                  points: number(dataSource.myAssignment().points),
                }),
                "award",
              );
            },
          },
        ];

      default:
        return [];
    }
  }, [
    view, ckDecline, lvJoined, dbThread, dbAdded, t, number,
    set, reload, showToast, resetProgress, completeAll, fillExam, simulateAnswer, gradeMine,
  ]);
}
