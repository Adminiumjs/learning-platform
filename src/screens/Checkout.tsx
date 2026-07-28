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
import { fmtDate, isCohort, liveDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-checkout.css";

/** How long the fake processor "thinks" before it approves or declines. */
const CONFIRM_MS = 1100;

const DECLINE_MSG =
  "Your card was declined. Try another card — or flip the switch in the demo dock.";

const money = (n: number): string => `$${n}`;

export default function Checkout() {
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
        s.showToast("Card declined — this is the demo switch.", "x-circle");
        return;
      }
      s.set({ ckBusy: false, ckDone: true });
      window.scrollTo({ top: 0, behavior: "auto" });
      /* The comp asked for "party-popper", which the icon registry does not carry. */
      s.showToast(`Enrolled. Order ${orderNo} is on its way to your inbox.`, "sparkles");
    }, CONFIRM_MS);

    return () => window.clearTimeout(id);
  }, [ckBusy, orderNo]);

  /* --------------------------------------------------------------- done -- */

  if (ckDone) {
    /*
     * The comp hardcoded "Week 3 is open now" while the demo clock is free to
     * sit on any of the eight weeks — corrected to read the clock, so
     * advancing it in the dock keeps this sentence true.
     */
    const doneSub =
      cohort && isCohort(mode)
        ? `You have a seat in cohort 03. Week ${week} is open now, and the next live critique is ${fmtDate(liveDate(week))} at 18:00.`
        : "Every lesson is unlocked. Take it at whatever pace suits your week.";

    return (
      <div className="lp-page scr-checkout">
        <div className="ck-done">
          <span className="ck-done__ico">
            <Icon name="check" size={30} />
          </span>
          <h1 className="ck-done__title">You're in, {student.name.split(" ")[0]}.</h1>
          <p className="ck-done__sub">{doneSub}</p>
          <p className="ck-done__order lp-mono">
            <Icon name="receipt" size={15} />
            Order {orderNo}
          </p>
          <div className="ck-done__acts">
            <ButtonPrimary className="ck-done__cta" onClick={() => go("classroom")}>
              Start learning
            </ButtonPrimary>
            <ButtonSecondary className="ck-done__cta" onClick={() => go("learning")}>
              My learning
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- form -- */

  const lines = [
    { k: "Course", v: money(course.price) },
    { k: "Student discount", v: "$0" },
    { k: "VAT (demo)", v: "$0" },
  ];

  const lineSub = cohort
    ? `Cohort 03 · starts ${fmtDate(weekStart(1))}`
    : "Self-paced · lifetime access";

  return (
    <div className="lp-page scr-checkout">
      <button type="button" className="lp-nav ck-back" onClick={() => go("course")}>
        <Icon name="arrow-left" size={15} />
        Back to course
      </button>

      <h1 className="ck-title">Enrol in {course.title}</h1>

      <div className="ck-grid">
        <div className="ck-main">
          <Callout tone="info" icon="info">
            This is a demo. No real card is charged.
          </Callout>

          <Card className="ck-panel">
            <h2 className="ck-panel__title">Payment</h2>

            <Field label="Email" htmlFor="ck-email">
              <TextInput
                id="ck-email"
                type="email"
                inputMode="email"
                value={ckEmail}
                onChange={(v) => set({ ckEmail: v })}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Card details"
              hint={
                ckDecline
                  ? "Demo card set to decline. Flip it in the dock above."
                  : "Test card only. Nothing leaves this page."
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
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    aria-label="Card number"
                  />
                  <span className="ck-brand">VISA</span>
                </div>
                <div className="ck-cardbox__split">
                  <input
                    className="lp-fld ck-cardbox__part"
                    value={ckExp}
                    onChange={(e) => set({ ckExp: e.target.value })}
                    placeholder="MM / YY"
                    inputMode="numeric"
                    aria-label="Expiry date"
                  />
                  <input
                    className="lp-fld ck-cardbox__part"
                    value={ckCvc}
                    onChange={(e) => set({ ckCvc: e.target.value })}
                    placeholder="CVC"
                    inputMode="numeric"
                    aria-label="Security code"
                  />
                </div>
              </div>
            </Field>

            <Field label="Name on card" htmlFor="ck-name">
              <TextInput
                id="ck-name"
                value={ckName}
                onChange={(v) => set({ ckName: v })}
                placeholder={student.name}
              />
            </Field>

            {ckError ? (
              <Callout tone="danger" icon="x-circle">
                {DECLINE_MSG}
              </Callout>
            ) : null}

            <ButtonPrimary
              className="ck-submit"
              disabled={ckBusy}
              onClick={() => set({ ckBusy: true, ckError: false })}
            >
              {ckBusy ? <span className="ck-spin" aria-hidden="true" /> : null}
              {ckBusy ? "Confirming…" : `Complete enrollment · ${money(course.price)}`}
            </ButtonPrimary>

            <p className="ck-fine">
              <Icon name="lock" size={13} />
              Payments handled by our processor. Cancel within 14 days.
            </p>
          </Card>
        </div>

        <aside className="ck-aside">
          <Card className="ck-panel ck-summary">
            <h2 className="ck-panel__title">Order summary</h2>

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
              <span className="ck-total__k">Total</span>
              <span className="lp-mono ck-total__v">{money(course.price)}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
