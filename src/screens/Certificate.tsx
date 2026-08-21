/*
 * Certificate — the student's completion sheet.
 *
 * The screen has exactly two states and the point is that you can reach both:
 * until every lesson is ticked *and* the exam has been sat, the sheet renders
 * behind a frosted lock panel that names what is still missing. "Finish
 * everything" in the demo dock flips it.
 *
 * The sheet is rendered, not an image — same reason the covers are gradients
 * (spec 20 D9). Nothing here downloads.
 */

import { ButtonPrimary, ButtonSecondary, Icon, PageHead, Pill } from "../components";
import { dataSource } from "../data/source";
import { useI18n, type MessageKey } from "../i18n";
import { demoNow, doneCount, fmtDateLong } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-certificate.css";

/** In-fiction identifiers — printed on the sheet and inside the verify link. */
const CERT_ID = "YA-CERT-2041-DS";
const VERIFY_URL = "adminium.dev/verify/YA-CERT-2041-DS";

/** The academy and the course are in-fiction names, so they stay as written. */
const BRAND = "Yara's Academy";
const COURSE_TITLE = "Design Systems from Scratch";
const INSTRUCTOR_NAME = "Yara Haddad";

interface CertifiedRow {
  icon: string;
  k: MessageKey;
  v: string;
  /** Mono figure by default; the exam row is a toned word instead. */
  tone?: "pos" | "subtle";
}

export default function Certificate() {
  const { t, number } = useI18n();
  const done = useAppStore((s) => s.done);
  const exSubmitted = useAppStore((s) => s.exSubmitted);
  const asState = useAppStore((s) => s.asState);
  const prName = useAppStore((s) => s.prName);
  const week = useAppStore((s) => s.week);
  const showToast = useAppStore((s) => s.showToast);

  const total = dataSource.totalLessons();
  const lessons = doneCount(done);
  const complete = lessons >= total && exSubmitted;

  const ofTotal = (n: number, max: number) =>
    t("screensA.certificate.ofTotal", { done: number(n), total: number(max) });

  const rows: CertifiedRow[] = [
    { icon: "list-checks", k: "screensA.certificate.rowLessons", v: ofTotal(lessons, total) },
    {
      icon: "pen-line",
      k: "screensA.certificate.rowAssignments",
      v: asState === "graded" ? ofTotal(2, 4) : ofTotal(1, 4),
    },
    {
      icon: "file-check",
      k: "screensA.certificate.rowExam",
      v: exSubmitted
        ? t("screensA.certificate.examPassed")
        : t("screensA.certificate.examNotSat"),
      tone: exSubmitted ? "pos" : "subtle",
    },
    {
      icon: "clock",
      k: "screensA.certificate.rowTime",
      v: t("screensA.certificate.timeOnCourse"),
    },
  ];

  return (
    <div className="lp-page scr-certificate">
      <PageHead
        className="ce-head"
        title={t("screensA.certificate.title")}
        lede={
          complete
            ? t("screensA.certificate.ledeAwarded", { course: COURSE_TITLE })
            : t("screensA.certificate.ledeLocked")
        }
        action={
          <Pill tone={complete ? "pos" : "neutral"} icon={complete ? "badge-check" : "lock"}>
            {complete
              ? t("screensA.certificate.awarded")
              : t("screensA.certificate.notYetEarned")}
          </Pill>
        }
      />

      <div className="ce-frame">
        <div className="ce-sheet">
          <div className="ce-sheet__head">
            <span className="ce-sheet__mark">Y</span>
            <span className="ce-sheet__brand">{BRAND}</span>
            <span className="lp-mono ce-sheet__id">{CERT_ID}</span>
          </div>

          <div className="ce-sheet__body">
            <span className="ce-sheet__eyebrow">{t("screensA.certificate.ofCompletion")}</span>
            <span className="ce-sheet__line">{t("screensA.certificate.confirmThat")}</span>
            <span className="ce-sheet__name">{prName}</span>
            <span className="ce-sheet__line">{t("screensA.certificate.completedCourse")}</span>
            <span className="ce-sheet__course">{COURSE_TITLE}</span>
            <span className="ce-sheet__line ce-sheet__line--wrap">
              {t("screensA.certificate.sheetDetail")}
            </span>
          </div>

          <div className="ce-sign">
            <div className="ce-sign__col">
              <div className="lp-mono ce-sign__value">{INSTRUCTOR_NAME}</div>
              <div className="ce-sign__label">{t("screensA.certificate.instructor")}</div>
            </div>
            <div className="ce-sign__col">
              {/* The comp printed fmt(now()) + " 2026". The cohort runs in 2026,
                  so the long formatter says the same thing without the splice. */}
              <div className="lp-mono ce-sign__value">
                {complete ? fmtDateLong(demoNow(week)) : "—"}
              </div>
              <div className="ce-sign__label">{t("screensA.certificate.awardedOn")}</div>
            </div>
          </div>
        </div>

        {complete ? null : (
          <div className="ce-lock">
            <div className="ce-lock__panel">
              <span className="ce-lock__ico">
                <Icon name="lock" size={21} />
              </span>
              <span className="ce-lock__title">{t("screensA.certificate.notYetTitle")}</span>
              <span className="ce-lock__body">
                {exSubmitted
                  ? t("screensA.certificate.lockBody", {
                      done: number(lessons),
                      total: number(total),
                    })
                  : t("screensA.certificate.lockBodyExam", {
                      done: number(lessons),
                      total: number(total),
                    })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="ce-actions">
        <ButtonPrimary
          icon="download"
          className={complete ? "" : "ce-dl--off"}
          onClick={() =>
            showToast(
              complete
                ? t("screensA.certificate.downloadDemo")
                : t("screensA.certificate.finishFirst"),
              complete ? "download" : "lock",
            )
          }
        >
          {t("screensA.certificate.downloadPdf")}
        </ButtonPrimary>
        <ButtonSecondary
          icon="linkedin"
          onClick={() => showToast(t("screensA.certificate.noPostMade"), "linkedin")}
        >
          {t("screensA.certificate.addToLinkedIn")}
        </ButtonSecondary>
        <ButtonSecondary
          icon="link"
          iconSize={15}
          className="lp-mono ce-verify"
          onClick={() => showToast(t("screensA.certificate.linkCopied"), "link")}
        >
          {VERIFY_URL}
        </ButtonSecondary>
      </div>

      <div className="lp-list ce-rows">
        <div className="ce-rows__head">{t("screensA.certificate.whatItCertifies")}</div>
        {rows.map((r) => (
          <div className="lp-list__row ce-row" key={r.k}>
            <Icon name={r.icon} size={16} className="ce-row__ico" />
            <span className="ce-row__k">{t(r.k)}</span>
            <span className={r.tone ? `ce-row__v ce-row__v--${r.tone}` : "lp-mono ce-row__v"}>
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
