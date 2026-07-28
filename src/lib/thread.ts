/*
 * Q&A threading (spec 20 D8).
 *
 * Comments hang off a lesson (contextual Q&A) or off the cohort (the class
 * discussion board). The shape is deliberately shallow: a parent and one
 * level of replies, no deeper nesting — a lesson question thread that needs
 * a tree is a thread that needed a live session.
 *
 * State rules:
 *   • A question with no reply shows a muted "Awaiting answer" pill.
 *   • An instructor reply flips it to a green "Answered" pill and carries an
 *     "Instructor" badge.
 *   • A later student reply reopens it — `answered` is derived from the last
 *     reply's author, never stored, so it cannot drift.
 *
 * In the student view the instructor's answers arrive through the dock's
 * "Simulate an answer" action rather than on a timer: the persona switch is
 * the real demo, and a scripted delay would fight it.
 */

import { QUESTIONS, SIMULATED_REPLY } from "../data/demo";
import type { Question, QuestionReply } from "../data/types";

/** Replies the demo has added on top of the seed, keyed by question id. */
export type ReplyMap = Record<string, QuestionReply | undefined>;

/**
 * The live question list: anything the student just asked, newest first,
 * then the seeded questions with any simulated reply merged in.
 */
export function questionList(added: Question[], replies: ReplyMap): Question[] {
  const base = QUESTIONS.map((q) => ({
    ...q,
    reply: replies[q.id] ?? q.reply ?? null,
  }));
  return [...added, ...base];
}

/** D8: a question is answered once it carries a reply. */
export function isAnswered(q: Question): boolean {
  return Boolean(q.reply);
}

/** Still waiting on the instructor — the inbox's working set. */
export function unanswered(list: Question[]): Question[] {
  return list.filter((q) => !isAnswered(q));
}

/** Unanswered, minus anything the instructor has dealt with this session. */
export function inboxQueue(list: Question[], handled: Record<string, number>): Question[] {
  return unanswered(list).filter((q) => !handled[q.id]);
}

export type QaFilter = "all" | "open" | "mine";

export function filterQuestions(list: Question[], filter: QaFilter): Question[] {
  switch (filter) {
    case "open":
      return list.filter((q) => !isAnswered(q));
    case "mine":
      return list.filter((q) => q.mine);
    case "all":
      return list;
  }
}

/** Build the question the student's ask box posts. */
export function newQuestion(text: string, index: number, lesson: string): Question {
  return {
    id: `new${index}`,
    who: "Rosa Marchetti",
    ini: "RM",
    lesson,
    at: "Just now",
    mine: true,
    text,
    reply: null,
  };
}

/** Build an instructor reply. Used by both the dock and the Q&A inbox. */
export function instructorReply(text?: string): QuestionReply {
  return text
    ? { who: "Yara Haddad", ini: "YH", at: "Just now", text }
    : { ...SIMULATED_REPLY };
}

/**
 * Answer the oldest open question, as the instructor.
 *
 * Returns the patched reply map and the question that got answered, or null
 * when the queue is already clear.
 */
export function answerOldest(
  list: Question[],
  replies: ReplyMap,
): { replies: ReplyMap; answered: Question } | null {
  const open = unanswered(list);
  if (open.length === 0) return null;

  const target = open[0];
  return {
    replies: { ...replies, [target.id]: instructorReply() },
    answered: target,
  };
}
