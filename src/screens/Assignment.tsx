/*
 * Assignment — the student's own graded work (comp §7).
 *
 * One brief and three mutually exclusive states below it: `draft` is an
 * editable form, `submitted` is a receipt you can reopen, `graded` is Yara's
 * marks. `asState` on the store is the only switch, and the demo dock's
 * "Simulate grading" / "Reset submission" walk it round the loop.
 *
 * Two deviations from the comp, both deliberate:
 *   • the overdue test reads the assignment module's own cohort week instead
 *     of the comp's hardcoded `S.week > 3`;
 *   • attachment chips are keyed by position, because "Attach a file" can add
 *     the same filename twice and the comp keyed by filename.
 */

import {
  AttachmentChip,
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  Pill,
  TextArea,
} from "../components";
import {
  ASSIGNMENT_BRIEF,
  ASSIGNMENT_EXTRA_FILE,
  ASSIGNMENT_FEEDBACK,
  ASSIGNMENT_RUBRIC,
} from "../data/screens/assignment";
import { dataSource } from "../data/source";
import { addDays, demoNow, dueDate, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-assignment.css";

/** Module 03's graded assignment — the lesson this brief hangs off. */
const ASSIGNMENT_LESSON = "L15";

export default function Assignment() {
  const week = useAppStore((s) => s.week);
  const asText = useAppStore((s) => s.asText);
  const asFiles = useAppStore((s) => s.asFiles);
  const asState = useAppStore((s) => s.asState);
  const asAt = useAppStore((s) => s.asAt);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const submitAssignment = useAppStore((s) => s.submitAssignment);

  const work = dataSource.myAssignment();
  const instructor = dataSource.instructor();
  const mod = dataSource.lesson(ASSIGNMENT_LESSON)?.mod;

  /*
   * The comp wrote `S.week > 3`; the 3 is the assignment module's own week, so
   * reading it off the curriculum keeps the overdue chip honest if the module
   * ever moves.
   */
  const overdue = asState === "draft" && week > (mod?.week ?? 3);

  const due = `${overdue ? "Overdue · was due " : "Due "}${fmtDate(dueDate())} · 23:59`;
  const submittedAt = `Submitted ${asAt ?? `${fmtDate(demoNow(week))} · 10:20`}`;
  const gradedAt = `Graded ${fmtDate(addDays(demoNow(week), 1))} · 16:41`;

  const addFile = () => {
    set({ asFiles: [...asFiles, { n: ASSIGNMENT_EXTRA_FILE }] });
    showToast(`Attached ${ASSIGNMENT_EXTRA_FILE}`, "paperclip");
  };

  return (
    <div className="lp-page lp-page--narrow scr-as">
      <header>
        <p className="scr-as__eyebrow">
          <Icon name="pen-line" size={15} />
          Module {mod?.num ?? "03"} · {mod?.title ?? "Type and spacing"}
        </p>
        <h1 className="scr-as__title">{work.title}</h1>
      </header>

      <div className="scr-as__meta">
        <Pill tone={overdue ? "warn" : "neutral"} icon="calendar" iconSize={14}>
          {due}
        </Pill>
        <Pill className="lp-mono">{work.points} points</Pill>
        {/* First name only — the comp's chip reads "Graded by Yara". */}
        <Pill>Graded by {instructor.name.split(" ")[0]}</Pill>
      </div>

      <section className="scr-as__card">
        <h2 className="scr-as__cardtitle">The brief</h2>
        <p className="scr-as__brief">{ASSIGNMENT_BRIEF}</p>
        <div className="scr-as__files scr-as__files--brief">
          {work.briefFiles.map((f) => (
            <AttachmentChip key={f.n} name={f.n} />
          ))}
        </div>
      </section>

      {asState === "draft" ? (
        <section className="scr-as__card">
          <h2 className="scr-as__cardtitle">Your submission</h2>
          <TextArea
            value={asText}
            onChange={(v) => set({ asText: v })}
            rows={6}
            className="scr-as__text"
            ariaLabel="Your submission"
            placeholder="Tell us what you made and what you're unsure about."
          />
          <div className="scr-as__files">
            {asFiles.map((f, i) => (
              <AttachmentChip
                key={`${f.n}-${i}`}
                name={f.n}
                onRemove={() => set({ asFiles: asFiles.filter((_, at) => at !== i) })}
              />
            ))}
            <button type="button" className="lp-gi scr-as__attach" onClick={addFile}>
              <Icon name="plus" size={13} />
              Attach a file
            </button>
          </div>
          <div className="scr-as__actions">
            <ButtonPrimary onClick={submitAssignment}>Submit assignment</ButtonPrimary>
            <span className="scr-as__note">You can resubmit until the deadline.</span>
          </div>
        </section>
      ) : null}

      {asState === "submitted" ? (
        <section className="scr-as__receipt">
          <Icon name="check-circle-2" size={22} className="scr-as__receiptico" />
          <div className="scr-as__receiptbody">
            <p className="scr-as__receipttitle">Submitted — thank you.</p>
            <p className="scr-as__receiptat lp-mono">{submittedAt}</p>
            <p className="scr-as__receipttext">{asText}</p>
            <div className="scr-as__files">
              {asFiles.map((f, i) => (
                <AttachmentChip key={`${f.n}-${i}`} name={f.n} />
              ))}
            </div>
            <ButtonSecondary
              className="scr-as__edit"
              onClick={() => set({ asState: "draft" })}
            >
              Edit submission
            </ButtonSecondary>
          </div>
        </section>
      ) : null}

      {asState === "graded" ? (
        <section className="scr-as__graded">
          <header className="scr-as__gradehead">
            <Avatar initials={instructor.initials} size="lg" accent />
            <div>
              <p className="scr-as__gradeby">Graded by {instructor.name}</p>
              <p className="scr-as__gradeat lp-mono">{gradedAt}</p>
            </div>
            <p className="scr-as__score">
              <span className="scr-as__scorenum lp-mono">{work.grade}</span>
              <span className="scr-as__scoremax lp-mono">/ {work.points}</span>
            </p>
          </header>
          <div className="scr-as__gradebody">
            <h2 className="scr-as__cardtitle scr-as__cardtitle--sm">Feedback</h2>
            <p className="scr-as__feedback">{ASSIGNMENT_FEEDBACK}</p>
            <div className="scr-as__rubric">
              {ASSIGNMENT_RUBRIC.map((r) => (
                <Pill key={r.label} tone={r.tone}>
                  {r.label}
                </Pill>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
