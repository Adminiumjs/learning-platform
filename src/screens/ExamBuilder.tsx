/*
 * Exam builder — the instructor's side of the final exam.
 *
 * A list of questions on the left, one question open on the right. Everything
 * the instructor types is an *override* held against the seeded exam rather
 * than a rewrite of it: `ebText`, `ebKind`, `ebOpt` and `ebSec` are maps keyed
 * by question id, so the exam students actually sit (`dataSource.exam()`)
 * stays the source of truth and the builder never seeds a copy of it.
 *
 * One thing had to be solved locally. An answer key is a *set* — a "choose
 * all" question has several right options — but the store types `ebRight` as
 * `Record<string, number>`, one index per question, which cannot hold one.
 * Widening a shared file was not mine to do, so the override lives in local
 * state here and `ebRight` goes unused. Flagged in the hand-off notes; once
 * the store's type is widened this becomes a one-line change.
 */

import { useState } from "react";
import { ButtonPrimary, ButtonSecondary, Callout, Icon, Pill, Segmented } from "../components";
import type { SegmentOption } from "../components";
import { KIND_LABELS, KIND_OPTIONS, OPEN_NOTE, RULE_LABELS } from "../data/screens/exambuilder";
import { dataSource } from "../data/source";
import type { ExamQuestion, ExamQuestionKind } from "../data/types";
import { useAppStore } from "../state/store";
import "../styles/screen-exambuilder.css";

const KIND_SEGMENTS: SegmentOption<string>[] = KIND_OPTIONS.map((k) => ({
  id: k.id,
  label: k.label,
}));

/** "01", "02" — the list's mono index. */
function ordinal(i: number): string {
  return String(i + 1).padStart(2, "0");
}

/**
 * The seeded answer key as a set of option indices.
 *
 * `single` stores one index, `multi` an array, `short` accepted spellings and
 * `essay` nothing at all — only the first two can be drawn as marked options.
 */
function seededKey(q: ExamQuestion): number[] {
  if (typeof q.a === "number") return [q.a];
  if (Array.isArray(q.a)) return q.a.filter((x): x is number => typeof x === "number");
  return [];
}

export default function ExamBuilder() {
  const ebI = useAppStore((s) => s.ebI);
  const ebText = useAppStore((s) => s.ebText);
  const ebKind = useAppStore((s) => s.ebKind);
  const ebOpt = useAppStore((s) => s.ebOpt);
  const ebSec = useAppStore((s) => s.ebSec);
  const ebPass = useAppStore((s) => s.ebPass);
  const ebAttempts = useAppStore((s) => s.ebAttempts);
  const ebDur = useAppStore((s) => s.ebDur);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const [rightOverride, setRightOverride] = useState<Record<number, number[]>>({});

  const questions = dataSource.exam();
  /* Clamped, so a stale index can never read off the end of the list. */
  const i = Math.min(Math.max(ebI, 0), questions.length - 1);
  const q = questions[i];

  const kindOf = (x: ExamQuestion): ExamQuestionKind =>
    (ebKind[x.id] as ExamQuestionKind) ?? x.kind;
  const textOf = (x: ExamQuestion): string => ebText[x.id] ?? x.q;

  const kind = kindOf(q);
  const hasOptions = (kind === "single" || kind === "multi") && Boolean(q.opts?.length);
  const isOpen = kind === "short" || kind === "essay";
  const right = rightOverride[q.id] ?? seededKey(q);

  /* The module the exam sits in — the comp typed "module 05" into the lede. */
  const examModule = dataSource.modules().find((m) => m.lessons.some((l) => l.kind === "exam"));

  const mark = (ix: number) => {
    const next =
      kind === "multi"
        ? right.includes(ix)
          ? right.filter((x) => x !== ix)
          : [...right, ix]
        : [ix];
    setRightOverride({ ...rightOverride, [q.id]: next });
  };

  const rules: { key: string; label: string; value: string; onChange: (v: string) => void }[] = [
    { key: "pass", label: RULE_LABELS.pass, value: ebPass, onChange: (v) => set({ ebPass: v }) },
    {
      key: "attempts",
      label: RULE_LABELS.attempts,
      value: ebAttempts,
      onChange: (v) => set({ ebAttempts: v }),
    },
    { key: "dur", label: RULE_LABELS.duration, value: ebDur, onChange: (v) => set({ ebDur: v }) },
  ];

  const confirmDelete = () =>
    openModal({
      title: `Delete question ${i + 1}?`,
      body: `The exam drops to ${questions.length - 1} questions and the section weights re-balance.`,
      icon: "trash-2",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => showToast("Nothing was deleted — this is a demo.", "info"),
    });

  return (
    <div className="lp-page scr-exambuilder">
      <header className="eb-head">
        <div className="eb-head__text">
          <h1 className="eb-title">Exam builder</h1>
          <p className="eb-lede">
            Final exam · {questions.length} questions
            {examModule ? ` · module ${examModule.num}` : ""}
          </p>
        </div>
        <ButtonPrimary
          className="eb-save"
          onClick={() =>
            showToast(`Exam saved · ${questions.length} questions, pass at ${ebPass}.`, "check")
          }
        >
          Save exam
        </ButtonPrimary>
      </header>

      <div className="eb-grid">
        <div className="eb-col">
          <section className="lp-list eb-list">
            <h2 className="eb-list__head">Questions</h2>

            {questions.map((x, ix) => (
              <button
                key={x.id}
                type="button"
                className={`lp-row eb-q${ix === i ? " is-active" : ""}`}
                aria-current={ix === i}
                onClick={() => set({ ebI: ix })}
              >
                <Icon name="grip-vertical" size={14} className="eb-q__grip" />
                <span className="lp-mono eb-q__n">{ordinal(ix)}</span>
                <span className="eb-q__text">{textOf(x)}</span>
                <Pill tone="neutral">{KIND_LABELS[kindOf(x)]}</Pill>
              </button>
            ))}

            <button
              type="button"
              className="lp-row eb-add"
              onClick={() => showToast("Demo — new questions are not saved here.", "plus")}
            >
              <Icon name="plus" size={15} />
              Add a question
            </button>
          </section>

          <section className="eb-card">
            <h2 className="eb-card__title">Rules</h2>
            {rules.map((r) => (
              <label key={r.key} className="eb-rule" htmlFor={`eb-rule-${r.key}`}>
                <span className="eb-rule__label">{r.label}</span>
                <input
                  id={`eb-rule-${r.key}`}
                  className="lp-fld lp-mono eb-rule__field"
                  value={r.value}
                  onChange={(e) => r.onChange(e.target.value)}
                />
              </label>
            ))}
          </section>
        </div>

        <section className="eb-card eb-editor">
          <div className="eb-editor__head">
            <h2 className="eb-card__title">Question {ordinal(i)}</h2>
            <Pill className="eb-editor__kind" tone="accent">
              {KIND_LABELS[kind]}
            </Pill>
          </div>

          <label className="eb-field" htmlFor="eb-text">
            <span className="eb-field__label">Question</span>
            <textarea
              id="eb-text"
              className="lp-fld eb-text"
              value={textOf(q)}
              onChange={(e) => set({ ebText: { ...ebText, [q.id]: e.target.value } })}
            />
          </label>

          <div className="eb-group">
            <span className="eb-field__label">Kind</span>
            <Segmented
              className="eb-group__seg"
              options={KIND_SEGMENTS}
              value={kind}
              onChange={(k) => set({ ebKind: { ...ebKind, [q.id]: k } })}
              label="Question kind"
            />
          </div>

          {hasOptions ? (
            <div className="eb-group">
              <span className="eb-field__label">
                Options · tap the circle to mark the right one
              </span>
              {(q.opts ?? []).map((o, ix) => {
                const on = right.includes(ix);
                const key = `${q.id}-${ix}`;
                return (
                  <div key={key} className="eb-opt">
                    <button
                      type="button"
                      role={kind === "multi" ? "checkbox" : "radio"}
                      aria-checked={on}
                      aria-label={`Mark option ${ix + 1} correct`}
                      className={`lp-btn eb-mark${kind === "multi" ? " eb-mark--multi" : ""}${on ? " is-on" : ""}`}
                      onClick={() => mark(ix)}
                    >
                      {on ? <Icon name="check" size={13} /> : null}
                    </button>
                    <input
                      className="lp-fld eb-opt__field"
                      aria-label={`Option ${ix + 1}`}
                      value={ebOpt[key] ?? o}
                      onChange={(e) => set({ ebOpt: { ...ebOpt, [key]: e.target.value } })}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}

          {isOpen ? (
            <Callout tone="info" icon="info">
              {OPEN_NOTE[kind]}
            </Callout>
          ) : null}

          <label className="eb-field" htmlFor="eb-sec">
            <span className="eb-field__label">Section</span>
            <input
              id="eb-sec"
              className="lp-fld eb-sec"
              value={ebSec[q.id] ?? q.sec}
              onChange={(e) => set({ ebSec: { ...ebSec, [q.id]: e.target.value } })}
            />
          </label>

          <div className="eb-editor__foot">
            <ButtonSecondary className="eb-delete" onClick={confirmDelete}>
              Delete question
            </ButtonSecondary>
            <ButtonPrimary
              className="eb-next"
              onClick={() => set({ ebI: (i + 1) % questions.length })}
            >
              Next question
            </ButtonPrimary>
          </div>
        </section>
      </div>
    </div>
  );
}
