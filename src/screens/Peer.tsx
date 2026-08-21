/*
 * Peer review — three specimens land on your desk each round.
 *
 * Left rail is the queue, right pane is the one you are reviewing, and the
 * card underneath is what came back to you. The comp folded the two columns
 * into one below 900px by measuring the window; here that is a media query
 * and both columns always render.
 */

import { useState } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  Cover,
  Icon,
  Pill,
  ProgressRing,
  TextArea,
} from "../components";
import {
  PEER_CRITERIA,
  PEER_GOOD_WORDS,
  PEER_MAX_DOT,
  PEER_MIN_WORDS,
  PEER_QUEUE,
  PEER_RECEIVED,
  PEER_ROUND,
  PEER_TIPS,
  PEER_WORK_TINT,
} from "../data/screens/peer";
import { useI18n } from "../i18n";
import { addDays, dueDate, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-peer.css";

/** The module and piece this round reviews — in-fiction curriculum names. */
const ROUND_MODULE = "03";
const ROUND_PIECE = "type specimen page";
/** What came back to you was the round before: module 02's token sheet. */
const RECEIVED_MODULE = "02";
const RECEIVED_PIECE = "token sheet";
/** Reviews are due three days after the assignment itself. */
const REVIEW_GRACE_DAYS = 3;

function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export default function Peer() {
  const { t, number } = useI18n();
  const prvI = useAppStore((s) => s.prvI);
  const prvDone = useAppStore((s) => s.prvDone);
  const prvScore = useAppStore((s) => s.prvScore);
  const prvText = useAppStore((s) => s.prvText);
  const prvAnonOn = useAppStore((s) => s.prvAnonOn);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  /*
   * The comp printed a static "Thank them" / "Thanked" label and never
   * changed it, so the button looked live and was not. There is no store key
   * for it — thanks are not part of the demo clock — so it stays local.
   */
  const [thanked, setThanked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PEER_RECEIVED.map((r) => [r.id, r.thanked])),
  );

  const pending = PEER_QUEUE.filter((q) => !prvDone[q.id]);
  const i = Math.min(prvI, Math.max(0, pending.length - 1));
  /* With the round finished there is nothing pending; the comp falls back to
     the first submission rather than showing a done state. */
  const cur = pending[i] ?? PEER_QUEUE[0];

  const given = Object.keys(prvDone).length;
  const text = prvText[cur.id] ?? "";
  const words = wordCount(text);

  const send = () => {
    if (words < PEER_MIN_WORDS) {
      showToast(t("screensB.peer.tooShort"), "info");
      return;
    }
    set({ prvDone: { ...prvDone, [cur.id]: 1 }, prvI: 0 });
    showToast(
      t("screensB.peer.sent", { who: cur.who }),
      "send",
      t("screensB.peer.undo"),
      () => {
        /* Read fresh — the toast can be undone several seconds later. */
        const store = useAppStore.getState();
        const back = { ...store.prvDone };
        delete back[cur.id];
        store.set({ prvDone: back });
      },
    );
  };

  return (
    <div className="lp-page scr-peer">
      <div className="scr-peer__head">
        <div>
          <div className="scr-peer__eyebrow">
            <Icon name="users" size={15} />
            {t("screensB.peer.eyebrow", { num: ROUND_MODULE, piece: ROUND_PIECE })}
          </div>
          <h1 className="scr-peer__title">{t("screensB.peer.title")}</h1>
          <p className="scr-peer__lede">{t("screensB.peer.lede")}</p>
        </div>

        <div className="scr-peer__tally">
          <ProgressRing
            pct={(given / PEER_ROUND) * 100}
            size="sm"
            label={t("screensB.peer.given")}
          >
            {number(given)} / {number(PEER_ROUND)}
          </ProgressRing>
          <div>
            <div className="scr-peer__tallylabel">{t("screensB.peer.given")}</div>
            <div className="scr-peer__tallysub">
              {t("screensB.peer.due", {
                date: fmtDate(addDays(dueDate(), REVIEW_GRACE_DAYS)),
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="scr-peer__grid">
        <div className="lp-scroll scr-peer__queue">
          <div className="scr-peer__queuehead">{t("screensB.peer.assigned")}</div>

          {PEER_QUEUE.map((q) => {
            const isDone = Boolean(prvDone[q.id]);
            const isCur = q.id === cur.id;
            return (
              <button
                key={q.id}
                type="button"
                className={`lp-list__row lp-row scr-peer__qrow${
                  isCur && !isDone ? " is-active" : ""
                }${isDone ? " is-done" : ""}`}
                onClick={() => {
                  const ix = pending.findIndex((x) => x.id === q.id);
                  if (ix >= 0) set({ prvI: ix });
                }}
              >
                <span
                  className={`scr-peer__qavatar${isDone ? " is-done" : isCur ? " is-active" : ""}`}
                  aria-hidden="true"
                >
                  {q.ini}
                </span>
                <span className="scr-peer__qbody">
                  <span className="scr-peer__qwho">{q.who}</span>
                  <span className="scr-peer__qsub">
                    {isDone ? t("screensB.peer.rowSent") : t("screensB.peer.rowWaiting")}
                  </span>
                </span>
                <Pill tone={isDone ? "pos" : "warn"}>
                  {isDone ? t("screensB.peer.pillDone") : t("screensB.peer.pillToDo")}
                </Pill>
              </button>
            );
          })}

          <div className="scr-peer__tips">
            <span className="scr-peer__tipshead">{t("screensB.peer.tipsHead")}</span>
            {PEER_TIPS.map((tip) => (
              <span key={tip} className="scr-peer__tip">
                <span className="scr-peer__bullet" aria-hidden="true" />
                {tip}
              </span>
            ))}
          </div>
        </div>

        <div className="scr-peer__work">
          <div className="scr-peer__workhead">
            <span className="scr-peer__workavatar" aria-hidden="true">
              {cur.ini}
            </span>
            <div className="scr-peer__workwho">
              <div className="scr-peer__workname">{cur.who}</div>
              <div className="scr-peer__workmeta">{cur.meta}</div>
            </div>
            <span className="scr-peer__workfile lp-mono">{cur.file}</span>
          </div>

          <Cover
            className="scr-peer__cover"
            tint={PEER_WORK_TINT}
            icon="file-type"
            iconSize={60}
            angle="160deg"
          />

          <div className="scr-peer__form">
            <div className="scr-peer__criteria">
              {PEER_CRITERIA.map((c) => {
                const key = `${cur.id}-${c.id}`;
                const val = prvScore[key] ?? 0;
                return (
                  <div key={c.id} className="scr-peer__crit">
                    <span className="scr-peer__critlabel">{c.label}</span>
                    <div
                      className="scr-peer__dots"
                      role="group"
                      aria-label={t("screensB.peer.scoreAria", {
                        label: c.label,
                        max: number(PEER_MAX_DOT),
                      })}
                    >
                      {Array.from({ length: PEER_MAX_DOT }, (_, n) => n + 1).map((x) => (
                        <button
                          key={x}
                          type="button"
                          className={`lp-btn scr-peer__dot${x <= val ? " is-on" : ""}`}
                          aria-pressed={x <= val}
                          onClick={() => set({ prvScore: { ...prvScore, [key]: x } })}
                        >
                          {number(x)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="scr-peer__note">
              <label className="scr-peer__notelabel" htmlFor="prv-note">
                {t("screensB.peer.noteLabel")}
                <span
                  className={`scr-peer__words lp-mono${words >= PEER_GOOD_WORDS ? " is-good" : ""}`}
                >
                  {t("screensB.peer.words", { total: number(words) }, words)}
                </span>
              </label>
              <TextArea
                id="prv-note"
                className="scr-peer__notefld"
                value={text}
                onChange={(v) => set({ prvText: { ...prvText, [cur.id]: v } })}
                placeholder={t("screensB.peer.notePlaceholder")}
              />
            </div>

            <div className="scr-peer__send">
              <span className="scr-peer__anon">
                <Icon name="eye-off" size={14} />
                {prvAnonOn ? t("screensB.peer.anonOn") : t("screensB.peer.anonOff")}
              </span>
              <ButtonSecondary
                className="scr-peer__anonbtn"
                onClick={() => set({ prvAnonOn: !prvAnonOn })}
              >
                {prvAnonOn ? t("screensB.peer.showName") : t("screensB.peer.hideName")}
              </ButtonSecondary>
              <ButtonPrimary
                className="scr-peer__sendbtn"
                icon="arrow-right"
                iconSize={15}
                iconEnd
                onClick={send}
              >
                {t("screensB.peer.sendNext")}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-list">
        <div className="scr-peer__gothead">
          {t("screensB.peer.gotHead")}{" "}
          <span className="scr-peer__gotsub">
            {t("screensB.peer.gotSub", { num: RECEIVED_MODULE, piece: RECEIVED_PIECE })}
          </span>
        </div>

        {/*
         * The comp replaced this reviewer's name with "A classmate" whenever
         * `prvAnonOn` was set. That toggle decides whether YOUR name rides
         * along on the review you are writing — it has nothing to do with who
         * wrote you one, it was applied to only one of the two, and the
         * monogram stayed put, so it anonymised nobody. Names stand.
         */}
        {PEER_RECEIVED.map((g) => (
          <div key={g.id} className="scr-peer__gotrow">
            <span className="scr-peer__gotavatar" aria-hidden="true">
              {g.ini}
            </span>
            <div className="scr-peer__gotbody">
              <div className="scr-peer__gotmeta">
                <span className="scr-peer__gotwho">{g.who}</span>
                <span className="scr-peer__gotat lp-mono">{g.at}</span>
                <span className="scr-peer__gotscore lp-mono">{g.score}</span>
              </div>
              <p className="scr-peer__gottext">{g.text}</p>
              <button
                type="button"
                className="lp-nav scr-peer__thank"
                onClick={() => {
                  if (thanked[g.id]) return;
                  setThanked((prev) => ({ ...prev, [g.id]: true }));
                  showToast(t("screensB.peer.thanksSent", { who: g.who }), "heart");
                }}
                aria-pressed={thanked[g.id]}
              >
                <Icon name="heart" size={14} />
                {thanked[g.id] ? t("screensB.peer.thanked") : t("screensB.peer.thankThem")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
