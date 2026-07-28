/*
 * Grades — the student's gradebook (comp §9).
 *
 * Five weighted items and a certificate card. Every row reads live state: the
 * demo clock decides whether the week-4 quiz has happened, `asState` decides
 * whether the specimen is pending or marked, and `exSubmitted` plus the exam
 * engine decide the final row. Nothing is stored — the table is derived.
 *
 * Two comp defects fixed, both marked inline: the specimen row painted its
 * "—" in the info tone while the work was still a draft, and the module
 * unlock dates were hardcoded 5 and 7 rather than read off the curriculum.
 */

import { ButtonPrimary, ButtonSecondary, Icon, ProgressRing } from "../components";
import {
  CERT_DONE_BODY,
  CERT_DONE_BTN,
  CERT_DONE_TITLE,
  CERT_LOCKED_BTN,
  CERT_LOCKED_TITLE,
  CERT_TOAST,
  CHECKPOINT_SCORE,
  CHECKPOINT_SUB,
  CHECKPOINT_WEEK,
  COHORT_LABEL,
  GRADE_ITEMS,
  TOKENS_EARNED,
  TOKENS_POSSIBLE,
  TOKENS_SUB,
} from "../data/screens/grades";
import { dataSource } from "../data/source";
import { hasPassed, scoreExam } from "../lib/exam";
import { doneCount, fmtDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-grades.css";

/** The cohort course the gradebook belongs to. */
const COURSE_ID = "DS-101";

interface Row {
  id: string;
  name: string;
  sub: string;
  kind: string;
  weight: number;
  score: string;
  /** Earned — the score renders in the positive tone. */
  ok?: boolean;
  /** Waiting on a human. */
  pending?: boolean;
  /** Not open yet; the whole row dims. */
  locked?: boolean;
}

export default function Grades() {
  const week = useAppStore((s) => s.week);
  const asState = useAppStore((s) => s.asState);
  const exSubmitted = useAppStore((s) => s.exSubmitted);
  const exAns = useAppStore((s) => s.exAns);
  const done = useAppStore((s) => s.done);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.course(COURSE_ID);
  const work = dataSource.myAssignment();
  const modules = dataSource.modules();
  const totalLessons = dataSource.totalLessons();
  const score = scoreExam(exAns);

  const mine = asState === "graded";
  const item = (id: string) => GRADE_ITEMS.find((g) => g.id === id)!;

  /*
   * "Module 04 · opens Mon 17 Aug". The comp hardcoded the weeks (5 and 7);
   * they are the modules' own release weeks, so they come off the curriculum.
   */
  const opensSub = (num: string) => {
    const m = modules.find((x) => x.num === num);
    return m ? `Module ${m.num} · opens ${fmtDate(weekStart(m.week))}` : `Module ${num}`;
  };

  const rows: Row[] = [
    {
      ...item("tokens"),
      sub: TOKENS_SUB,
      score: `${TOKENS_EARNED} / ${TOKENS_POSSIBLE}`,
      ok: true,
    },
    {
      ...item("specimen"),
      sub: `Module 03 · ${
        mine ? "graded by Yara" : asState === "submitted" ? "awaiting grade" : "not submitted"
      }`,
      score: mine
        ? `${work.grade} / ${work.points}`
        : asState === "submitted"
          ? "Pending"
          : "—",
      ok: mine,
      /* The comp wrote `pending: !mine`, which painted the draft state's "—"
         in the info tone as though something were being reviewed. */
      pending: asState === "submitted",
    },
    { ...item("spec"), sub: opensSub("04"), score: "—", locked: true },
    {
      ...item("checkpoint"),
      sub: CHECKPOINT_SUB,
      score: week >= CHECKPOINT_WEEK ? CHECKPOINT_SCORE : "—",
      ok: week >= CHECKPOINT_WEEK,
      locked: week < CHECKPOINT_WEEK,
    },
    {
      ...item("final"),
      sub: exSubmitted ? "Auto-graded · essay pending" : opensSub("05"),
      score: exSubmitted ? `${score.correct} / ${score.total}` : "—",
      ok: exSubmitted && hasPassed(score),
      locked: !exSubmitted,
    },
  ];

  /*
   * The overall ring counts only what Yara has actually marked. The quiz and
   * the exam auto-score, but neither is final until the essay comes back, so
   * they stay out of the average — the comp's rule, kept.
   */
  const earned = TOKENS_EARNED + (mine ? work.grade : 0);
  const possible = TOKENS_POSSIBLE + (mine ? work.points : 0);
  const pct = Math.round((earned / possible) * 100);
  const gradedCount = 1 + (mine ? 1 : 0);
  const gradedWeight = item("tokens").weight + (mine ? item("specimen").weight : 0);

  const lessonsDone = doneCount(done);
  const complete = lessonsDone >= totalLessons && exSubmitted;

  return (
    <div className="lp-page scr-gr">
      <div className="scr-gr__head">
        <div>
          <h1 className="scr-gr__title">Grades</h1>
          <p className="scr-gr__sub">
            {course.title} · {COHORT_LABEL}
          </p>
        </div>
        <div className="scr-gr__overall">
          <ProgressRing pct={pct} size="sm" label="Overall grade" />
          <div>
            <p className="scr-gr__overalltitle">Overall</p>
            <p className="scr-gr__overallsub">
              {gradedCount} of {rows.length} items graded · {gradedWeight}% of the grade
            </p>
          </div>
        </div>
      </div>

      <div className="scr-gr__table">
        <div className="scr-gr__thead">
          <span>Item</span>
          <span>Type</span>
          <span className="scr-gr__num">Weight</span>
          <span className="scr-gr__num">Score</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.id}
            className={`lp-row scr-gr__row${r.locked ? " is-locked" : ""}`}
          >
            <span className="scr-gr__item">
              <span className="scr-gr__name">{r.name}</span>
              <span className="scr-gr__itemsub">{r.sub}</span>
            </span>
            <span className="scr-gr__kind">{r.kind}</span>
            <span className="scr-gr__weight lp-mono">{r.weight}%</span>
            <span
              className={`scr-gr__score lp-mono${
                r.ok ? " is-ok" : r.pending ? " is-pending" : ""
              }`}
            >
              {r.score}
            </span>
          </div>
        ))}
      </div>

      <div className={`scr-gr__cert${complete ? " is-done" : ""}`}>
        <span className="scr-gr__certico">
          <Icon name={complete ? "award" : "lock"} size={24} />
        </span>
        <div className="scr-gr__certbody">
          <p className="scr-gr__certtitle">
            {complete ? CERT_DONE_TITLE : CERT_LOCKED_TITLE}
          </p>
          <p className="scr-gr__certtext">
            {complete
              ? CERT_DONE_BODY
              : `Finish all ${totalLessons} lessons and sit the final exam to unlock it. You are ${lessonsDone} of ${totalLessons} in.`}
          </p>
        </div>
        {complete ? (
          <ButtonPrimary onClick={() => showToast(CERT_TOAST, "award")}>
            {CERT_DONE_BTN}
          </ButtonPrimary>
        ) : (
          <ButtonSecondary onClick={() => go("classroom")}>{CERT_LOCKED_BTN}</ButtonSecondary>
        )}
      </div>
    </div>
  );
}
