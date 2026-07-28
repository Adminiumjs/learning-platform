/*
 * Course editor — the instructor's settings page for one course.
 *
 * Everything on the left writes straight to the store, so the title typed at
 * the top is the title in the page heading and on the sticky bar's preview a
 * moment later. The right rail is the cover designer: a live `Cover` over the
 * chosen tint and glyph, which is exactly what the catalogue card will draw.
 *
 * Two things the comp hardcoded are read from the seam instead, because the
 * data behind them exists: the "5 · 22 lessons" and "30 in cohort 03" meta
 * rows now recount from `dataSource`, so adding a module cannot make this page
 * lie. The rating stays page-local — no rating lives on a course record.
 *
 * The comp's `edStateIcon` asked for lucide's `globe`, which is not in the
 * app's icon registry (and the registry is shared, so a screen may not add to
 * it). `badge-check` carries the same "this is out in the world" reading and
 * is registered; noted here so nobody thinks it was a whim.
 */

import type { CSSProperties } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  Cover,
  Field,
  Icon,
  IconButton,
  Pill,
  Segmented,
  TextArea,
  TextInput,
} from "../components";
import type { SegmentOption } from "../components";
import {
  COHORT_NO,
  COVER_ICONS,
  LAST_SAVED_TIME,
  LEVELS,
  RATING_LINE,
  TINTS,
} from "../data/screens/editor";
import { dataSource } from "../data/source";
import { demoNow, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-editor.css";

const LEVEL_OPTIONS: SegmentOption<string>[] = LEVELS.map((l) => ({ id: l, label: l }));

export default function Editor() {
  const edTitle = useAppStore((s) => s.edTitle);
  const edDesc = useAppStore((s) => s.edDesc);
  const edPrice = useAppStore((s) => s.edPrice);
  const edCode = useAppStore((s) => s.edCode);
  const edLevel = useAppStore((s) => s.edLevel);
  const edTint = useAppStore((s) => s.edTint);
  const edIcon = useAppStore((s) => s.edIcon);
  const edLearn = useAppStore((s) => s.edLearn);
  const edPublished = useAppStore((s) => s.edPublished);
  const edSavedAt = useAppStore((s) => s.edSavedAt);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openCourse = useAppStore((s) => s.openCourse);
  const showToast = useAppStore((s) => s.showToast);

  const meta = [
    {
      i: "list-tree",
      k: "Modules",
      v: `${dataSource.modules().length} · ${dataSource.totalLessons()} lessons`,
      mono: false,
    },
    {
      i: "users",
      k: "Enrolled",
      v: `${dataSource.cohortCapacity()} in cohort ${COHORT_NO}`,
      mono: false,
    },
    { i: "star", k: "Rating", v: RATING_LINE, mono: true },
  ];

  const editLearn = (i: number, value: string) => {
    const next = edLearn.slice();
    next[i] = value;
    set({ edLearn: next });
  };

  const removeLearn = (i: number) => {
    const next = edLearn.slice();
    next.splice(i, 1);
    set({ edLearn: next });
  };

  const save = () => {
    set({ edSavedAt: "Saved just now" });
    showToast("Course settings saved.", "check");
  };

  return (
    <>
      <div className="lp-page scr-editor">
        <header className="ed-head">
          <div className="ed-head__text">
            <span className="ed-eyebrow">
              <Icon name="settings-2" size={15} />
              Course settings
            </span>
            <h1 className="ed-title">{edTitle}</h1>
          </div>
          <Pill
            className="ed-state"
            tone={edPublished ? "pos" : "neutral"}
            icon={edPublished ? "badge-check" : "pencil"}
            iconSize={14}
          >
            {edPublished ? "Published" : "Draft"}
          </Pill>
        </header>

        <div className="ed-grid">
          <div className="ed-col">
            <section className="ed-card">
              <h2 className="ed-card__title">The basics</h2>

              <Field label="Title" htmlFor="ed-title">
                <TextInput
                  id="ed-title"
                  className="ed-input ed-input--title"
                  value={edTitle}
                  onChange={(v) => set({ edTitle: v })}
                />
              </Field>

              <Field label="Summary" htmlFor="ed-desc">
                <TextArea
                  id="ed-desc"
                  rows={4}
                  className="ed-summary"
                  value={edDesc}
                  onChange={(v) => set({ edDesc: v })}
                />
              </Field>

              <div className="ed-pair">
                <Field label="Price" htmlFor="ed-price">
                  <TextInput
                    id="ed-price"
                    mono
                    className="ed-input"
                    value={edPrice}
                    onChange={(v) => set({ edPrice: v })}
                  />
                </Field>
                <Field label="Course code" htmlFor="ed-code">
                  <TextInput
                    id="ed-code"
                    mono
                    className="ed-input"
                    value={edCode}
                    onChange={(v) => set({ edCode: v })}
                  />
                </Field>
              </div>

              <div className="ed-group">
                <span className="ed-group__label">Level</span>
                <Segmented
                  className="ed-group__seg"
                  options={LEVEL_OPTIONS}
                  value={edLevel}
                  onChange={(l) => set({ edLevel: l })}
                  label="Level"
                />
              </div>
            </section>

            <section className="ed-card">
              <div className="ed-card__head">
                <h2 className="ed-card__title">What you&rsquo;ll learn</h2>
                <ButtonSecondary
                  className="ed-addline"
                  onClick={() => set({ edLearn: [...edLearn, ""] })}
                >
                  Add a line
                </ButtonSecondary>
              </div>

              {edLearn.map((t, i) => (
                /* Index keys are right here: the rows have no id, and reorder
                   is a drag affordance the comp never wired up. */
                <div key={i} className="ed-learn">
                  <Icon name="grip-vertical" size={15} className="ed-learn__grip" />
                  <TextInput
                    className="ed-learn__field"
                    value={t}
                    onChange={(v) => editLearn(i, v)}
                    ariaLabel={`Learning outcome ${i + 1}`}
                  />
                  <IconButton
                    className="ed-learn__x"
                    icon="x"
                    iconSize={14}
                    label={`Remove learning outcome ${i + 1}`}
                    onClick={() => removeLearn(i)}
                  />
                </div>
              ))}

              {/* Removing every line is reachable, and the comp left the card
                  looking broken when you did. */}
              {edLearn.length === 0 ? (
                <p className="ed-learn__none">
                  No outcomes yet. A course page with none of these reads like a
                  syllabus nobody wrote.
                </p>
              ) : null}
            </section>
          </div>

          <div className="ed-col">
            <section className="ed-card ed-card--rail">
              <h2 className="ed-card__title">Cover</h2>

              <Cover className="ed-cover" tint={edTint} icon={edIcon} iconSize={46} angle="155deg" />

              <div className="ed-tints">
                {TINTS.map((t) => (
                  <button
                    key={t.hex}
                    type="button"
                    className={`lp-btn ed-tint${t.hex === edTint ? " is-on" : ""}`}
                    style={{ "--tint": t.hex } as CSSProperties}
                    onClick={() => set({ edTint: t.hex })}
                    aria-pressed={t.hex === edTint}
                    aria-label={t.name}
                    title={t.name}
                  />
                ))}
              </div>

              {/* Icon-only, so this is a hand-rolled picker rather than
                  `Segmented`, which would render buttons with no accessible
                  name. Same inset-track look, spelled out in the sheet. */}
              <div className="ed-icons" role="group" aria-label="Cover icon">
                {COVER_ICONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`lp-chip ed-icon${c.name === edIcon ? " is-on" : ""}`}
                    onClick={() => set({ edIcon: c.name })}
                    aria-pressed={c.name === edIcon}
                    aria-label={c.label}
                    title={c.label}
                  >
                    <Icon name={c.name} size={16} />
                  </button>
                ))}
              </div>
            </section>

            <section className="lp-list ed-meta">
              {meta.map((m) => (
                <div key={m.k} className="lp-list__row ed-meta__row">
                  <Icon name={m.i} size={16} className="ed-meta__ico" />
                  <span className="ed-meta__k">{m.k}</span>
                  <span className={`ed-meta__v${m.mono ? " lp-mono" : ""}`}>{m.v}</span>
                </div>
              ))}
              <button type="button" className="lp-row ed-meta__go" onClick={() => go("content")}>
                Edit modules and lessons
              </button>
            </section>
          </div>
        </div>
      </div>

      <div className="ed-bar">
        <div className="ed-bar__inner">
          <span className="ed-bar__at">
            {edSavedAt || `Last saved ${fmtDate(demoNow(week))} · ${LAST_SAVED_TIME}`}
          </span>
          {/* Previews the course being edited rather than the comp's fixed
              "DS-101"; an unknown code falls back to the first course, which
              is what `dataSource.course` already guarantees. */}
          <ButtonSecondary className="ed-bar__preview" onClick={() => openCourse(edCode)}>
            Preview as student
          </ButtonSecondary>
          <ButtonPrimary onClick={save}>Save changes</ButtonPrimary>
        </div>
      </div>
    </>
  );
}
