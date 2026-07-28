/*
 * Exam — the final assessment (comp §8).
 *
 * Three states, driven by two store flags: the intro card (`!exStarted`), the
 * attempt (`exStarted && !exSubmitted`) and the result (`exSubmitted`).
 *
 * What the port changes:
 *   • The comp measured `S.w < 900` to choose between a two-column layout and
 *     a stacked one, and to decide whether the timer sat inline above the
 *     question or in the rail. Both copies of the timer are rendered now and a
 *     single media query at 900px picks one — nothing here reads the viewport.
 *   • The comp hardcoded `8` and `7` for the question count and the last
 *     index; both are read off the seeded exam instead.
 *   • Scoring is `lib/exam`, not a re-implementation: the essay is excluded
 *     from the denominator, so 7 of 7 auto-graded reads as 100% with the essay
 *     still pending.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  CheckRow,
  Icon,
  Pill,
  ProgressBar,
  ProgressRing,
  TextArea,
  TextInput,
} from "../components";
import {
  EXAM_ESSAY_MAX,
  EXAM_ESSAY_NOTE,
  EXAM_INTRO_LEDE,
  EXAM_KIND_LABEL,
  EXAM_LEGEND,
} from "../data/screens/exam";
import { dataSource } from "../data/source";
import type { ExamAnswer } from "../data/types";
import {
  attemptsLeftLabel,
  canRetake,
  hasPassed,
  isAnswered,
  scoreExam,
  unansweredCount,
} from "../lib/exam";
import { hhmmss } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-exam.css";

/** Under five minutes the clock turns red — the comp's `low` flag. */
const LOW_CLOCK_SEC = 300;

/** Words in a free-text answer, for the essay's counter. */
function wordCount(value: ExamAnswer): number {
  const text = String(value ?? "").trim();
  return text ? text.split(/\s+/).length : 0;
}

export default function Exam() {
  const exStarted = useAppStore((s) => s.exStarted);
  const exSubmitted = useAppStore((s) => s.exSubmitted);
  const exI = useAppStore((s) => s.exI);
  const exAns = useAppStore((s) => s.exAns);
  const exLeft = useAppStore((s) => s.exLeft);
  const exAttempts = useAppStore((s) => s.exAttempts);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openModal = useAppStore((s) => s.openModal);
  const startExam = useAppStore((s) => s.startExam);
  const submitExam = useAppStore((s) => s.submitExam);
  const retakeExam = useAppStore((s) => s.retakeExam);

  const questions = dataSource.exam();
  const rules = dataSource.examRules();
  const last = questions.length - 1;

  /* -------------------------------------------------------------- intro -- */

  if (!exStarted && !exSubmitted) {
    const facts = [
      { icon: "clock", k: "Duration", v: `${rules.durationMin} minutes` },
      { icon: "list-checks", k: "Questions", v: String(rules.questions) },
      { icon: "repeat-2", k: "Attempts allowed", v: String(rules.attemptsAllowed) },
      { icon: "target", k: "Pass mark", v: `${rules.passScore}%` },
    ];

    return (
      <div className="lp-page scr-ex">
        <div className="scr-ex__intro">
          <div className="scr-ex__introhead">
            <span className="scr-ex__badge">
              <Icon name="file-check" size={26} />
            </span>
            <h1 className="scr-ex__title">Final exam</h1>
            <p className="scr-ex__lede">{EXAM_INTRO_LEDE}</p>
          </div>

          <div className="scr-ex__card">
            {facts.map((f) => (
              <div key={f.k} className="scr-ex__fact">
                <Icon name={f.icon} size={17} className="scr-ex__factico" />
                <span className="scr-ex__factk">{f.k}</span>
                <span className="scr-ex__factv lp-mono">{f.v}</span>
              </div>
            ))}
            <div className="scr-ex__cardfoot">
              <ButtonPrimary className="scr-ex__start" onClick={startExam}>
                Start the exam
              </ButtonPrimary>
            </div>
          </div>

          <p className="scr-ex__note">
            <Icon name="info" size={15} className="scr-ex__noteico" />
            {EXAM_ESSAY_NOTE}
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- result -- */

  if (exSubmitted) {
    const score = scoreExam(exAns);
    const passed = hasPassed(score);
    /*
     * D7: attempts are capped. The comp hardcoded "You have one attempt left"
     * and let its retake button run forever; both now read the real count, so
     * a course configured with one attempt refuses the second outright.
     */
    const retakeAllowed = canRetake(exAttempts);
    const attemptsNote = attemptsLeftLabel(exAttempts);

    return (
      <div className="lp-page scr-ex">
        <div className="scr-ex__result">
          <div className="scr-ex__verdictcard">
            <ProgressRing
              pct={score.pct}
              size="lg"
              tone={passed ? "pos" : "warn"}
              label="Auto-graded score"
            >
              <span className="scr-ex__ringpct">{score.pct}%</span>
              <span className="scr-ex__ringnote">auto-graded</span>
            </ProgressRing>
            <div>
              <p className="scr-ex__verdict">{passed ? "You passed." : "Not quite there."}</p>
              <p className="scr-ex__verdictsub">
                {passed
                  ? `You got ${score.correct} of ${score.total} auto-graded questions. The essay is with Yara — expect notes within two days.`
                  : retakeAllowed
                    ? `You got ${score.correct} of ${score.total}. You have ${attemptsNote.toLowerCase()}, and the sections below say exactly where to look.`
                    : `You got ${score.correct} of ${score.total}. That was your last attempt, so this score stands — the sections below say where it went.`}
              </p>
            </div>
          </div>

          <div className="scr-ex__card">
            <p className="scr-ex__cardhead">By section</p>
            {Object.entries(score.bySec).map(([name, s]) => {
              const pct = Math.round((s.c / s.t) * 100);
              return (
                <div key={name} className="scr-ex__sec">
                  <span className="scr-ex__secname">{name}</span>
                  <ProgressBar
                    pct={pct}
                    tone={pct >= rules.passScore ? "pos" : "warn"}
                    className="scr-ex__secbar"
                    label={`${name} score`}
                  />
                  <span className="scr-ex__secscore lp-mono">
                    {s.c} / {s.t}
                  </span>
                </div>
              );
            })}
            {/* The essay never auto-scores — this row is the D7 handoff to Yara. */}
            <div className="scr-ex__essayrow">
              <Icon name="hourglass" size={17} className="scr-ex__essayico" />
              <span className="scr-ex__essaytext">Essay answer — pending review</span>
              <span className="scr-ex__essaymax lp-mono">— / {EXAM_ESSAY_MAX}</span>
            </div>
          </div>

          <div className="scr-ex__resultbtns">
            <ButtonSecondary onClick={retakeExam} disabled={!retakeAllowed}>
              {retakeAllowed ? "Review your answers" : "No attempts left"}
            </ButtonSecondary>
            <ButtonPrimary onClick={() => go("grades")}>See my grades</ButtonPrimary>
            <span className="scr-ex__attempts lp-mono">{attemptsNote}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ attempt -- */

  const q = questions[exI] ?? questions[0];
  const got = exAns[q.id];
  const low = exLeft < LOW_CLOCK_SEC;
  const time = hhmmss(exLeft);

  const answer = (value: ExamAnswer) => set({ exAns: { ...exAns, [q.id]: value } });

  const isPicked = (i: number) =>
    q.kind === "single" ? got === i : Array.isArray(got) && got.includes(i);

  const toggleOption = (i: number) => {
    if (q.kind === "single") {
      answer(i);
      return;
    }
    const current = Array.isArray(got) ? [...got] : [];
    const at = current.indexOf(i);
    if (at >= 0) current.splice(at, 1);
    else current.push(i);
    answer(current);
  };

  const confirmSubmit = () => {
    const missing = unansweredCount(exAns);
    openModal({
      title: missing ? `Submit with ${missing} unanswered?` : "Submit your exam?",
      body: missing
        ? `You can still go back and finish them — the timer has ${time} left.`
        : "Once you submit, the auto-graded sections score straight away and Yara reads the essay.",
      confirmLabel: "Submit",
      icon: "file-check",
      onConfirm: submitExam,
    });
  };

  return (
    <div className="lp-page scr-ex">
      <div className="scr-ex__grid">
        <div className="scr-ex__main">
          <div className="scr-ex__meta">
            <span className="scr-ex__counter lp-mono">
              Question {exI + 1} of {questions.length}
            </span>
            <Pill>{EXAM_KIND_LABEL[q.kind]}</Pill>
            {/* Always rendered; the rail copy takes over from 900px up. */}
            <span className={`scr-ex__clock lp-mono${low ? " is-low" : ""}`}>
              <Icon name="timer" size={15} />
              {time}
            </span>
          </div>

          <div className="scr-ex__qcard">
            <h2 className="scr-ex__q">{q.q}</h2>

            {q.kind === "single" || q.kind === "multi" ? (
              <div className="scr-ex__opts">
                {(q.opts ?? []).map((o, i) => (
                  <CheckRow
                    key={`${q.id}-${i}`}
                    checked={isPicked(i)}
                    onChange={() => toggleOption(i)}
                    radio={q.kind === "single"}
                  >
                    {o}
                  </CheckRow>
                ))}
              </div>
            ) : null}

            {q.kind === "short" ? (
              <TextInput
                value={String(got ?? "")}
                onChange={answer}
                placeholder="Type your answer"
                ariaLabel="Your answer"
                className="scr-ex__short"
              />
            ) : null}

            {q.kind === "essay" ? (
              <div className="scr-ex__essay">
                <TextArea
                  value={String(got ?? "")}
                  onChange={answer}
                  rows={8}
                  className="scr-ex__essaybox"
                  ariaLabel="Your essay"
                  placeholder="Write your case. Around 200 words is plenty."
                />
                <p className="scr-ex__words">
                  <span className="lp-mono">{wordCount(got)} words</span>
                  <span className="scr-ex__wordsnote">Read by Yara, not a machine.</span>
                </p>
              </div>
            ) : null}

            <div className="scr-ex__qnav">
              <ButtonSecondary
                icon="arrow-left"
                onClick={() => set({ exI: Math.max(0, exI - 1) })}
              >
                Back
              </ButtonSecondary>
              <ButtonPrimary
                icon="arrow-right"
                iconEnd
                className="scr-ex__next"
                onClick={() => set({ exI: Math.min(last, exI + 1) })}
              >
                {exI === last ? "Review" : "Next"}
              </ButtonPrimary>
            </div>
          </div>
        </div>

        <aside className="scr-ex__rail">
          <div className="scr-ex__railcard">
            <div className="scr-ex__railclock">
              <Icon
                name="timer"
                size={16}
                className={`scr-ex__railico${low ? " is-low" : ""}`}
              />
              <span className={`scr-ex__railtime lp-mono${low ? " is-low" : ""}`}>{time}</span>
              <span className="scr-ex__railleft">left</span>
            </div>

            <p className="scr-ex__raillabel">Questions</p>
            <div className="scr-ex__map">
              {questions.map((x, i) => {
                const state =
                  i === exI ? "current" : isAnswered(x, exAns[x.id]) ? "answered" : "none";
                return (
                  <button
                    key={x.id}
                    type="button"
                    className={`lp-btn scr-ex__mapbtn scr-ex__mapbtn--${state} lp-mono`}
                    aria-current={i === exI}
                    onClick={() => set({ exI: i })}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="scr-ex__legend">
              {EXAM_LEGEND.map((l) => (
                <p key={l.t} className="scr-ex__legendrow">
                  <span className={`scr-ex__dot scr-ex__dot--${l.state}`} />
                  {l.t}
                </p>
              ))}
            </div>

            <ButtonPrimary className="scr-ex__submit" onClick={confirmSubmit}>
              Submit exam
            </ButtonPrimary>
          </div>
        </aside>
      </div>
    </div>
  );
}
