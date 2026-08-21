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
import { levelName } from "../data/format";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { demoNow, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-editor.css";

export default function Editor() {
  const { t, number, money } = useI18n();

  /*
   * Built per render, not at module scope: a module-level const would call
   * `levelName` before <App> has pushed the live `t` into the ambient bridge
   * and freeze the three labels into English for the life of the tab. The
   * `id` stays the English `CourseLevel` token — it is the stored value, and
   * it must not move when the language does — while the label follows the
   * reader.
   */
  const levelOptions: SegmentOption<string>[] = LEVELS.map((l) => ({
    id: l,
    label: levelName(l),
  }));
  const edTitle = useAppStore((s) => s.edTitle);
  const edDesc = useAppStore((s) => s.edDesc);
  const edPriceRaw = useAppStore((s) => s.edPrice);
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

  /*
   * `null` until the teacher types: the seeded price then renders from the
   * course record's own number through `Intl`, so a German reader sees
   * "180,00 $" rather than a hard-coded "$180". An edit wins verbatim.
   */
  const edPrice = edPriceRaw ?? money(dataSource.course("DS-101").price);

  const meta = [
    {
      i: "list-tree",
      k: t("screensA.editor.metaModules"),
      v: t(
        "screensA.editor.metaModulesValue",
        {
          modules: number(dataSource.modules().length),
          count: number(dataSource.totalLessons()),
        },
        dataSource.totalLessons(),
      ),
      mono: false,
    },
    {
      i: "users",
      k: t("screensA.editor.metaEnrolled"),
      v: t("screensA.editor.metaEnrolledValue", {
        count: number(dataSource.cohortCapacity()),
        no: COHORT_NO,
      }),
      mono: false,
    },
    { i: "star", k: t("screensA.editor.metaRating"), v: RATING_LINE, mono: true },
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
    set({ edSavedAt: t("screensA.editor.savedJustNow") });
    showToast(t("screensA.editor.savedToast"), "check");
  };

  return (
    <>
      <div className="lp-page scr-editor">
        <header className="ed-head">
          <div className="ed-head__text">
            <span className="ed-eyebrow">
              <Icon name="settings-2" size={15} />
              {t("screensA.editor.eyebrow")}
            </span>
            <h1 className="ed-title">{edTitle}</h1>
          </div>
          <Pill
            className="ed-state"
            tone={edPublished ? "pos" : "neutral"}
            icon={edPublished ? "badge-check" : "pencil"}
            iconSize={14}
          >
            {edPublished ? t("screensA.editor.published") : t("screensA.editor.draft")}
          </Pill>
        </header>

        <div className="ed-grid">
          <div className="ed-col">
            <section className="ed-card">
              <h2 className="ed-card__title">{t("screensA.editor.basics")}</h2>

              <Field label={t("screensA.editor.fieldTitle")} htmlFor="ed-title">
                <TextInput
                  id="ed-title"
                  className="ed-input ed-input--title"
                  value={edTitle}
                  onChange={(v) => set({ edTitle: v })}
                />
              </Field>

              <Field label={t("screensA.editor.fieldSummary")} htmlFor="ed-desc">
                <TextArea
                  id="ed-desc"
                  rows={4}
                  className="ed-summary"
                  value={edDesc}
                  onChange={(v) => set({ edDesc: v })}
                />
              </Field>

              <div className="ed-pair">
                <Field label={t("screensA.editor.fieldPrice")} htmlFor="ed-price">
                  <TextInput
                    id="ed-price"
                    mono
                    className="ed-input"
                    value={edPrice}
                    onChange={(v) => set({ edPrice: v })}
                  />
                </Field>
                <Field label={t("screensA.editor.fieldCode")} htmlFor="ed-code">
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
                <span className="ed-group__label">{t("screensA.editor.level")}</span>
                <Segmented
                  className="ed-group__seg"
                  options={levelOptions}
                  value={edLevel}
                  onChange={(l) => set({ edLevel: l })}
                  label={t("screensA.editor.level")}
                />
              </div>
            </section>

            <section className="ed-card">
              <div className="ed-card__head">
                <h2 className="ed-card__title">{t("screensA.editor.whatYoullLearn")}</h2>
                <ButtonSecondary
                  className="ed-addline"
                  onClick={() => set({ edLearn: [...edLearn, ""] })}
                >
                  {t("screensA.editor.addLine")}
                </ButtonSecondary>
              </div>

              {edLearn.map((line, i) => (
                /* Index keys are right here: the rows have no id, and reorder
                   is a drag affordance the comp never wired up. */
                <div key={i} className="ed-learn">
                  <Icon name="grip-vertical" size={15} className="ed-learn__grip" />
                  <TextInput
                    className="ed-learn__field"
                    value={line}
                    onChange={(v) => editLearn(i, v)}
                    ariaLabel={t("screensA.editor.outcomeLabel", { n: number(i + 1) })}
                  />
                  <IconButton
                    className="ed-learn__x"
                    icon="x"
                    iconSize={14}
                    label={t("screensA.editor.removeOutcome", { n: number(i + 1) })}
                    onClick={() => removeLearn(i)}
                  />
                </div>
              ))}

              {/* Removing every line is reachable, and the comp left the card
                  looking broken when you did. */}
              {edLearn.length === 0 ? (
                <p className="ed-learn__none">{t("screensA.editor.noOutcomes")}</p>
              ) : null}
            </section>
          </div>

          <div className="ed-col">
            <section className="ed-card ed-card--rail">
              <h2 className="ed-card__title">{t("screensA.editor.cover")}</h2>

              <Cover className="ed-cover" tint={edTint} icon={edIcon} iconSize={46} angle="155deg" />

              <div className="ed-tints">
                {TINTS.map((tint) => (
                  <button
                    key={tint.hex}
                    type="button"
                    className={`lp-btn ed-tint${tint.hex === edTint ? " is-on" : ""}`}
                    style={{ "--tint": tint.hex } as CSSProperties}
                    onClick={() => set({ edTint: tint.hex })}
                    aria-pressed={tint.hex === edTint}
                    aria-label={tint.name}
                    title={tint.name}
                  />
                ))}
              </div>

              {/* Icon-only, so this is a hand-rolled picker rather than
                  `Segmented`, which would render buttons with no accessible
                  name. Same inset-track look, spelled out in the sheet. */}
              <div className="ed-icons" role="group" aria-label={t("screensA.editor.coverIcon")}>
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
                {t("screensA.editor.editModules")}
              </button>
            </section>
          </div>
        </div>
      </div>

      <div className="ed-bar">
        <div className="ed-bar__inner">
          <span className="ed-bar__at">
            {edSavedAt ||
              t("screensA.editor.lastSaved", {
                date: fmtDate(demoNow(week)),
                time: LAST_SAVED_TIME,
              })}
          </span>
          {/* Previews the course being edited rather than the comp's fixed
              "DS-101"; an unknown code falls back to the first course, which
              is what `dataSource.course` already guarantees. */}
          <ButtonSecondary className="ed-bar__preview" onClick={() => openCourse(edCode)}>
            {t("screensA.editor.previewAsStudent")}
          </ButtonSecondary>
          <ButtonPrimary onClick={save}>{t("screensA.editor.saveChanges")}</ButtonPrimary>
        </div>
      </div>
    </>
  );
}
