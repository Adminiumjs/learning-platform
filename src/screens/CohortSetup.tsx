/*
 * Cohort setup — drafting the next intake.
 *
 * Left column edits, right column previews. The preview card is not a mock-up:
 * it reads the same store fields the form writes, so every keystroke on the
 * left lands in "What students will see" on the right — which is the only
 * honest way to show someone what they are about to publish.
 *
 * Publishing is the one consequential action on the page, so it goes through
 * the confirm modal and names the number of people it will email. That number
 * is the waitlist's real length, not a written-down one.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  IconButton,
  Pill,
  Segmented,
  Toggle,
} from "../components";
import type { SegmentOption } from "../components";
import {
  COHORT_NO,
  END_DATE,
  LIVE_DAYS,
  SEATS_MAX,
  SEATS_MIN,
  SEATS_STEP,
  WAITLIST_COUNT,
} from "../data/screens/cohort";
import { dataSource } from "../data/source";
import { useAppStore } from "../state/store";
import "../styles/screen-cohort.css";

const DAY_OPTIONS: SegmentOption<string>[] = LIVE_DAYS.map((d) => ({ id: d, label: d }));

export default function CohortSetup() {
  const csStart = useAppStore((s) => s.csStart);
  const csWeeks = useAppStore((s) => s.csWeeks);
  const csDay = useAppStore((s) => s.csDay);
  const csTime = useAppStore((s) => s.csTime);
  const csTz = useAppStore((s) => s.csTz);
  const csSeats = useAppStore((s) => s.csSeats);
  const csPrice = useAppStore((s) => s.csPrice);
  const csWait = useAppStore((s) => s.csWait);
  const csSavedAt = useAppStore((s) => s.csSavedAt);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const course = dataSource.course("DS-101");

  const preview = [
    { k: "Starts", v: csStart, mono: true },
    { k: "Live", v: `${csDay}s ${csTime} ${csTz}`, mono: false },
    { k: "Seats", v: `${csSeats} · ${csWait ? "waitlist on" : "no waitlist"}`, mono: false },
    { k: "Price", v: csPrice, mono: true },
  ];

  const saveDraft = () => {
    set({ csSavedAt: "Draft saved just now" });
    showToast(`Cohort ${COHORT_NO} draft saved.`, "check");
  };

  const publish = () =>
    openModal({
      title: `Open enrolment for cohort ${COHORT_NO}?`,
      body: `It goes live on the course page and the ${WAITLIST_COUNT} people on the waitlist get an email within the hour.`,
      icon: "megaphone",
      confirmLabel: "Open it",
      onConfirm: () =>
        showToast(
          `Cohort ${COHORT_NO} is open · ${WAITLIST_COUNT} waitlist emails queued.`,
          "megaphone",
        ),
    });

  return (
    <>
      <div className="lp-page scr-cohort">
        <header className="cs-head">
          <div className="cs-head__text">
            <span className="cs-eyebrow">
              <Icon name="calendar-cog" size={15} />
              {course.title}
            </span>
            <h1 className="cs-title">Set up cohort {COHORT_NO}</h1>
          </div>
          <Pill className="cs-state" tone="neutral" icon="pencil" iconSize={14}>
            Draft
          </Pill>
        </header>

        <div className="cs-grid">
          <div className="cs-col">
            <section className="cs-card">
              <h2 className="cs-card__title">Dates</h2>

              <div className="cs-pair">
                <label className="cs-field" htmlFor="cs-start">
                  <span className="cs-field__label">First week starts</span>
                  <input
                    id="cs-start"
                    className="lp-fld lp-mono cs-input"
                    value={csStart}
                    onChange={(e) => set({ csStart: e.target.value })}
                  />
                </label>
                <label className="cs-field" htmlFor="cs-weeks">
                  <span className="cs-field__label">Length</span>
                  <input
                    id="cs-weeks"
                    className="lp-fld lp-mono cs-input"
                    value={csWeeks}
                    onChange={(e) => set({ csWeeks: e.target.value })}
                  />
                </label>
              </div>

              <div className="cs-note">
                <Icon name="calendar-check" size={16} className="cs-note__ico" />
                <span className="cs-note__text">
                  Ends {END_DATE} · {csWeeks} of teaching, one week off in the middle
                </span>
              </div>
            </section>

            <section className="cs-card">
              <h2 className="cs-card__title">Weekly live session</h2>

              <Segmented
                className="cs-days"
                options={DAY_OPTIONS}
                value={csDay}
                onChange={(d) => set({ csDay: d })}
                label="Live session day"
              />

              <div className="cs-pair">
                <label className="cs-field" htmlFor="cs-time">
                  <span className="cs-field__label">Time</span>
                  <input
                    id="cs-time"
                    className="lp-fld lp-mono cs-input"
                    value={csTime}
                    onChange={(e) => set({ csTime: e.target.value })}
                  />
                </label>
                <label className="cs-field" htmlFor="cs-tz">
                  <span className="cs-field__label">Time zone</span>
                  <input
                    id="cs-tz"
                    className="lp-fld cs-input"
                    value={csTz}
                    onChange={(e) => set({ csTz: e.target.value })}
                  />
                </label>
              </div>
            </section>

            <section className="cs-card">
              <h2 className="cs-card__title">Seats and price</h2>

              <div className="cs-seats">
                <IconButton
                  className="cs-seats__step"
                  icon="minus"
                  iconSize={16}
                  label={`Fewer seats (${SEATS_STEP} at a time)`}
                  onClick={() => set({ csSeats: Math.max(SEATS_MIN, csSeats - SEATS_STEP) })}
                />
                <span className="lp-mono cs-seats__n" aria-live="polite">
                  {csSeats}
                </span>
                <IconButton
                  className="cs-seats__step"
                  icon="plus"
                  iconSize={16}
                  label={`More seats (${SEATS_STEP} at a time)`}
                  onClick={() => set({ csSeats: Math.min(SEATS_MAX, csSeats + SEATS_STEP) })}
                />
                <span className="cs-seats__unit">seats</span>

                <label className="cs-field cs-price" htmlFor="cs-price">
                  <span className="cs-field__label">Price</span>
                  <input
                    id="cs-price"
                    className="lp-fld lp-mono cs-input cs-price__field"
                    value={csPrice}
                    onChange={(e) => set({ csPrice: e.target.value })}
                  />
                </label>
              </div>

              <div className="cs-wait">
                <span className="cs-wait__text">
                  <span className="cs-wait__label">Waitlist when it&rsquo;s full</span>
                  <span className="cs-wait__sub">
                    People can still sign up; you invite them by hand.
                  </span>
                </span>
                <Toggle
                  checked={csWait}
                  onChange={(next) => set({ csWait: next })}
                  label="Waitlist when it's full"
                  hideLabel
                />
              </div>
            </section>
          </div>

          <div className="cs-col">
            <section className="cs-preview">
              <h2 className="cs-preview__eyebrow">What students will see</h2>
              <p className="cs-preview__title">
                Cohort {COHORT_NO} · {csWeeks}
              </p>
              {preview.map((p) => (
                <div key={p.k} className="cs-preview__row">
                  <span className="cs-preview__k">{p.k}</span>
                  <span className={`cs-preview__v${p.mono ? " lp-mono" : ""}`}>{p.v}</span>
                </div>
              ))}
            </section>

            <section className="cs-card cs-waitcard">
              <div className="cs-waitcard__head">
                <Icon name="users-round" size={16} className="cs-waitcard__ico" />
                <h2 className="cs-waitcard__title">Waitlist so far</h2>
              </div>
              <span className="lp-mono cs-waitcard__n">{WAITLIST_COUNT} people</span>
              <ButtonSecondary className="cs-waitcard__go" onClick={() => go("waitlist")}>
                Open the waitlist
              </ButtonSecondary>
            </section>
          </div>
        </div>
      </div>

      <div className="cs-bar">
        <div className="cs-bar__inner">
          <span className="cs-bar__at">{csSavedAt || "Draft · not visible to anyone yet"}</span>
          <ButtonSecondary className="cs-bar__draft" onClick={saveDraft}>
            Save draft
          </ButtonSecondary>
          <ButtonPrimary onClick={publish}>Open enrolment</ButtonPrimary>
        </div>
      </div>
    </>
  );
}
