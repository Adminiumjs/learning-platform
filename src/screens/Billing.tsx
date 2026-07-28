/*
 * Orders and receipts — everything the student has paid Yara, and the paper
 * trail that proves it.
 *
 * The enrolments and the receipts are the same four records read twice: once
 * as "what you bought" and once as "what you were charged". Both come from the
 * `dataSource` seam newest-first, so a customer editing an order in the
 * generated dashboard moves both lists at once and they can never disagree.
 */

import { ButtonSecondary, CoverChip, Icon, PageHead, Pill } from "../components";
import { dataSource } from "../data/source";
import type { EnrolledCourse } from "../data/types";
import { useAppStore } from "../state/store";
import "../styles/screen-billing.css";

/**
 * The line under a course title.
 *
 * The cohort course names its cohort, a retired one admits it is retired, and
 * everything else is self-paced — then all three get the same enrolled/order
 * tail.
 */
function enrolmentLine(c: EnrolledCourse): string {
  const how =
    c.id === "DS-101"
      ? "Cohort 03"
      : c.state === "retired"
        ? "Cohort 01 · retired course"
        : "Self-paced";
  return `${how} · enrolled ${c.date} · order ${c.order}`;
}

export default function Billing() {
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const enrolled = dataSource.enrolledByDate();

  return (
    <div className="lp-page scr-billing">
      <PageHead
        className="bl-head"
        title="Billing"
        lede="Four enrolments since September last year. Receipts stay here forever."
        action={
          <ButtonSecondary className="bl-topbtn" onClick={() => go("refund")}>
            Request a refund
          </ButtonSecondary>
        }
      />

      <div className="bl-grid">
        <div className="bl-col">
          <section className="lp-list bl-panel">
            <h2 className="bl-panel__head">Your enrolments</h2>
            {enrolled.map((c) => (
              <div className="bl-enrol" key={c.id}>
                <CoverChip
                  tint={c.tint}
                  icon={c.icon}
                  size="sm"
                  iconSize={20}
                  className="bl-thumb"
                />
                <span className="bl-enrol__text">
                  <span className="bl-enrol__title">{c.title}</span>
                  <span className="bl-enrol__sub">{enrolmentLine(c)}</span>
                </span>
                <span className="lp-mono bl-enrol__amount">${c.price}</span>
                {/* The retired course was a free place, so it never had a price. */}
                <Pill tone={c.price ? "pos" : "info"}>{c.price ? "Paid" : "Free place"}</Pill>
              </div>
            ))}
          </section>

          <section className="lp-list bl-panel">
            <h2 className="bl-panel__head">Receipts</h2>
            <div className="bl-rcpt bl-rcpt--head">
              <span>Receipt</span>
              <span className="bl-rcpt__date">Date</span>
              <span className="bl-rcpt__amount">Amount</span>
              <span />
            </div>
            {enrolled.map((r) => (
              <div className="lp-row bl-rcpt" key={r.order}>
                <span className="lp-mono bl-rcpt__no">{r.order}</span>
                <span className="bl-rcpt__date">{r.date}</span>
                <span className="lp-mono bl-rcpt__amount">${r.price.toFixed(2)}</span>
                <span className="bl-rcpt__act">
                  <ButtonSecondary
                    className="bl-pdf"
                    icon="download"
                    iconSize={13}
                    onClick={() =>
                      showToast(`${r.order} — demo receipt, nothing downloads.`, "receipt")
                    }
                  >
                    PDF
                  </ButtonSecondary>
                </span>
              </div>
            ))}
          </section>
        </div>

        <div className="bl-col">
          <section className="lp-cardbox bl-card">
            <h2 className="bl-card__head">Payment method</h2>
            <div className="bl-card__row">
              <span className="bl-card__ico">
                <Icon name="credit-card" size={18} />
              </span>
              <span className="bl-card__text">
                <span className="lp-mono bl-card__no">Visa ···· 4242</span>
                <span className="bl-card__exp">Expires 04 / 29</span>
              </span>
            </div>
            <ButtonSecondary
              className="bl-change"
              onClick={() => showToast("Demo — the card is fixed here.", "credit-card")}
            >
              Change card
            </ButtonSecondary>
          </section>

          <section className="bl-promise">
            <div className="bl-promise__head">
              <Icon name="shield-check" size={16} className="bl-promise__ico" />
              <span className="bl-promise__title">14-day promise</span>
            </div>
            <p className="bl-promise__body">
              If a course is not for you, say so within fourteen days and the money comes back. No
              forms, no interrogation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
