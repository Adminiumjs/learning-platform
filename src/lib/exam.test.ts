/*
 * The exam engine (spec 20 D7).
 *
 * The two rules worth guarding hardest:
 *
 *   1. `multi` is an exact SET match. A partially-correct answer scores zero,
 *      because "choose all that apply" means all of them. It is very easy to
 *      "fix" this into partial credit by accident.
 *
 *   2. The essay is never auto-scored and is excluded from the denominator.
 *      A student who aces the seven auto-graded questions must see 100% with
 *      the essay pending — not an unexplained 88%.
 */

import { describe, expect, it } from "vitest";
import { EXAM, EXAM_FILL_ESSAY, EXAM_RULES } from "../data/demo";
import type { ExamAnswer } from "../data/types";
import {
  attemptsLeftLabel,
  canRetake,
  essayPending,
  filledAnswers,
  hasPassed,
  isAnswered,
  isCorrect,
  scoreExam,
  unansweredCount,
} from "./exam";

const q = (id: number) => EXAM.find((x) => x.id === id)!;

/** Every auto-graded question answered correctly; the essay left blank. */
function perfectAutoGraded(): Record<number, ExamAnswer> {
  const out: Record<number, ExamAnswer> = {};
  for (const x of EXAM) {
    if (x.kind === "single") out[x.id] = x.a as number;
    else if (x.kind === "multi") out[x.id] = [...(x.a as number[])];
    else if (x.kind === "short") out[x.id] = (x.a as string[])[0];
  }
  return out;
}

describe("single choice", () => {
  it("accepts the right index and rejects the others", () => {
    expect(isCorrect(q(1), 1)).toBe(true);
    expect(isCorrect(q(1), 0)).toBe(false);
    expect(isCorrect(q(1), 3)).toBe(false);
  });

  it("treats an unanswered question as wrong, not as a crash", () => {
    expect(isCorrect(q(1), undefined)).toBe(false);
  });
});

describe("multiple choice", () => {
  it("accepts the exact set regardless of the order it was clicked in", () => {
    expect(isCorrect(q(2), [0, 2, 3])).toBe(true);
    expect(isCorrect(q(2), [3, 0, 2])).toBe(true);
  });

  it("scores a partially-correct answer as zero — this is the point of it", () => {
    expect(isCorrect(q(2), [0, 2])).toBe(false);
  });

  it("rejects a superset as firmly as a subset", () => {
    expect(isCorrect(q(2), [0, 1, 2, 3])).toBe(false);
  });

  it("rejects an empty selection rather than matching an empty key", () => {
    expect(isCorrect(q(2), [])).toBe(false);
    expect(isCorrect(q(2), undefined)).toBe(false);
  });
});

describe("short answer", () => {
  it("accepts any of the listed answers", () => {
    expect(isCorrect(q(3), "4.5:1")).toBe(true);
    expect(isCorrect(q(3), "4.5")).toBe(true);
    expect(isCorrect(q(3), "4.5 : 1")).toBe(true);
  });

  it("normalises case and surrounding whitespace", () => {
    expect(isCorrect(q(6), "Semantic")).toBe(true);
    expect(isCorrect(q(6), "  SEMANTIC  ")).toBe(true);
    expect(isCorrect(q(6), "Semantic Layer")).toBe(true);
  });

  it("rejects a wrong answer and an empty one", () => {
    expect(isCorrect(q(6), "primitive")).toBe(false);
    expect(isCorrect(q(6), "")).toBe(false);
    expect(isCorrect(q(6), "   ")).toBe(false);
  });
});

describe("the essay", () => {
  it("is never auto-scored, however good the answer is", () => {
    expect(isCorrect(q(8), "A genuinely excellent, complete argument.")).toBe(false);
  });

  it("counts as answered once there is text — that is what queues it", () => {
    expect(isAnswered(q(8), "")).toBe(false);
    expect(isAnswered(q(8), "Some words.")).toBe(true);
  });

  it("reports as pending review only when the student actually wrote something", () => {
    expect(essayPending({})).toBe(false);
    expect(essayPending({ 8: "" })).toBe(false);
    expect(essayPending({ 8: "Documentation is not a tax on shipping." })).toBe(true);
  });
});

describe("scoring an attempt", () => {
  it("excludes the essay from the denominator", () => {
    const score = scoreExam({});
    expect(score.total).toBe(EXAM.length - 1);
    expect(score.total).toBe(7);
  });

  it("gives a clean 100% for every auto-graded question right", () => {
    const score = scoreExam(perfectAutoGraded());
    expect(score.correct).toBe(7);
    expect(score.total).toBe(7);
    expect(score.pct).toBe(100);
    expect(hasPassed(score)).toBe(true);
  });

  it("scores an empty attempt as zero without dividing by zero", () => {
    const score = scoreExam({});
    expect(score.correct).toBe(0);
    expect(score.pct).toBe(0);
    expect(hasPassed(score)).toBe(false);
  });

  it("breaks the result down by section, and the sections add up", () => {
    const score = scoreExam(perfectAutoGraded());
    expect(Object.keys(score.bySec).sort()).toEqual([
      "Colour and tokens",
      "Components",
      "Foundations",
      "Type and spacing",
    ]);
    const totals = Object.values(score.bySec).reduce((n, s) => n + s.t, 0);
    expect(totals).toBe(score.total);
    /* The essay's own section never appears — it has nothing to auto-score. */
    expect(score.bySec.Essay).toBeUndefined();
  });

  it("puts the pass mark exactly where the rules say", () => {
    expect(EXAM_RULES.passScore).toBe(70);
    /* 5 of 7 is 71% — just over. 4 of 7 is 57% — under. */
    expect(hasPassed({ correct: 5, total: 7, pct: 71, bySec: {} })).toBe(true);
    expect(hasPassed({ correct: 4, total: 7, pct: 57, bySec: {} })).toBe(false);
    expect(hasPassed({ correct: 0, total: 7, pct: 70, bySec: {} })).toBe(true);
  });
});

describe("unanswered counting", () => {
  it("counts all eight — the essay included — when nothing is entered", () => {
    expect(unansweredCount({})).toBe(8);
  });

  it("does not count an empty array as an answer", () => {
    expect(unansweredCount({ 2: [] })).toBe(8);
    expect(unansweredCount({ 2: [0] })).toBe(7);
  });

  it("reaches zero only when the essay is written too", () => {
    expect(unansweredCount(perfectAutoGraded())).toBe(1);
    expect(unansweredCount({ ...perfectAutoGraded(), 8: "Words." })).toBe(0);
  });
});

describe("attempts", () => {
  it("allows the seeded second attempt and refuses a third", () => {
    expect(EXAM_RULES.attemptsAllowed).toBe(2);
    expect(canRetake(0)).toBe(true);
    expect(canRetake(1)).toBe(true);
    expect(canRetake(2)).toBe(false);
    expect(canRetake(3)).toBe(false);
  });

  it("labels what is left, and pluralises honestly", () => {
    expect(attemptsLeftLabel(0)).toBe("2 attempts left");
    expect(attemptsLeftLabel(1)).toBe("1 attempt left");
    expect(attemptsLeftLabel(2)).toBe("No attempts left");
    expect(attemptsLeftLabel(9)).toBe("No attempts left");
  });
});

describe("the dock's 'Fill answers'", () => {
  const filled = filledAnswers(EXAM_FILL_ESSAY);

  it("fills every question, essay included", () => {
    expect(Object.keys(filled)).toHaveLength(EXAM.length);
    expect(unansweredCount(filled)).toBe(0);
  });

  it("deliberately gets question 7 wrong so both result states stay reachable", () => {
    /* A demo that always scores 100% never shows the per-section breakdown
     * or the "not quite there" branch. 6 of 7 keeps both live. */
    expect(filled[7]).toBe(0);
    expect(isCorrect(q(7), filled[7])).toBe(false);

    const score = scoreExam(filled);
    expect(score.correct).toBe(6);
    expect(score.total).toBe(7);
    expect(score.pct).toBe(86);
    expect(hasPassed(score)).toBe(true);
  });

  it("leaves the essay pending even though it filled it in", () => {
    expect(essayPending(filled)).toBe(true);
    expect(isCorrect(q(8), filled[8])).toBe(false);
  });

  it("copies the multi-choice key rather than aliasing it", () => {
    (filled[2] as number[]).push(99);
    expect(q(2).a).toEqual([0, 2, 3]);
  });
});
