/*
 * Checkout — enrolling in a course, and the receipt that follows.
 *
 * One screen, two states: the payment form, and the confirmation the comp
 * shows once the fake processor approves. Which way it goes is the demo dock's
 * `ckDecline` switch, so a presenter can show the decline path without having
 * to type a bad card number.
 *
 * Nothing here touches a real payment anything. The card is the seeded test
 * number, the "processor" is a 1.1s timeout, and the copy says so twice.
 */

import { useEffect } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  Callout,
  Card,
  CoverChip,
  Field,
  Icon,
  TextInput,
} from "../components";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { fmtDate, fmtTime, isCohort, liveDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-checkout.css";

/** How long the fake processor "thinks" before it approves or declines. */
const CONFIRM_MS = 1100;

/** The seeded test card and the placeholders around it — machine tokens. */
const TEST_CARD = "4242 4242 4242 4242";
const CARD_BRAND = "VISA";

export default function Checkout() {
  const { t, money, number } = useI18n();
  const courseId = useAppStore((s) => s.courseId);
  const week = useAppStore((s) => s.week);
  const mode = useAppStore((s) => s.mode);

  const ckDone = useAppStore((s) => s.ckDone);
  const ckBusy = useAppStore((s) => s.ckBusy);
  const ckError = useAppStore((s) => s.ckError);
  const ckDecline = useAppStore((s) => s.ckDecline);
  const ckEmail = useAppStore((s) => s.ckEmail);
  const ckCard = useAppStore((s) => s.ckCard);
  const ckExp = useAppStore((s) => s.ckExp);
  const ckCvc = useAppStore((s) => s.ckCvc);
  const ckName = useAppStore((s) => s.ckName);

  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);

  const course = dataSource.course(courseId);
  const student = dataSource.student();
  const orderNo = dataSource.nextOrderNo();
  const cohort = course.kind === "cohort";

  /*
   * The fake processor.
   *
   * The comp ran this from a `setTimeout` inside the click handler; hanging it
   * off `ckBusy` instead means navigating away mid-confirmation cancels it
   * rather than resolving onto a screen that is no longer mounted. The decline
   * switch is read when the timer fires, not when it is armed — so the dock can
   * be flipped while the spinner is up, exactly as in the comp.
   */
  useEffect(() => {
    if (!ckBusy) return;

    const id = window.setTimeout(() => {
      const s = useAppStore.getState();
      if (s.ckDecline) {
        s.set({ ckBusy: false, ckError: true });
        s.showToast(t("screensA.checkout.declinedToast"), "x-circle");
        return;
      }
      s.set({ ckBusy: false, ckDone: true });
      window.scrollTo({ top: 0, behavior: "auto" });
      /* The comp asked for "party-popper", which the icon registry does not carry. */
      s.showToast(t("screensA.checkout.enrolledToast", { order: orderNo }), "sparkles");
    }, CONFIRM_MS);

    return () => window.clearTimeout(id);
  }, [ckBusy, orderNo, t]);

  /* --------------------------------------------------------------- done -- */

  if (ckDone) {
    /*
     * The comp hardcoded "Week 3 is open now" while the demo clock is free to
     * sit on any of the eight weeks — corrected to read the clock, so
     * advancing it in the dock keeps this sentence true.
     */
    const doneSub =
      cohort && isCohort(mode)
        ? t("screensA.checkout.doneCohort", {
            week: number(week),
            date: fmtDate(liveDate(week)),
            time: fmtTime(liveDate(week)),
          })
        : t("screensA.checkout.doneSelf");

    return (
      <div className="lp-page scr-checkout">
        <div className="ck-done">
          <span className="ck-done__ico">
            <Icon name="check" size={30} />
          </span>
          <h1 className="ck-done__title">
            {t("screensA.checkout.doneTitle", { name: student.name.split(" ")[0] })}
          </h1>
          <p className="ck-done__sub">{doneSub}</p>
          <p className="ck-done__order lp-mono">
            <Icon name="receipt" size={15} />
            {t("screensA.checkout.orderNo", { order: orderNo })}
          </p>
          <div className="ck-done__acts">
            <ButtonPrimary className="ck-done__cta" onClick={() => go("classroom")}>
              {t("screensA.checkout.startLearning")}
            </ButtonPrimary>
            <ButtonSecondary className="ck-done__cta" onClick={() => go("learning")}>
              {t("screensA.checkout.myLearning")}
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- form -- */

  const lines = [
    { k: t("screensA.checkout.lineCourse"), v: money(course.price) },
    { k: t("screensA.checkout.lineDiscount"), v: money(0) },
    { k: t("screensA.checkout.lineVat"), v: money(0) },
  ];

  const lineSub = cohort
    ? t("screensA.checkout.summaryCohort", { date: fmtDate(weekStart(1)) })
    : t("screensA.checkout.summarySelf");

  return (
    <div className="lp-page scr-checkout">
      <button type="button" className="lp-nav ck-back" onClick={() => go("course")}>
        <Icon name="arrow-left" size={15} />
        {t("screensA.checkout.backToCourse")}
      </button>

      <h1 className="ck-title">{t("screensA.checkout.title", { course: course.title })}</h1>

      <div className="ck-grid">
        <div className="ck-main">
          <Callout tone="info" icon="info">
            {t("screensA.checkout.demoNotice")}
          </Callout>

          <Card className="ck-panel">
            <h2 className="ck-panel__title">{t("screensA.checkout.payment")}</h2>

            <Field label={t("screensA.checkout.email")} htmlFor="ck-email">
              <TextInput
                id="ck-email"
                type="email"
                inputMode="email"
                value={ckEmail}
                onChange={(v) => set({ ckEmail: v })}
                placeholder={t("screensA.checkout.emailPlaceholder")}
              />
            </Field>

            <Field
              label={t("screensA.checkout.cardDetails")}
              hint={
                ckDecline
                  ? t("screensA.checkout.hintDecline")
                  : t("screensA.checkout.hintTestCard")
              }
              error={ckDecline}
            >
              {/* One bordered box holding three inputs — the comp's grouped card field. */}
              <div className="ck-cardbox">
                <div className="ck-cardbox__row">
                  <Icon name="credit-card" size={16} className="ck-cardbox__ico" />
                  <input
                    className="lp-fld ck-cardbox__num"
                    value={ckCard}
                    onChange={(e) => set({ ckCard: e.target.value })}
                    placeholder={TEST_CARD}
                    inputMode="numeric"
                    aria-label={t("screensA.checkout.cardNumber")}
                  />
                  <span className="ck-brand">{CARD_BRAND}</span>
                </div>
                <div className="ck-cardbox__split">
                  <input
                    className="lp-fld ck-cardbox__part"
                    value={ckExp}
                    onChange={(e) => set({ ckExp: e.target.value })}
                    placeholder={t("screensA.checkout.expiryPlaceholder")}
                    inputMode="numeric"
                    aria-label={t("screensA.checkout.expiry")}
                  />
                  <input
                    className="lp-fld ck-cardbox__part"
                    value={ckCvc}
                    onChange={(e) => set({ ckCvc: e.target.value })}
                    placeholder={t("screensA.checkout.cvcPlaceholder")}
                    inputMode="numeric"
                    aria-label={t("screensA.checkout.cvc")}
                  />
                </div>
              </div>
            </Field>

            <Field label={t("screensA.checkout.nameOnCard")} htmlFor="ck-name">
              <TextInput
                id="ck-name"
                value={ckName}
                onChange={(v) => set({ ckName: v })}
                placeholder={student.name}
              />
            </Field>

            {ckError ? (
              <Callout tone="danger" icon="x-circle">
                {t("screensA.checkout.declineMessage")}
              </Callout>
            ) : null}

            <ButtonPrimary
              className="ck-submit"
              disabled={ckBusy}
              onClick={() => set({ ckBusy: true, ckError: false })}
            >
              {ckBusy ? <span className="ck-spin" aria-hidden="true" /> : null}
              {ckBusy
                ? t("screensA.checkout.confirming")
                : t("screensA.checkout.complete", { amount: money(course.price) })}
            </ButtonPrimary>

            <p className="ck-fine">
              <Icon name="lock" size={13} />
              {t("screensA.checkout.fine")}
            </p>
          </Card>
        </div>

        <aside className="ck-aside">
          <Card className="ck-panel ck-summary">
            <h2 className="ck-panel__title">{t("screensA.checkout.orderSummary")}</h2>

            <div className="ck-item">
              <CoverChip tint={course.tint} icon={course.icon} size="md" />
              <div className="ck-item__text">
                <span className="ck-item__title">{course.title}</span>
                <span className="ck-item__sub">{lineSub}</span>
              </div>
            </div>

            <div className="ck-rows">
              {lines.map((r) => (
                <div key={r.k} className="ck-row">
                  <span>{r.k}</span>
                  <span className="lp-mono ck-row__v">{r.v}</span>
                </div>
              ))}
            </div>

            <div className="ck-total">
              <span className="ck-total__k">{t("screensA.checkout.total")}</span>
              <span className="lp-mono ck-total__v">{money(course.price)}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
