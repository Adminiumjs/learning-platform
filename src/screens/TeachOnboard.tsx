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
import { ASSISTANT } from "../data/demo";
import { ONBOARD_PAY, ONBOARD_RULES, ONBOARD_STEPS } from "../data/screens/teachonboard";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-teachonboard.css";

/** The course this instructor is getting ready — in-fiction catalogue title. */
const SUBJECT_COURSE = "Portfolio Studio";

export default function TeachOnboard() {
  const { t, number } = useI18n();
  const ioDone = useAppStore((s) => s.ioDone);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const doneCount = ONBOARD_STEPS.filter((s) => ioDone[s.k]).length;
  const total = ONBOARD_STEPS.length;
  const pct = Math.round((doneCount / total) * 100);
  const ready = doneCount === total;
  const reviewer = ASSISTANT.name.split(" ")[0];

  function toggle(k: string, on: boolean): void {
    set({ ioDone: { ...ioDone, [k]: !on } });
  }

  function submit(): void {
    if (!ready) {
      showToast(t("screensB.teachOnboard.notYet", { total: number(total) }, total), "info");
      return;
    }
    showToast(t("screensB.teachOnboard.sentToast", { name: reviewer }), "send");
  }

  return (
    <div className="lp-page scr-teachonboard">
      <div className="io-head">
        <div className="io-head__text">
          <div className="io-eyebrow">
            <Icon name="sparkles" size={15} />
            {t("screensB.teachOnboard.eyebrow")}
          </div>
          <h1 className="io-title">
            {t("screensB.teachOnboard.title", { course: SUBJECT_COURSE })}
          </h1>
          <p className="io-sub">
            {ready
              ? t("screensB.teachOnboard.subReady", { name: reviewer })
              : t(
                  "screensB.teachOnboard.subTodo",
                  { course: SUBJECT_COURSE, total: number(total) },
                  total,
                )}
          </p>
        </div>
        <div className="io-score">
          <ProgressRing pct={pct} size="sm" label={t("screensB.teachOnboard.setupAria")} />
          <div>
            <div className="io-score__label">{t("screensB.teachOnboard.setup")}</div>
            <div className="io-score__count">
              {t("screensB.teachOnboard.doneOf", {
                done: number(doneCount),
                total: number(total),
              })}
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
          <div className="io-card__title">{t("screensB.teachOnboard.payTitle")}</div>
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
            {t("screensB.teachOnboard.setUpPayouts")}
          </ButtonSecondary>
        </div>

        <div className="io-rules">
          <div className="io-rules__head">
            <Icon name="book-open" size={16} className="io-rules__ico" />
            <span className="io-card__title">{t("screensB.teachOnboard.rulesTitle")}</span>
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
            ? t(
                "screensB.teachOnboard.readyText",
                { name: reviewer, total: number(total) },
                total,
              )
            : t("screensB.teachOnboard.notReadyText")}
        </span>
        <ButtonPrimary
          className={`io-ready__cta${ready ? "" : " io-ready__cta--off"}`}
          onClick={submit}
        >
          {ready
            ? t("screensB.teachOnboard.sendForReview")
            : t("screensB.teachOnboard.notReadyCta")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
