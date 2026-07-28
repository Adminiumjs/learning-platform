/*
 * Organisation account — the studio's side of the money.
 *
 * The seat count is shared with the Team seats screen (`tsSeats`), so the plan
 * card and the monthly total move the moment someone adds a seat next door.
 * The invoice history behind it is fixed: it is what has already been charged.
 */

import { ButtonSecondary, Icon, PageHead, Pill, ProgressBar } from "../components";
import {
  SEAT_MONTHLY,
  TEAM_DETAILS,
  TEAM_INVOICES,
  TEAM_SPEND,
} from "../data/screens/teambilling";
import { fmtDateLong } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-teambilling.css";

/** The next renewal — 1 August 2026, the month after the newest invoice. */
const RENEWS_ON = new Date(2026, 7, 1);

export default function TeamBilling() {
  const tsSeats = useAppStore((s) => s.tsSeats);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div className="lp-page scr-teambilling">
      <PageHead
        className="tb-head"
        title="Organisation billing"
        lede="Marchetti Studio · billed monthly, invoiced in euros."
        action={
          <ButtonSecondary className="tb-topbtn" onClick={() => go("seats")}>
            Manage seats
          </ButtonSecondary>
        }
      />

      <div className="tb-grid">
        <div className="tb-col">
          <section className="tb-plan">
            <div className="tb-plan__text">
              <div className="tb-plan__eyebrow">Current plan</div>
              <div className="tb-plan__name">Studio · {tsSeats} seats</div>
              <div className="tb-plan__renews">
                Renews {fmtDateLong(RENEWS_ON)} · cancel any time
              </div>
            </div>
            <div className="tb-plan__price">
              <div className="lp-mono tb-plan__amount">${tsSeats * SEAT_MONTHLY}</div>
              <div className="tb-plan__per">per month</div>
            </div>
          </section>

          <section className="lp-list tb-panel">
            <h2 className="tb-panel__head">Invoices</h2>
            <div className="tb-inv tb-inv--head">
              <span>Invoice</span>
              <span className="tb-cell-date">Date</span>
              <span className="tb-inv__amount">Amount</span>
              <span className="tb-inv__status">Status</span>
            </div>
            {TEAM_INVOICES.map((i) => (
              <button
                type="button"
                className="lp-row tb-inv"
                key={i.no}
                onClick={() => showToast(`${i.no} — demo invoice, nothing downloads.`, "receipt")}
              >
                <span className="lp-mono tb-inv__no">{i.no}</span>
                <span className="tb-cell-date">{i.date}</span>
                <span className="lp-mono tb-inv__amount">{i.amount}</span>
                <span className="tb-inv__status">
                  <Pill tone="pos">{i.status}</Pill>
                </span>
              </button>
            ))}
          </section>
        </div>

        <div className="tb-col">
          <section className="lp-cardbox tb-spend">
            <h2 className="tb-spend__head">Spend by course</h2>
            {TEAM_SPEND.map((s) => (
              <div className="tb-spend__line" key={s.label}>
                <div className="tb-spend__row">
                  <span className="tb-spend__label">{s.label}</span>
                  <span className="lp-mono tb-spend__value">{s.value}</span>
                </div>
                <ProgressBar pct={s.pct} className="tb-spend__bar" label={`${s.label} spend`} />
              </div>
            ))}
          </section>

          <section className="lp-list tb-details">
            {TEAM_DETAILS.map((d) => (
              <div className="tb-detail" key={d.k}>
                <Icon name={d.icon} size={16} className="tb-detail__ico" />
                <span className="tb-detail__k">{d.k}</span>
                <span className={`tb-detail__v${d.mono ? " lp-mono tb-detail__v--mono" : ""}`}>
                  {d.v}
                </span>
              </div>
            ))}
            <button
              type="button"
              className="lp-row tb-edit"
              onClick={() => showToast("Demo — billing details are fixed here.", "pencil")}
            >
              Edit billing details
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
