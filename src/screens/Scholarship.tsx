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
import { useAppStore } from "../state/store";
import "../styles/screen-scholarship.css";

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
  const scDone = useAppStore((s) => s.scDone);
  const scCourse = useAppStore((s) => s.scCourse);
  const scAmount = useAppStore((s) => s.scAmount);
  const scSit = useAppStore((s) => s.scSit);
  const scText = useAppStore((s) => s.scText);
  const scForward = useAppStore((s) => s.scForward);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  /* ---------------------------------------------------------------- sent -- */

  if (scDone) {
    return (
      <div className="lp-page scr-scholarship sch-sent">
        <span className="sch-sent__ico">
          <Icon name="heart-handshake" size={28} />
        </span>
        <h1 className="sch-sent__title">Application in. Thank you.</h1>
        <p className="sch-sent__body">
          Yara reads every one herself, usually on a Sunday. You'll hear either way by{" "}
          {SCHOLARSHIP_DECISION_DATE} — a no is a no for this cohort only.
        </p>
        <span className="lp-mono sch-sent__ref">
          <Icon name="file-text" size={15} />
          {SCHOLARSHIP_REF}
        </span>
        <ButtonSecondary className="sch-sent__back" onClick={() => go("catalog")}>
          Back to courses
        </ButtonSecondary>
      </div>
    );
  }

  /* ---------------------------------------------------------------- form -- */

  const words = countWords(scText);

  function submit(): void {
    if (!scSit) {
      showToast("Pick the line closest to you.", "info");
      return;
    }
    if (!scText.trim()) {
      showToast("A few sentences about what you would build.", "info");
      return;
    }
    set({ scDone: true });
    toTop();
    showToast(`Application sent · ${SCHOLARSHIP_REF}`, "heart-handshake");
  }

  return (
    <div className="lp-page scr-scholarship">
      <div className="sch-head">
        <div className="sch-eyebrow">
          <Icon name="heart-handshake" size={15} />
          Cohort 04 · six funded places
        </div>
        <h1 className="sch-title">Scholarship application</h1>
        <p className="sch-lede">
          A fifth of every cohort is funded. No essays about hardship, no proof of income — just
          tell us where you are and what you'd do with it. Two hundred words is plenty.
        </p>
      </div>

      <Callout tone="pos" icon="shield-check" className="sch-safe">
        Applying costs nothing and never affects your place if you later pay in full.
      </Callout>

      <Card className="sch-form">
        <div className="sch-block">
          <span className="sch-block__label">Which course?</span>
          <Segmented
            options={SCHOLARSHIP_COURSES}
            value={scCourse}
            onChange={(id) => set({ scCourse: id })}
            label="Which course?"
            className="sch-courses"
          />
        </div>

        <div className="sch-block">
          <span className="sch-block__label" id="sch-amount-label">
            How much would you need covered?
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
                <span className="lp-mono sch-amount__value">{a.id}</span>
                <span className="sch-amount__sub">{a.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sch-block">
          <span className="sch-block__label" id="sch-sit-label">
            Which of these is closest to you?
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
            What would you build with it?
            <span
              className={`lp-mono sch-count${words > SCHOLARSHIP_WORDS ? " sch-count--over" : ""}`}
            >
              {words} / {SCHOLARSHIP_WORDS} words
            </span>
          </label>
          <TextArea
            id="sch-text"
            value={scText}
            onChange={(v) => set({ scText: v })}
            placeholder="The thing you'd fix, and who it's for. Plain words are fine."
            className="sch-text"
          />
        </div>

        <div className="sch-forward">
          <span className="sch-forward__text">
            <span className="sch-forward__title">Pay it forward later</span>
            <span className="sch-forward__sub">
              If things change, you can fund a future place. Entirely optional.
            </span>
          </span>
          <Toggle
            checked={scForward}
            onChange={(next) => set({ scForward: next })}
            label="Pay it forward later"
            hideLabel
          />
        </div>

        <div className="sch-submit">
          <ButtonPrimary className="sch-send" onClick={submit}>
            Send application
          </ButtonPrimary>
          <span className="sch-deadline">{SCHOLARSHIP_DEADLINE}</span>
        </div>
      </Card>

      <div className="sch-notes">
        <div className="sch-notes__title">Who this is for</div>
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
