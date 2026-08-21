/*
 * Payouts — what the school owes the instructor, and where it goes.
 *
 * Nothing on this page moves money: "Pay out now" opens the confirm modal and
 * the confirm hands back a toast that says so. That is deliberate — a demo
 * that pretends to bank is worse than one that admits it cannot.
 *
 * The history table hides its Method column below 720px rather than squeezing
 * it: every row says "SEPA ···· 4471" anyway, and the payout method has its own
 * card underneath. The comp did the same thing by collapsing the column to 0px,
 * which left its gap behind; here the cell is simply not laid out.
 */

import { ButtonPrimary, ButtonSecondary, Icon, Pill, ProgressBar } from "../components";
import {
  AVAILABLE,
  COURSE_EARNINGS,
  HISTORY,
  METHOD,
  NEXT_PAYOUT,
  STATS,
} from "../data/screens/payouts";
import { useT } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-payouts.css";

export default function Payouts() {
  const t = useT();
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const withdraw = () =>
    openModal({
      title: t("screensB.payouts.confirmTitle", { amount: AVAILABLE }),
      body: t("screensB.payouts.confirmBody", { account: METHOD.detail }),
      icon: "banknote",
      confirmLabel: t("screensB.payouts.confirmCta"),
      onConfirm: () =>
        showToast(t("screensB.payouts.requested", { amount: AVAILABLE }), "banknote"),
    });

  return (
    <div className="lp-page scr-payouts">
      <header className="py-head">
        <h1 className="py-title">{t("screensB.payouts.title")}</h1>
        <p className="py-lede">{t("screensB.payouts.lede")}</p>
      </header>

      <div className="py-top">
        <section className="py-avail">
          <span className="py-avail__label">{t("screensB.payouts.available")}</span>
          <span className="lp-mono py-avail__value">{AVAILABLE}</span>
          <span className="py-avail__next">
            {t("screensB.payouts.nextAuto", { date: NEXT_PAYOUT })}
          </span>
          <ButtonPrimary className="py-avail__btn" onClick={withdraw}>
            {t("screensB.payouts.payOutNow")}
          </ButtonPrimary>
        </section>

        <div className="py-stats">
          {STATS.map((s) => (
            <div key={s.label} className="py-stat">
              <span className="lp-mono py-stat__value">{s.value}</span>
              <span className="py-stat__label">{s.label}</span>
              <span className={`py-stat__delta${s.positive ? " py-stat__delta--pos" : ""}`}>
                {s.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="py-grid">
        <section className="py-history">
          <h2 className="py-history__title">{t("screensB.payouts.historyTitle")}</h2>

          <div className="py-cols py-cols--head">
            <span>{t("screensB.payouts.colDate")}</span>
            <span className="py-col--method">{t("screensB.payouts.colMethod")}</span>
            <span className="py-col--end">{t("screensB.payouts.colAmount")}</span>
            <span className="py-col--end">{t("screensB.payouts.colStatus")}</span>
          </div>

          {HISTORY.map((r) => (
            <div key={r.date} className="lp-row py-cols py-cols--row">
              <span className="lp-mono py-date">{r.date}</span>
              <span className="py-col--method py-method">{r.method}</span>
              <span className="lp-mono py-amount">{r.amount}</span>
              <span className="py-statuscell">
                <Pill tone={r.status === "Paid" ? "pos" : "warn"}>{r.status}</Pill>
              </span>
            </div>
          ))}
        </section>

        <div className="py-side">
          <section className="py-card">
            <h2 className="py-card__title">{t("screensB.payouts.earningsTitle")}</h2>
            {COURSE_EARNINGS.map((c) => (
              <div key={c.title} className="py-course">
                <div className="py-course__top">
                  <span className="py-course__title">{c.title}</span>
                  <span className="lp-mono py-course__amount">{c.amount}</span>
                </div>
                <ProgressBar
                  className="py-course__bar"
                  pct={c.pct}
                  label={t("screensB.payouts.earningsBar", { title: c.title })}
                />
                <span className="lp-mono py-course__sub">{c.sub}</span>
              </div>
            ))}
          </section>

          <section className="py-method-card">
            <span className="py-method-card__ico">
              <Icon name="landmark" size={20} />
            </span>
            <div className="py-method-card__text">
              <p className="py-method-card__label">{METHOD.label}</p>
              <p className="lp-mono py-method-card__detail">{METHOD.detail}</p>
            </div>
            <ButtonSecondary
              className="py-method-card__btn"
              onClick={() => showToast(t("screensB.payouts.methodFixed"), "landmark")}
            >
              {t("screensB.payouts.change")}
            </ButtonSecondary>
          </section>
        </div>
      </div>
    </div>
  );
}
