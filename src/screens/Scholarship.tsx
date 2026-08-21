/*
 * Scholarship application.
 *
 * Six funded places every cohort, applied for with a form built not to
 * humiliate anyone: no proof of income, no hardship essay. Five plain
 * sentences to pick from and a text box about what you would build.
 *
 * The reassurance ("applying costs nothing") sits above the form rather than
 * in a footnote below it, because by the time you read a footnote you have
 * already decided not to apply.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Callout,
  Card,
  CheckRow,
  Icon,
  Segmented,
  TextArea,
  Toggle,
} from "../components";
import {
  SCHOLARSHIP_AMOUNTS,
  SCHOLARSHIP_COURSES,
  SCHOLARSHIP_DEADLINE,
  SCHOLARSHIP_DECISION_DATE,
  SCHOLARSHIP_NOTES,
  SCHOLARSHIP_REF,
  SCHOLARSHIP_SITUATIONS,
  SCHOLARSHIP_WORDS,
} from "../data/screens/scholarship";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-scholarship.css";

/** Funded places per intake — the eyebrow's number. */
const FUNDED_PLACES = 6;

/** The confirmation replaces a long form, so it starts at the top. */
function toTop(): void {
  try {
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch {
    /* non-browser hosts */
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function Scholarship() {
  const { t, number } = useI18n();
  const scDone = useAppStore((s) => s.scDone);
  const scCourse = useAppStore((s) => s.scCourse);
  const scAmount = useAppStore((s) => s.scAmount);
  const scSit = useAppStore((s) => s.scSit);
  const scText = useAppStore((s) => s.scText);
  const scForward = useAppStore((s) => s.scForward);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const instructorFirst = dataSource.instructor().name.split(" ")[0];

  /* ---------------------------------------------------------------- sent -- */

  if (scDone) {
    return (
      <div className="lp-page scr-scholarship sch-sent">
        <span className="sch-sent__ico">
          <Icon name="heart-handshake" size={28} />
        </span>
        <h1 className="sch-sent__title">{t("screensB.scholarship.sentTitle")}</h1>
        <p className="sch-sent__body">
          {t("screensB.scholarship.sentBody", {
            name: instructorFirst,
            date: SCHOLARSHIP_DECISION_DATE,
          })}
        </p>
        <span className="lp-mono sch-sent__ref">
          <Icon name="file-text" size={15} />
          {SCHOLARSHIP_REF}
        </span>
        <ButtonSecondary className="sch-sent__back" onClick={() => go("catalog")}>
          {t("screensB.scholarship.backToCourses")}
        </ButtonSecondary>
      </div>
    );
  }

  /* ---------------------------------------------------------------- form -- */

  const words = countWords(scText);

  function submit(): void {
    if (!scSit) {
      showToast(t("screensB.scholarship.pickSituation"), "info");
      return;
    }
    if (!scText.trim()) {
      showToast(t("screensB.scholarship.needSentences"), "info");
      return;
    }
    set({ scDone: true });
    toTop();
    showToast(t("screensB.scholarship.sentToast", { ref: SCHOLARSHIP_REF }), "heart-handshake");
  }

  return (
    <div className="lp-page scr-scholarship">
      <div className="sch-head">
        <div className="sch-eyebrow">
          <Icon name="heart-handshake" size={15} />
          {t("screensB.scholarship.eyebrow", { total: number(FUNDED_PLACES) }, FUNDED_PLACES)}
        </div>
        <h1 className="sch-title">{t("screensB.scholarship.title")}</h1>
        <p className="sch-lede">{t("screensB.scholarship.lede")}</p>
      </div>

      <Callout tone="pos" icon="shield-check" className="sch-safe">
        {t("screensB.scholarship.safe")}
      </Callout>

      <Card className="sch-form">
        <div className="sch-block">
          <span className="sch-block__label">{t("screensB.scholarship.whichCourse")}</span>
          <Segmented
            options={SCHOLARSHIP_COURSES}
            value={scCourse}
            onChange={(id) => set({ scCourse: id })}
            label={t("screensB.scholarship.whichCourse")}
            className="sch-courses"
          />
        </div>

        <div className="sch-block">
          <span className="sch-block__label" id="sch-amount-label">
            {t("screensB.scholarship.howMuch")}
          </span>
          <div className="sch-amounts" role="radiogroup" aria-labelledby="sch-amount-label">
            {SCHOLARSHIP_AMOUNTS.map((a) => (
              <button
                type="button"
                role="radio"
                aria-checked={scAmount === a.id}
                key={a.id}
                className={`sch-amount${scAmount === a.id ? " is-on" : ""}`}
                onClick={() => set({ scAmount: a.id })}
              >
                <span className="lp-mono sch-amount__value">{a.label}</span>
                <span className="sch-amount__sub">{a.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sch-block">
          <span className="sch-block__label" id="sch-sit-label">
            {t("screensB.scholarship.closest")}
          </span>
          <div className="sch-sits" role="radiogroup" aria-labelledby="sch-sit-label">
            {SCHOLARSHIP_SITUATIONS.map((s) => (
              <CheckRow
                key={s.id}
                radio
                checked={scSit === s.id}
                onChange={() => set({ scSit: s.id })}
              >
                {s.label}
              </CheckRow>
            ))}
          </div>
        </div>

        <div className="sch-block">
          <label className="sch-block__label" htmlFor="sch-text">
            {t("screensB.scholarship.whatBuild")}
            <span
              className={`lp-mono sch-count${words > SCHOLARSHIP_WORDS ? " sch-count--over" : ""}`}
            >
              {t("screensB.scholarship.wordCount", {
                words: number(words),
                max: number(SCHOLARSHIP_WORDS),
              })}
            </span>
          </label>
          <TextArea
            id="sch-text"
            value={scText}
            onChange={(v) => set({ scText: v })}
            placeholder={t("screensB.scholarship.textPlaceholder")}
            className="sch-text"
          />
        </div>

        <div className="sch-forward">
          <span className="sch-forward__text">
            <span className="sch-forward__title">{t("screensB.scholarship.forwardTitle")}</span>
            <span className="sch-forward__sub">{t("screensB.scholarship.forwardSub")}</span>
          </span>
          <Toggle
            checked={scForward}
            onChange={(next) => set({ scForward: next })}
            label={t("screensB.scholarship.forwardTitle")}
            hideLabel
          />
        </div>

        <div className="sch-submit">
          <ButtonPrimary className="sch-send" onClick={submit}>
            {t("screensB.scholarship.send")}
          </ButtonPrimary>
          <span className="sch-deadline">{SCHOLARSHIP_DEADLINE}</span>
        </div>
      </Card>

      <div className="sch-notes">
        <div className="sch-notes__title">{t("screensB.scholarship.notesTitle")}</div>
        {SCHOLARSHIP_NOTES.map((note) => (
          <div className="sch-note" key={note}>
            <Icon name="check" size={15} className="sch-note__ico" />
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}
