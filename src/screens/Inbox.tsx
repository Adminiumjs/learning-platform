/*
 * Inbox — the instructor's side of the Q&A thread (spec 20 D8).
 *
 * The working set is every question with no answer, plus the ones answered in
 * this session so the reply stays on screen instead of vanishing the instant
 * it is posted. Posting writes both halves at once: `qiDone` keeps the card
 * here in its answered state, and `qaReplies` is what the *student's* Q&A
 * screen reads — the same reply, one write, no second copy to drift.
 *
 * "Draft for me" fills the box with a house template rather than calling
 * anything. Nothing in this app makes a network request.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  EmptyState,
  PageHead,
  Pill,
  TextArea,
} from "../components";
import { SUGGESTED_ANSWER } from "../data/screens/inbox";
import { dataSource } from "../data/source";
import type { Question } from "../data/types";
import { useI18n } from "../i18n";
import { inboxQueue, instructorReply, isAnswered, questionList } from "../lib/thread";
import { useAppStore } from "../state/store";
import "../styles/screen-inbox.css";

export default function Inbox() {
  const { t, number } = useI18n();
  const qaAdded = useAppStore((s) => s.qaAdded);
  const qaReplies = useAppStore((s) => s.qaReplies);
  const qiDraft = useAppStore((s) => s.qiDraft);
  const qiDone = useAppStore((s) => s.qiDone);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const go = useAppStore((s) => s.go);

  const instructor = dataSource.instructor();
  const list = questionList(qaAdded, qaReplies);

  /* Unanswered, plus whatever this session has just answered. */
  const queue = list.filter((q) => !isAnswered(q) || qiDone[q.id]);
  const open = inboxQueue(list, qiDone).length;
  const answeredNow = Object.keys(qiDone).length;

  const draft = (id: string, text: string) => set({ qiDraft: { ...qiDraft, [id]: text } });

  const post = (q: Question) => {
    const text = (qiDraft[q.id] ?? "").trim();
    if (!text) {
      showToast(t("screensA.inbox.writeFirst"), "info");
      return;
    }
    /* `qiDone` is a handled-marker map (that is how `inboxQueue` and the Teach
       dashboard read it), so the answer itself lives on `qaReplies` — the one
       record the student's Q&A screen renders. The comp kept the text in both. */
    set({
      qiDone: { ...qiDone, [q.id]: 1 },
      qaReplies: { ...qaReplies, [q.id]: instructorReply(text) },
    });
    showToast(t("screensA.inbox.answerPosted", { who: q.who }), "send");
  };

  return (
    <div className="lp-page lp-page--narrow scr-inbox">
      <PageHead
        title={t("screensA.inbox.title")}
        lede={
          answeredNow
            ? t(
                "screensA.inbox.ledeWithAnswered",
                { count: number(open), answered: number(answeredNow) },
                open,
              )
            : t("screensA.inbox.lede", { count: number(open) }, open)
        }
      />

      {/* The comp rendered an empty list as a bare heading. The dock's
          "Simulate an answer" can clear the queue without touching `qiDone`,
          so that blank screen is reachable — it gets a real empty state. */}
      {queue.length === 0 ? (
        <EmptyState
          className="qi-empty"
          icon="check-check"
          title={t("screensA.inbox.emptyTitle")}
          body={t("screensA.inbox.emptyBody")}
          action={{
            label: t("screensA.inbox.seeClassQa"),
            icon: "message-square",
            onClick: () => go("qa"),
          }}
        />
      ) : (
        <div className="qi-list">
          {queue.map((q) => {
            const done = Boolean(qiDone[q.id]);
            const answer = done ? (qaReplies[q.id]?.text ?? q.reply?.text ?? "") : "";

            return (
              <article key={q.id} className={`qi-card${done ? " is-done" : ""}`}>
                <div className="qi-top">
                  <Avatar initials={q.ini} size="md" />
                  <div className="qi-body">
                    <div className="qi-meta">
                      <span className="qi-who">{q.who}</span>
                      <span className="qi-at lp-mono">{q.at}</span>
                      <span className="qi-lesson">
                        {t("screensA.inbox.onLesson", { lesson: q.lesson })}
                      </span>
                      <Pill className="qi-state" tone={done ? "pos" : "warn"}>
                        {done ? t("screensA.inbox.done") : t("screensA.inbox.awaiting")}
                      </Pill>
                    </div>
                    <p className="qi-text">{q.text}</p>
                  </div>
                </div>

                {done ? (
                  <div className="qi-answer">
                    <Avatar initials={instructor.initials} size="sm" accent />
                    <p className="qi-answer__text">{answer}</p>
                  </div>
                ) : (
                  <>
                    <div className="qi-reply">
                      <Avatar initials={instructor.initials} size="sm" accent />
                      <TextArea
                        className="qi-draft"
                        rows={3}
                        value={qiDraft[q.id] ?? ""}
                        onChange={(v) => draft(q.id, v)}
                        placeholder={t("screensA.inbox.answerAs", {
                          name: instructor.name.split(" ")[0],
                        })}
                        ariaLabel={t("screensA.inbox.answerLabel", { who: q.who })}
                      />
                    </div>
                    <div className="qi-actions">
                      <ButtonPrimary className="qi-post" onClick={() => post(q)}>
                        {t("screensA.inbox.postAnswer")}
                      </ButtonPrimary>
                      <ButtonSecondary
                        className="qi-suggest"
                        icon="sparkles"
                        iconSize={14}
                        onClick={() => draft(q.id, SUGGESTED_ANSWER)}
                      >
                        {t("screensA.inbox.draftForMe")}
                      </ButtonSecondary>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
