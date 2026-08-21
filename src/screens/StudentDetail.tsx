/*
 * Student detail — one person out of the roster.
 *
 * Everything an instructor needs before writing to someone: how far through
 * they are, what they have handed in, what they have been doing, and a private
 * note only the teaching side sees. The comp pins the screen to the second
 * roster row (Tomás Lindqvist); that stays, but it reads the row rather than
 * repeating its name, percentage and average as literals.
 *
 * The one deliberate change from the comp is the Message button — see below.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  Pill,
  ProgressRing,
  TextArea,
} from "../components";
import { ASSISTANT } from "../data/demo";
import { conversationIndexFor } from "../data/screens/messages";
import {
  AVG_WATCH_TIME,
  DETAIL_ROW,
  LESSONS_WATCHED,
  QUESTIONS_ASKED,
  STUDENT_ACTIVITY,
  STUDENT_SUBMISSIONS,
} from "../data/screens/student";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { fmtDayMonth, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-student.css";

/** Below half-way through counts as behind — the roster's rule, shared. */
const BEHIND_PCT = 50;

export default function StudentDetail() {
  const { t, number } = useI18n();
  const sdNote = useAppStore((s) => s.sdNote);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const students = dataSource.students();
  const [name, pct, last, avg] = students[DETAIL_ROW];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  /* Everyone in cohort 03 joined in week 1; derived so it survives a clock move. */
  const start = weekStart(1);
  const joined = fmtDayMonth(start);

  const stats = [
    {
      label: t("screensB.studentDetail.statWatched"),
      value: t("screensB.studentDetail.watchedValue", {
        done: number(LESSONS_WATCHED),
        total: number(dataSource.totalLessons()),
      }),
    },
    {
      label: t("screensB.studentDetail.statAverage"),
      value: number(avg / 100, { style: "percent" }),
      strong: true,
    },
    { label: t("screensB.studentDetail.statQuestions"), value: number(QUESTIONS_ASKED) },
    { label: t("screensB.studentDetail.statWatchTime"), value: AVG_WATCH_TIME },
  ];

  /*
   * The comp toasted "A message thread would open here" — but the thread does
   * exist, two screens over, and it is this student's. Opening it closes the
   * loop the Messages screen already opens in the other direction with its
   * "View progress" button. The toast survives as the fallback for a student
   * nobody has written to yet.
   */
  function message(): void {
    const i = conversationIndexFor(name);
    if (i < 0) {
      showToast(t("screensB.studentDetail.noThread"), "send");
      return;
    }
    set({ msI: i });
    go("messages");
  }

  return (
    <div className="lp-page scr-student">
      <button type="button" className="lp-nav sd-back" onClick={() => go("roster")}>
        <Icon name="arrow-left" size={15} />
        {t("screensB.studentDetail.backToRoster")}
      </button>

      <div className="sd-head">
        <Avatar initials={initials} size="xl" className="sd-ava" />

        <div className="sd-head__text">
          <div className="sd-head__name">
            <span className="sd-name">{name}</span>
            {pct < BEHIND_PCT ? (
              <Pill tone="warn" icon="triangle-alert">
                {t("screensB.studentDetail.behind")}
              </Pill>
            ) : null}
          </div>
          <div className="sd-meta">
            {t("screensB.studentDetail.meta", {
              joined,
              last,
              pct: number(pct / 100, { style: "percent" }),
            })}
          </div>
          <div className="sd-actions">
            <ButtonPrimary icon="send" iconSize={15} className="sd-msg" onClick={message}>
              {t("screensB.studentDetail.message")}
            </ButtonPrimary>
            <ButtonSecondary
              className="sd-nudge"
              onClick={() => showToast(t("screensB.studentDetail.nudged", { name }), "bell")}
            >
              {t("screensB.studentDetail.nudge")}
            </ButtonSecondary>
          </div>
        </div>

        <ProgressRing
          pct={pct}
          className="sd-ring"
          label={t("screensB.studentDetail.progressAria", { name })}
        >
          <span className="sd-ring__pct">{number(pct / 100, { style: "percent" })}</span>
          <span className="sd-ring__cap">{t("screensB.studentDetail.complete")}</span>
        </ProgressRing>
      </div>

      <div className="sd-stats">
        {stats.map((s) => (
          <div className="sd-stat" key={s.label}>
            <span className={`lp-mono sd-stat__value${s.strong ? " sd-stat__value--strong" : ""}`}>
              {s.value}
            </span>
            <span className="sd-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="sd-grid">
        <div className="lp-list sd-panel">
          <div className="sd-panel__head">{t("screensB.studentDetail.submissions")}</div>
          {STUDENT_SUBMISSIONS.map((s) => (
            <button
              type="button"
              className="lp-row sd-sub"
              key={s.item}
              onClick={() => go("grading")}
            >
              <span className={`sd-sub__tile sd-sub__tile--${s.tone}`}>
                <Icon name={s.icon} size={15} />
              </span>
              <span className="sd-sub__text">
                <span className="sd-sub__item">{s.item}</span>
                <span className="sd-sub__at">{s.at}</span>
              </span>
              <span className={`lp-mono sd-sub__score sd-sub__score--${s.tone}`}>{s.score}</span>
            </button>
          ))}
        </div>

        <div className="sd-side">
          <div className="lp-list sd-panel">
            <div className="sd-panel__head">{t("screensB.studentDetail.activity")}</div>
            {STUDENT_ACTIVITY.map((a) => (
              <div className="sd-act" key={a.text}>
                <Icon name={a.icon} size={15} className="sd-act__ico" />
                <span className="sd-act__text">{a.text}</span>
                <span className="lp-mono sd-act__at">{a.at}</span>
              </div>
            ))}
          </div>

          <div className="sd-note">
            <div className="sd-note__head">
              <Icon name="notebook-pen" size={16} className="sd-note__ico" />
              <span>{t("screensB.studentDetail.privateNote")}</span>
            </div>
            <TextArea
              value={sdNote}
              onChange={(v) => set({ sdNote: v })}
              placeholder={t("screensB.studentDetail.notePlaceholder", {
                name: ASSISTANT.name.split(" ")[0],
              })}
              rows={3}
              className="sd-note__field"
              ariaLabel={t("screensB.studentDetail.privateNote")}
            />
            <ButtonPrimary
              className="sd-note__save"
              onClick={() => showToast(t("screensB.studentDetail.noteSaved"), "check")}
            >
              {t("screensB.studentDetail.saveNote")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
