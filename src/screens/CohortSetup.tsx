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
import { useI18n } from "../i18n";
import { fmtDateLong, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-cohort.css";

const DAY_OPTIONS: SegmentOption<string>[] = LIVE_DAYS.map((d) => ({ id: d, label: d }));

/** The Monday cohort 04 opens on — week 8 of the demo clock. */
const CS_START_ON = weekStart(8);
/** Teaching runs eight weeks, and the live session defaults to Thursday. */
const CS_WEEKS = 8;
const CS_THURSDAY = 3;
/** What a seat costs, as a number — the currency format is the reader's. */
const CS_PRICE = 180;

export default function CohortSetup() {
  const { t, number, money } = useI18n();
  const csStartRaw = useAppStore((s) => s.csStart);
  const csWeeksRaw = useAppStore((s) => s.csWeeks);
  const csDayRaw = useAppStore((s) => s.csDay);
  const csTime = useAppStore((s) => s.csTime);
  const csTz = useAppStore((s) => s.csTz);
  const csSeats = useAppStore((s) => s.csSeats);
  const csPriceRaw = useAppStore((s) => s.csPrice);
  const csWait = useAppStore((s) => s.csWait);
  const csSavedAt = useAppStore((s) => s.csSavedAt);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const course = dataSource.course("DS-101");

  /*
   * `null` means the teacher has not touched the field, so it shows the seeded
   * value in the reader's own language, digits and currency. Once they type,
   * their string wins verbatim — including an empty one, which is why this is
   * `??` and not `||`.
   */
  const csStart = csStartRaw ?? fmtDateLong(CS_START_ON);
  const csWeeks = csWeeksRaw ?? t("data.compare.weeks", { count: number(CS_WEEKS) }, CS_WEEKS);
  const csDay = csDayRaw ?? LIVE_DAYS[CS_THURSDAY];
  const csPrice = csPriceRaw ?? money(CS_PRICE);

  const preview = [
    { k: t("screensA.cohortSetup.previewStarts"), v: csStart, mono: true },
    {
      k: t("screensA.cohortSetup.previewLive"),
      v: t("screensA.cohortSetup.liveValue", { day: csDay, time: csTime, tz: csTz }),
      mono: false,
    },
    {
      k: t("screensA.cohortSetup.previewSeats"),
      v: csWait
        ? t("screensA.cohortSetup.seatsWaitlistOn", { seats: number(csSeats) })
        : t("screensA.cohortSetup.seatsWaitlistOff", { seats: number(csSeats) }),
      mono: false,
    },
    { k: t("screensA.cohortSetup.previewPrice"), v: csPrice, mono: true },
  ];

  const saveDraft = () => {
    set({ csSavedAt: t("screensA.cohortSetup.draftSavedNow") });
    showToast(t("screensA.cohortSetup.draftSavedToast", { no: COHORT_NO }), "check");
  };

  const publish = () =>
    openModal({
      title: t("screensA.cohortSetup.publishTitle", { no: COHORT_NO }),
      body: t(
        "screensA.cohortSetup.publishBody",
        { count: number(WAITLIST_COUNT) },
        WAITLIST_COUNT,
      ),
      icon: "megaphone",
      confirmLabel: t("screensA.cohortSetup.publishConfirm"),
      onConfirm: () =>
        showToast(
          t(
            "screensA.cohortSetup.publishedToast",
            { no: COHORT_NO, count: number(WAITLIST_COUNT) },
            WAITLIST_COUNT,
          ),
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
            <h1 className="cs-title">{t("screensA.cohortSetup.title", { no: COHORT_NO })}</h1>
          </div>
          <Pill className="cs-state" tone="neutral" icon="pencil" iconSize={14}>
            {t("screensA.cohortSetup.draft")}
          </Pill>
        </header>

        <div className="cs-grid">
          <div className="cs-col">
            <section className="cs-card">
              <h2 className="cs-card__title">{t("screensA.cohortSetup.dates")}</h2>

              <div className="cs-pair">
                <label className="cs-field" htmlFor="cs-start">
                  <span className="cs-field__label">
                    {t("screensA.cohortSetup.firstWeekStarts")}
                  </span>
                  <input
                    id="cs-start"
                    className="lp-fld lp-mono cs-input"
                    value={csStart}
                    onChange={(e) => set({ csStart: e.target.value })}
                  />
                </label>
                <label className="cs-field" htmlFor="cs-weeks">
                  <span className="cs-field__label">{t("screensA.cohortSetup.length")}</span>
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
                  {t("screensA.cohortSetup.endsNote", { date: END_DATE, weeks: csWeeks })}
                </span>
              </div>
            </section>

            <section className="cs-card">
              <h2 className="cs-card__title">{t("screensA.cohortSetup.weeklyLive")}</h2>

              <Segmented
                className="cs-days"
                options={DAY_OPTIONS}
                value={csDay}
                onChange={(d) => set({ csDay: d })}
                label={t("screensA.cohortSetup.liveDayLabel")}
              />

              <div className="cs-pair">
                <label className="cs-field" htmlFor="cs-time">
                  <span className="cs-field__label">{t("screensA.cohortSetup.time")}</span>
                  <input
                    id="cs-time"
                    className="lp-fld lp-mono cs-input"
                    value={csTime}
                    onChange={(e) => set({ csTime: e.target.value })}
                  />
                </label>
                <label className="cs-field" htmlFor="cs-tz">
                  <span className="cs-field__label">{t("screensA.cohortSetup.timezone")}</span>
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
              <h2 className="cs-card__title">{t("screensA.cohortSetup.seatsAndPrice")}</h2>

              <div className="cs-seats">
                <IconButton
                  className="cs-seats__step"
                  icon="minus"
                  iconSize={16}
                  label={t("screensA.cohortSetup.fewerSeats", { step: number(SEATS_STEP) })}
                  onClick={() => set({ csSeats: Math.max(SEATS_MIN, csSeats - SEATS_STEP) })}
                />
                <span className="lp-mono cs-seats__n" aria-live="polite">
                  {number(csSeats)}
                </span>
                <IconButton
                  className="cs-seats__step"
                  icon="plus"
                  iconSize={16}
                  label={t("screensA.cohortSetup.moreSeats", { step: number(SEATS_STEP) })}
                  onClick={() => set({ csSeats: Math.min(SEATS_MAX, csSeats + SEATS_STEP) })}
                />
                <span className="cs-seats__unit">{t("screensA.cohortSetup.seatsUnit")}</span>

                <label className="cs-field cs-price" htmlFor="cs-price">
                  <span className="cs-field__label">{t("screensA.cohortSetup.price")}</span>
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
                  <span className="cs-wait__label">
                    {t("screensA.cohortSetup.waitlistWhenFull")}
                  </span>
                  <span className="cs-wait__sub">{t("screensA.cohortSetup.waitlistSub")}</span>
                </span>
                <Toggle
                  checked={csWait}
                  onChange={(next) => set({ csWait: next })}
                  label={t("screensA.cohortSetup.waitlistWhenFull")}
                  hideLabel
                />
              </div>
            </section>
          </div>

          <div className="cs-col">
            <section className="cs-preview">
              <h2 className="cs-preview__eyebrow">
                {t("screensA.cohortSetup.whatStudentsSee")}
              </h2>
              <p className="cs-preview__title">
                {t("screensA.cohortSetup.previewHeading", { no: COHORT_NO, weeks: csWeeks })}
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
                <h2 className="cs-waitcard__title">
                  {t("screensA.cohortSetup.waitlistSoFar")}
                </h2>
              </div>
              <span className="lp-mono cs-waitcard__n">
                {t(
                  "screensA.cohortSetup.waitlistPeople",
                  { count: number(WAITLIST_COUNT) },
                  WAITLIST_COUNT,
                )}
              </span>
              <ButtonSecondary className="cs-waitcard__go" onClick={() => go("waitlist")}>
                {t("screensA.cohortSetup.openWaitlist")}
              </ButtonSecondary>
            </section>
          </div>
        </div>
      </div>

      <div className="cs-bar">
        <div className="cs-bar__inner">
          <span className="cs-bar__at">
            {csSavedAt || t("screensA.cohortSetup.notVisibleYet")}
          </span>
          <ButtonSecondary className="cs-bar__draft" onClick={saveDraft}>
            {t("screensA.cohortSetup.saveDraft")}
          </ButtonSecondary>
          <ButtonPrimary onClick={publish}>
            {t("screensA.cohortSetup.openEnrolment")}
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
}
