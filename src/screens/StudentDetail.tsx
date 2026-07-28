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
import { MONTHS, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-student.css";

/** Below half-way through counts as behind — the roster's rule, shared. */
const BEHIND_PCT = 50;

export default function StudentDetail() {
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
  const joined = `${start.getDate()} ${MONTHS[start.getMonth()]}`;

  const stats = [
    { label: "Lessons watched", value: `${LESSONS_WATCHED} / ${dataSource.totalLessons()}` },
    { label: "Grade average", value: `${avg}%`, strong: true },
    { label: "Questions asked", value: String(QUESTIONS_ASKED) },
    { label: "Avg watch time", value: AVG_WATCH_TIME },
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
      showToast("A message thread would open here.", "send");
      return;
    }
    set({ msI: i });
    go("messages");
  }

  return (
    <div className="lp-page scr-student">
      <button type="button" className="lp-nav sd-back" onClick={() => go("roster")}>
        <Icon name="arrow-left" size={15} />
        Roster
      </button>

      <div className="sd-head">
        <Avatar initials={initials} size="xl" className="sd-ava" />

        <div className="sd-head__text">
          <div className="sd-head__name">
            <span className="sd-name">{name}</span>
            {pct < BEHIND_PCT ? (
              <Pill tone="warn" icon="triangle-alert">
                Behind
              </Pill>
            ) : null}
          </div>
          <div className="sd-meta">
            {`Cohort 03 · joined ${joined} · last active ${last} · ${pct}% through`}
          </div>
          <div className="sd-actions">
            <ButtonPrimary icon="send" iconSize={15} className="sd-msg" onClick={message}>
              Message
            </ButtonPrimary>
            <ButtonSecondary
              className="sd-nudge"
              onClick={() => showToast(`Nudge sent to ${name}.`, "bell")}
            >
              Send a nudge
            </ButtonSecondary>
          </div>
        </div>

        <ProgressRing pct={pct} className="sd-ring" label={`${name} — course progress`}>
          <span className="sd-ring__pct">{pct}%</span>
          <span className="sd-ring__cap">complete</span>
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
          <div className="sd-panel__head">Submissions</div>
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
            <div className="sd-panel__head">Recent activity</div>
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
              <span>Private note</span>
            </div>
            <TextArea
              value={sdNote}
              onChange={(v) => set({ sdNote: v })}
              placeholder={`Only you and ${ASSISTANT.name.split(" ")[0]} can see this.`}
              rows={3}
              className="sd-note__field"
              ariaLabel="Private note"
            />
            <ButtonPrimary
              className="sd-note__save"
              onClick={() => showToast("Private note saved.", "check")}
            >
              Save note
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
