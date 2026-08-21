/*
 * Refund request — the screen most course platforms hide.
 *
 * It has two states and one branch. The branch is the demo clock: inside the
 * first two weeks the refund is automatic and the notice is green; past that
 * a person reads it and the notice turns amber. Either way the form is five
 * radio buttons and an optional sentence — no interrogation, as promised on
 * the billing screen.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Callout,
  CheckRow,
  CoverChip,
  Icon,
  TextArea,
} from "../components";
import {
  REFUND_POLICY,
  REFUND_REASONS,
  REFUND_REF,
  REFUND_TIMELINE,
  REFUND_WINDOW_WEEKS,
} from "../data/screens/refund";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-refund.css";

export default function Refund() {
  const { t, money } = useI18n();
  const week = useAppStore((s) => s.week);
  const rfDone = useAppStore((s) => s.rfDone);
  const rfReason = useAppStore((s) => s.rfReason);
  const rfText = useAppStore((s) => s.rfText);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const late = week > REFUND_WINDOW_WEEKS;

  /* The comp hardcoded the title, order number, date and price into the
     markup, where they could drift from the order they describe. They are the
     enrolment record — so read it. */
  const course = dataSource.enrolledCourse("DS-101");

  const submit = () => {
    if (!rfReason) {
      showToast(t("screensB.refund.pickReason"), "info");
      return;
    }
    set({ rfDone: true });
    /* `go()` scrolls for us; a state flip inside the same view does not, and
       the confirmation starts above the fold. */
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      /* non-browser hosts */
    }
    showToast(t("screensB.refund.sentToast", { ref: REFUND_REF }), "check");
  };

  if (rfDone) {
    return (
      <div className="lp-page scr-refund rf-done">
        <span className="rf-tick">
          <Icon name="check" size={28} />
        </span>
        <h1 className="rf-done__title">{t("screensB.refund.doneTitle")}</h1>
        <p className="rf-done__body">{t("screensB.refund.doneBody")}</p>
        <span className="lp-mono rf-ref">
          <Icon name="receipt" size={15} />
          {REFUND_REF}
        </span>

        <div className="rf-timeline">
          {REFUND_TIMELINE.map((step) => (
            <div className="rf-step" key={step.label}>
              <span className={`rf-step__dot${step.done ? " rf-step__dot--done" : ""}`}>
                <Icon name={step.icon} size={13} />
              </span>
              <span className="rf-step__label">{step.label}</span>
              <span className="lp-mono rf-step__at">{step.at}</span>
            </div>
          ))}
        </div>

        <ButtonSecondary className="rf-back" onClick={() => go("learning")}>
          {t("screensB.refund.backToLearning")}
        </ButtonSecondary>
      </div>
    );
  }

  return (
    <div className="lp-page scr-refund">
      <div className="rf-head">
        <h1 className="rf-head__title">{t("screensB.refund.title")}</h1>
        <p className="rf-head__lede">{t("screensB.refund.lede")}</p>
      </div>

      {course ? (
        <section className="lp-cardbox rf-course">
          <CoverChip
            tint={course.tint}
            icon={course.icon}
            size="md"
            iconSize={22}
            className="rf-course__thumb"
          />
          <div className="rf-course__text">
            <div className="rf-course__title">{course.title}</div>
            <div className="lp-mono rf-course__meta">
              {t("screensB.refund.orderMeta", { order: course.order, date: course.date })}
            </div>
          </div>
          <span className="lp-mono rf-course__price">{money(course.price)}</span>
        </section>
      ) : null}

      <Callout
        className="rf-policy"
        tone={late ? "warn" : "pos"}
        icon={late ? "triangle-alert" : "shield-check"}
      >
        {late ? REFUND_POLICY.late : REFUND_POLICY.inside}
      </Callout>

      <section className="lp-cardbox rf-form">
        <h2 className="rf-form__head">{t("screensB.refund.whyHead")}</h2>
        <div className="rf-reasons" role="radiogroup" aria-label={t("screensB.refund.whyHead")}>
          {REFUND_REASONS.map((r) => (
            <CheckRow
              key={r.id}
              radio
              checked={rfReason === r.id}
              onChange={() => set({ rfReason: r.id })}
              className="rf-reason"
            >
              {r.label}
            </CheckRow>
          ))}
        </div>

        <TextArea
          className="rf-text"
          value={rfText}
          onChange={(v) => set({ rfText: v })}
          placeholder={t("screensB.refund.notePlaceholder")}
          ariaLabel={t("screensB.refund.noteAria")}
        />

        <div className="rf-actions">
          <ButtonPrimary className="rf-send" onClick={submit}>
            {t("screensB.refund.send")}
          </ButtonPrimary>
          <ButtonSecondary className="rf-never" onClick={() => go("learning")}>
            {t("screensB.refund.neverMind")}
          </ButtonSecondary>
        </div>
      </section>
    </div>
  );
}
