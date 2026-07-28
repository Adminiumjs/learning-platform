/*
 * Q&A threading (spec 20 D8).
 *
 * The rule these tests protect: `answered` is *derived* from whether a
 * question carries a reply, never stored on the question. Store it and it
 * drifts the first time a reply is added by a path that forgets to set it.
 */

import { describe, expect, it } from "vitest";
import { QUESTIONS, SIMULATED_REPLY } from "../data/demo";
import type { Question } from "../data/types";
import {
  answerOldest,
  filterQuestions,
  inboxQueue,
  instructorReply,
  isAnswered,
  newQuestion,
  questionList,
  unanswered,
} from "./thread";

describe("the seeded questions", () => {
  it("ships two unanswered — the demo needs a non-empty inbox", () => {
    const list = questionList([], {});
    expect(list).toHaveLength(QUESTIONS.length);
    expect(unanswered(list)).toHaveLength(2);
  });

  it("derives answered state from the reply, not from a stored flag", () => {
    const list = questionList([], {});
    for (const q of list) {
      expect(isAnswered(q)).toBe(Boolean(q.reply));
    }
  });
});

describe("asking a question", () => {
  it("puts the newest question at the top, ahead of the seed", () => {
    const asked = newQuestion("Is 13px a real size?", 0, "Grids and rhythm");
    const list = questionList([asked], {});
    expect(list[0].id).toBe("new0");
    expect(list[0].text).toBe("Is 13px a real size?");
    expect(list).toHaveLength(QUESTIONS.length + 1);
  });

  it("marks it as the signed-in student's own, and unanswered", () => {
    const asked = newQuestion("Anything?", 3, "Token layers");
    expect(asked.mine).toBe(true);
    expect(asked.reply).toBeNull();
    expect(isAnswered(asked)).toBe(false);
    expect(asked.lesson).toBe("Token layers");
    expect(asked.id).toBe("new3");
  });
});

describe("simulated replies", () => {
  it("merges a reply onto a seeded question without mutating the seed", () => {
    const target = QUESTIONS.find((q) => !q.reply)!;
    const list = questionList([], { [target.id]: instructorReply() });

    const patched = list.find((q) => q.id === target.id)!;
    expect(isAnswered(patched)).toBe(true);
    expect(patched.reply?.who).toBe("Yara Haddad");

    /* The module-level seed must be untouched for the next render. */
    expect(QUESTIONS.find((q) => q.id === target.id)?.reply).toBeUndefined();
  });

  it("lets a custom answer override the canned one", () => {
    expect(instructorReply().text).toBe(SIMULATED_REPLY.text);
    expect(instructorReply("Short answer: yes.").text).toBe("Short answer: yes.");
    expect(instructorReply("Short answer: yes.").who).toBe("Yara Haddad");
  });

  it("answers the oldest open question first and reports which one", () => {
    const list = questionList([], {});
    const result = answerOldest(list, {})!;
    expect(result.answered.id).toBe(unanswered(list)[0].id);
    expect(result.replies[result.answered.id]?.who).toBe("Yara Haddad");
  });

  it("clears the whole queue when called repeatedly, then reports done", () => {
    let replies = {};
    for (let i = 0; i < 2; i++) {
      const result = answerOldest(questionList([], replies), replies);
      expect(result).not.toBeNull();
      replies = result!.replies;
    }
    expect(unanswered(questionList([], replies))).toHaveLength(0);
    /* Nothing left — the dock says so rather than throwing. */
    expect(answerOldest(questionList([], replies), replies)).toBeNull();
  });

  it("answers a question the student just asked, not only seeded ones", () => {
    const asked = newQuestion("Brand new question.", 0, "Grids and rhythm");
    const list = questionList([asked], {});
    /* It is newest-first, so it is also the first open one. */
    expect(answerOldest(list, {})!.answered.id).toBe("new0");
  });
});

describe("the instructor's inbox", () => {
  it("hides questions handled this session", () => {
    const list = questionList([], {});
    const open = unanswered(list);
    expect(inboxQueue(list, {})).toHaveLength(2);
    expect(inboxQueue(list, { [open[0].id]: 1 })).toHaveLength(1);
    expect(inboxQueue(list, { [open[0].id]: 1, [open[1].id]: 1 })).toHaveLength(0);
  });

  it("never lists an already-answered question", () => {
    const list = questionList([], {});
    for (const q of inboxQueue(list, {})) {
      expect(isAnswered(q)).toBe(false);
    }
  });
});

describe("the student's filters", () => {
  const list = questionList([], {});

  it("shows everything on 'all'", () => {
    expect(filterQuestions(list, "all")).toHaveLength(list.length);
  });

  it("shows only open ones on 'open'", () => {
    const open = filterQuestions(list, "open");
    expect(open).toHaveLength(2);
    expect(open.every((q) => !isAnswered(q))).toBe(true);
  });

  it("shows only the student's own on 'mine', answered or not", () => {
    const mine = filterQuestions(list, "mine");
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((q) => q.mine)).toBe(true);
  });

  it("includes a freshly asked question in both 'open' and 'mine'", () => {
    const asked = newQuestion("Just asked.", 0, "Grids and rhythm");
    const withMine = questionList([asked], {});
    expect(filterQuestions(withMine, "open").map((q) => q.id)).toContain("new0");
    expect(filterQuestions(withMine, "mine").map((q) => q.id)).toContain("new0");
  });

  it("drops a question out of 'open' once it is answered", () => {
    const target: Question = unanswered(list)[0];
    const answered = questionList([], { [target.id]: instructorReply() });
    expect(filterQuestions(answered, "open").map((q) => q.id)).not.toContain(target.id);
  });
});
