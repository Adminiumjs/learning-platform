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
import { useI18n, type MessageKey } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-billing.css";

/** The card on file. Brand and masked digits — nothing to translate. */
const CARD_NUMBER = "Visa ···· 4242";
const CARD_EXPIRY = "04 / 29";

/**
 * The line under a course title.
 *
 * The cohort course names its cohort, a retired one admits it is retired, and
 * everything else is self-paced. Each is a whole sentence rather than a stem
 * plus a tail, so a translator owns the word order.
 */
function enrolmentKey(c: EnrolledCourse): MessageKey {
  if (c.id === "DS-101") return "screensA.billing.lineCohort";
  return c.state === "retired" ? "screensA.billing.lineRetired" : "screensA.billing.lineSelf";
}

export default function Billing() {
  const { t, money } = useI18n();
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const enrolled = dataSource.enrolledByDate();

  return (
    <div className="lp-page scr-billing">
      <PageHead
        className="bl-head"
        title={t("screensA.billing.title")}
        lede={t("screensA.billing.lede")}
        action={
          <ButtonSecondary className="bl-topbtn" onClick={() => go("refund")}>
            {t("screensA.billing.requestRefund")}
          </ButtonSecondary>
        }
      />

      <div className="bl-grid">
        <div className="bl-col">
          <section className="lp-list bl-panel">
            <h2 className="bl-panel__head">{t("screensA.billing.enrolments")}</h2>
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
                  <span className="bl-enrol__sub">
                    {t(enrolmentKey(c), { date: c.date, order: c.order })}
                  </span>
                </span>
                <span className="lp-mono bl-enrol__amount">{money(c.price)}</span>
                {/* The retired course was a free place, so it never had a price. */}
                <Pill tone={c.price ? "pos" : "info"}>
                  {c.price ? t("screensA.billing.paid") : t("screensA.billing.freePlace")}
                </Pill>
              </div>
            ))}
          </section>

          <section className="lp-list bl-panel">
            <h2 className="bl-panel__head">{t("screensA.billing.receipts")}</h2>
            <div className="bl-rcpt bl-rcpt--head">
              <span>{t("screensA.billing.colReceipt")}</span>
              <span className="bl-rcpt__date">{t("screensA.billing.colDate")}</span>
              <span className="bl-rcpt__amount">{t("screensA.billing.colAmount")}</span>
              <span />
            </div>
            {enrolled.map((r) => (
              <div className="lp-row bl-rcpt" key={r.order}>
                <span className="lp-mono bl-rcpt__no">{r.order}</span>
                <span className="bl-rcpt__date">{r.date}</span>
                <span className="lp-mono bl-rcpt__amount">{money(r.price)}</span>
                <span className="bl-rcpt__act">
                  <ButtonSecondary
                    className="bl-pdf"
                    icon="download"
                    iconSize={13}
                    onClick={() =>
                      showToast(t("screensA.billing.receiptDemo", { order: r.order }), "receipt")
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
            <h2 className="bl-card__head">{t("screensA.billing.paymentMethod")}</h2>
            <div className="bl-card__row">
              <span className="bl-card__ico">
                <Icon name="credit-card" size={18} />
              </span>
              <span className="bl-card__text">
                <span className="lp-mono bl-card__no">{CARD_NUMBER}</span>
                <span className="bl-card__exp">
                  {t("screensA.billing.expires", { date: CARD_EXPIRY })}
                </span>
              </span>
            </div>
            <ButtonSecondary
              className="bl-change"
              onClick={() => showToast(t("screensA.billing.cardFixed"), "credit-card")}
            >
              {t("screensA.billing.changeCard")}
            </ButtonSecondary>
          </section>

          <section className="bl-promise">
            <div className="bl-promise__head">
              <Icon name="shield-check" size={16} className="bl-promise__ico" />
              <span className="bl-promise__title">{t("screensA.billing.promiseTitle")}</span>
            </div>
            <p className="bl-promise__body">{t("screensA.billing.promiseBody")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
