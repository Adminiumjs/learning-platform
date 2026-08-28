/*
 * The exam engine (spec 20 D7).
 *
 * Pure and testable: scoring takes the answer map and returns a result. The
 * attempt window and the timer read the demo clock, never `Date.now()`.
 *
 * Four question kinds, three of which auto-score:
 *
 *   single  exact index match
 *   multi   exact SET match — a partially-right answer scores zero, which is
 *           what "choose all that apply" means
 *   short   normalised compare (trimmed, case-folded) against the accepted
 *           answers, so "4.5:1" and " 4.5:1 " both pass
 *   essay   never auto-scored. It is always pending a human, and that is the
 *           mechanism that routes the attempt into the instructor's grading
 *           queue — the thing that closes the loop between the two personas.
 *
 * There is no proctoring here and there never will be (spec 20 §8).
 */

import { dataSource } from "../data/source";
import type { ExamAnswer, ExamQuestion, ExamScore } from "../data/types";
import { t } from "../i18n/ambient";

/** True when the student has put something usable in the box. */
export function isAnswered(q: ExamQuestion, got: ExamAnswer): boolean {
  if (q.kind === "multi") return Array.isArray(got) && got.length > 0;
  return got !== undefined && got !== "";
}

/** Grade one auto-scorable question. Essays always return false — see above. */
export function isCorrect(q: ExamQuestion, got: ExamAnswer): boolean {
  switch (q.kind) {
    case "single":
      return got === q.a;

    case "multi": {
      const given = (Array.isArray(got) ? [...(got as number[])] : []).sort().join(",");
      const key = ([...((q.a as number[]) ?? [])]).sort().join(",");
      return given === key && given !== "";
    }

    case "short": {
      const accepted = (q.a as string[]) ?? [];
      const given = String(got ?? "").trim().toLowerCase();
      return given !== "" && accepted.some((a) => a.trim().toLowerCase() === given);
    }

    case "essay":
      /* Pending a human, always. */
      return false;
  }
}

/**
 * Score a whole attempt.
 *
 * The essay is excluded from both the numerator and the denominator, so a
 * student who aces the seven auto-graded questions sees 100% with the essay
 * still marked "pending review" — rather than an unexplained 88%.
 */
export function scoreExam(answers: Record<number, ExamAnswer>): ExamScore {
  let correct = 0;
  let total = 0;
  const bySec: ExamScore["bySec"] = {};

  for (const q of dataSource.exam()) {
    if (q.kind === "essay") continue;
    total++;

    const ok = isCorrect(q, answers[q.id]);
    if (ok) correct++;

    if (!bySec[q.sec]) bySec[q.sec] = { c: 0, t: 0 };
    bySec[q.sec].t++;
    if (ok) bySec[q.sec].c++;
  }

  return {
    correct,
    total,
    pct: total ? Math.round((correct / total) * 100) : 0,
    bySec,
  };
}

/** Did the attempt clear the pass mark? */
export function hasPassed(score: ExamScore): boolean {
  return score.pct >= dataSource.examRules().passScore;
}

/** Questions with nothing entered — the count the submit dialog warns about. */
export function unansweredCount(answers: Record<number, ExamAnswer>): number {
  return dataSource.exam().filter((q) => !isAnswered(q, answers[q.id])).length;
}

/** True while the essay is waiting on the instructor. */
export function essayPending(answers: Record<number, ExamAnswer>): boolean {
  const essay = dataSource.exam().find((q) => q.kind === "essay");
  return Boolean(essay && isAnswered(essay, answers[essay.id]));
}

/**
 * D7: is another attempt allowed?
 *
 * `attemptsAllowed` is 2 in the seed, so the result screen offers a retake
 * once and then refuses. A course configured with 1 refuses immediately.
 */
export function canRetake(attemptsUsed: number): boolean {
  return attemptsUsed < dataSource.examRules().attemptsAllowed;
}

/**
 * "1 attempt left" / "No attempts left".
 *
 * This used to append an "s" when `left !== 1`, which is a rule that holds in
 * English and almost nowhere else — Czech needs three forms, Arabic six. The
 * message carries `|`-separated variants instead and the runtime picks one
 * through `Intl.PluralRules`. Zero keeps its own message rather than falling
 * out of the plural table, because "no attempts left" is a different sentence
 * from "0 attempts left".
 */
export function attemptsLeftLabel(attemptsUsed: number): string {
  const left = Math.max(0, dataSource.examRules().attemptsAllowed - attemptsUsed);
  if (left === 0) return t("exam.attemptsNone");
  return t("exam.attemptsLeft", undefined, left);
}

/**
 * The answer set the dock's "Fill answers" drops in.
 *
 * Question 7 is answered *wrong* on purpose: a demo that always scores 100%
 * hides the per-section breakdown and the "not quite there" branch, so the
 * filled attempt lands at 6/7 and both result states stay reachable.
 */
export function filledAnswers(essay: string): Record<number, ExamAnswer> {
  const out: Record<number, ExamAnswer> = {};
  for (const q of dataSource.exam()) {
    switch (q.kind) {
      case "single":
        out[q.id] = q.id === 7 ? 0 : (q.a as number);
        break;
      case "multi":
        out[q.id] = [...((q.a as number[]) ?? [])];
        break;
      case "short":
        out[q.id] = ((q.a as string[]) ?? [])[0];
        break;
      case "essay":
        out[q.id] = essay;
        break;
    }
  }
  return out;
}
