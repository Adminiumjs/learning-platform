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
import { demoNow, doneCount, fmtDateLong } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-certificate.css";

/** In-fiction identifiers — printed on the sheet and inside the verify link. */
const CERT_ID = "YA-CERT-2041-DS";
const VERIFY_URL = "adminium.dev/verify/YA-CERT-2041-DS";

interface CertifiedRow {
  icon: string;
  k: string;
  v: string;
  /** Mono figure by default; the exam row is a toned word instead. */
  tone?: "pos" | "subtle";
}

export default function Certificate() {
  const done = useAppStore((s) => s.done);
  const exSubmitted = useAppStore((s) => s.exSubmitted);
  const asState = useAppStore((s) => s.asState);
  const prName = useAppStore((s) => s.prName);
  const week = useAppStore((s) => s.week);
  const showToast = useAppStore((s) => s.showToast);

  const total = dataSource.totalLessons();
  const lessons = doneCount(done);
  const complete = lessons >= total && exSubmitted;

  const rows: CertifiedRow[] = [
    { icon: "list-checks", k: "Lessons completed", v: `${lessons} of ${total}` },
    { icon: "pen-line", k: "Assignments graded", v: asState === "graded" ? "2 of 4" : "1 of 4" },
    {
      icon: "file-check",
      k: "Final exam",
      v: exSubmitted ? "Passed · essay pending" : "Not sat yet",
      tone: exSubmitted ? "pos" : "subtle",
    },
    { icon: "clock", k: "Time on the course", v: "21h 40m" },
  ];

  return (
    <div className="lp-page scr-certificate">
      <PageHead
        className="ce-head"
        title="Certificate"
        lede={
          complete
            ? "Design Systems from Scratch · cohort 03"
            : "Finish the course and this becomes yours."
        }
        action={
          <Pill tone={complete ? "pos" : "neutral"} icon={complete ? "badge-check" : "lock"}>
            {complete ? "Awarded" : "Not yet earned"}
          </Pill>
        }
      />

      <div className="ce-frame">
        <div className="ce-sheet">
          <div className="ce-sheet__head">
            <span className="ce-sheet__mark">Y</span>
            <span className="ce-sheet__brand">Yara's Academy</span>
            <span className="lp-mono ce-sheet__id">{CERT_ID}</span>
          </div>

          <div className="ce-sheet__body">
            <span className="ce-sheet__eyebrow">Certificate of completion</span>
            <span className="ce-sheet__line">This is to confirm that</span>
            <span className="ce-sheet__name">{prName}</span>
            <span className="ce-sheet__line">completed the eight-week course</span>
            <span className="ce-sheet__course">Design Systems from Scratch</span>
            <span className="ce-sheet__line ce-sheet__line--wrap">
              Twenty-two lessons, four assignments and a final exam, across eight weeks of live
              critique.
            </span>
          </div>

          <div className="ce-sign">
            <div className="ce-sign__col">
              <div className="lp-mono ce-sign__value">Yara Haddad</div>
              <div className="ce-sign__label">Instructor</div>
            </div>
            <div className="ce-sign__col">
              {/* The comp printed fmt(now()) + " 2026". The cohort runs in 2026,
                  so the long formatter says the same thing without the splice. */}
              <div className="lp-mono ce-sign__value">
                {complete ? fmtDateLong(demoNow(week)) : "—"}
              </div>
              <div className="ce-sign__label">Awarded</div>
            </div>
          </div>
        </div>

        {complete ? null : (
          <div className="ce-lock">
            <div className="ce-lock__panel">
              <span className="ce-lock__ico">
                <Icon name="lock" size={21} />
              </span>
              <span className="ce-lock__title">Not yet — and that is fine.</span>
              <span className="ce-lock__body">
                {lessons} of {total} lessons done
                {exSubmitted ? "" : ", final exam still to sit"}. Use "Finish everything" in the
                dock to see the awarded state.
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
                ? "Demo certificate — nothing downloads here."
                : "Finish the course first — you are close.",
              complete ? "download" : "lock",
            )
          }
        >
          Download PDF
        </ButtonPrimary>
        <ButtonSecondary
          icon="linkedin"
          onClick={() => showToast("Demo — no post was made.", "linkedin")}
        >
          Add to LinkedIn
        </ButtonSecondary>
        <ButtonSecondary
          icon="link"
          iconSize={15}
          className="lp-mono ce-verify"
          onClick={() => showToast("Verification link copied.", "link")}
        >
          {VERIFY_URL}
        </ButtonSecondary>
      </div>

      <div className="lp-list ce-rows">
        <div className="ce-rows__head">What it certifies</div>
        {rows.map((r) => (
          <div className="lp-list__row ce-row" key={r.k}>
            <Icon name={r.icon} size={16} className="ce-row__ico" />
            <span className="ce-row__k">{r.k}</span>
            <span className={r.tone ? `ce-row__v ce-row__v--${r.tone}` : "lp-mono ce-row__v"}>
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
