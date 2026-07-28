/*
 * Instructor onboarding.
 *
 * Six things between a new instructor and a live course. The checklist is
 * honest about the order — bio, course, lessons, dates, payouts, review — and
 * every row has a real destination, so it is a map of the instructor half of
 * the app rather than a progress theatre.
 *
 * Ticking a row is manual on purpose: this is a demo, and the point is to
 * watch the ring fill and the review button wake up.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  ProgressRing,
} from "../components";
import { ONBOARD_PAY, ONBOARD_RULES, ONBOARD_STEPS } from "../data/screens/teachonboard";
import { useAppStore } from "../state/store";
import "../styles/screen-teachonboard.css";

export default function TeachOnboard() {
  const ioDone = useAppStore((s) => s.ioDone);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const doneCount = ONBOARD_STEPS.filter((s) => ioDone[s.k]).length;
  const pct = Math.round((doneCount / ONBOARD_STEPS.length) * 100);
  const ready = doneCount === ONBOARD_STEPS.length;

  function toggle(k: string, on: boolean): void {
    set({ ioDone: { ...ioDone, [k]: !on } });
  }

  function submit(): void {
    if (!ready) {
      showToast("Six things first — tick them off as you go.", "info");
      return;
    }
    showToast("Sent to Nadia. Expect notes within two days.", "send");
  }

  return (
    <div className="lp-page scr-teachonboard">
      <div className="io-head">
        <div className="io-head__text">
          <div className="io-eyebrow">
            <Icon name="sparkles" size={15} />
            Welcome to teaching here
          </div>
          <h1 className="io-title">Get Portfolio Studio ready</h1>
          <p className="io-sub">
            {ready
              ? "Everything is ready. Send it to Nadia when you are happy."
              : "Six things and Portfolio Studio is ready to teach. Nothing here is permanent."}
          </p>
        </div>
        <div className="io-score">
          <ProgressRing pct={pct} size="sm" label="Setup progress" />
          <div>
            <div className="io-score__label">Setup</div>
            <div className="io-score__count">
              {doneCount} of {ONBOARD_STEPS.length} done
            </div>
          </div>
        </div>
      </div>

      <div className="lp-list io-steps">
        {ONBOARD_STEPS.map((step) => {
          const on = !!ioDone[step.k];
          return (
            <div
              className={`lp-list__row io-step${on ? " io-step--done" : ""}`}
              key={step.k}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={step.title}
                className={`io-check${on ? " is-on" : ""}`}
                onClick={() => toggle(step.k, on)}
              >
                <Icon name="check" size={15} />
              </button>

              <span className="io-step__body">
                <span className="io-step__title">{step.title}</span>
                <span className="io-step__text">{step.body}</span>
                {step.meta ? <span className="lp-mono io-step__meta">{step.meta}</span> : null}
              </span>

              {/*
                The shared `go` derives the persona from the view, and the
                profile screen is classified student-side — so "Write it" drops
                the shell out of the instructor nav. Noted rather than worked
                around: the persona map is shared foundation.
              */}
              <ButtonSecondary
                className="io-step__cta"
                icon="arrow-right"
                iconSize={14}
                iconEnd
                onClick={() => go(step.go)}
              >
                {step.cta}
              </ButtonSecondary>
            </div>
          );
        })}
      </div>

      <div className="io-bottom">
        <div className="io-pay">
          <div className="io-card__title">How you get paid</div>
          {ONBOARD_PAY.map((row) => (
            <div className="io-payrow" key={row.label}>
              <Icon name={row.icon} size={16} className="io-payrow__ico" />
              <span className="io-payrow__k">{row.label}</span>
              <span className={`io-payrow__v${row.mono ? " lp-mono io-payrow__v--mono" : ""}`}>
                {row.value}
              </span>
            </div>
          ))}
          <ButtonSecondary className="io-pay__cta" onClick={() => go("payouts")}>
            Set up payouts
          </ButtonSecondary>
        </div>

        <div className="io-rules">
          <div className="io-rules__head">
            <Icon name="book-open" size={16} className="io-rules__ico" />
            <span className="io-card__title">House rules, briefly</span>
          </div>
          {ONBOARD_RULES.map((rule) => (
            <div className="io-rule" key={rule}>
              <span className="io-rule__dot" />
              {rule}
            </div>
          ))}
        </div>
      </div>

      <div className={`io-ready${ready ? " io-ready--on" : ""}`}>
        <Icon
          name={ready ? "check-circle-2" : "hourglass"}
          size={22}
          className="io-ready__ico"
        />
        <span className="io-ready__text">
          {ready
            ? "All six done. Nadia usually comes back within two working days."
            : "Finish the list and the review button wakes up. Tick items as you go."}
        </span>
        <ButtonPrimary
          className={`io-ready__cta${ready ? "" : " io-ready__cta--off"}`}
          onClick={submit}
        >
          {ready ? "Send for review" : "Not ready yet"}
        </ButtonPrimary>
      </div>
    </div>
  );
}
