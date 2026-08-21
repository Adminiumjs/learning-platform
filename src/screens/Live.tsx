/*
 * Live session — the week's scheduled critique.
 *
 * One column: the session's cover, a fact card, and what to bring. Everything
 * dated reads the demo clock (spec 20 D6), so advancing the week in the dock
 * moves the date and the countdown together.
 *
 * The screen has two states, before and after. `lvJoined` is the switch, and
 * the dock — not this screen — flips it ("Jump to after the session"), which
 * is why nothing here writes it: joining a room that does not exist would be
 * a lie, and the recording state still has to be reachable.
 */

import { ButtonPrimary, ButtonSecondary, Cover, Icon, PageHead, Pill } from "../components";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { addMinutes, countdown, fmtDateLong, fmtTime, fmtWeekdayLong, liveDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-live.css";

/** RSVPs in for this week's critique — in-fiction, like the roster. */
const RSVP_YES = 24;
/** The recording runs short of the hour booked; it always does. */
const RECORDING_MIN = 58;
/** How long before the hour the room unlocks. */
const DOORS_OPEN_MIN = 10;

interface Fact {
  icon: string;
  k: string;
  v: string;
  /** Counts are mono; prose is not. */
  mono?: boolean;
}

export default function Live() {
  const { t, number } = useI18n();
  const week = useAppStore((s) => s.week);
  const elapsed = useAppStore((s) => s.elapsed);
  const joined = useAppStore((s) => s.lvJoined);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.courses()[0];
  const session = dataSource.liveSession();
  const seats = dataSource.cohortCapacity();
  const instructor = dataSource.instructor();
  const assistant = dataSource.assistant();

  /* Both ends are real instants, so the reader's own clock decides 18:00 vs
     6:00 PM rather than this file interpolating `${session.hour}:00`. */
  const start = liveDate(week, session.dayOffset, session.hour);
  const when = t("screensB.live.when", {
    date: fmtDateLong(start),
    start: fmtTime(start),
    end: fmtTime(addMinutes(start, session.durationMin)),
    tz: session.timezone,
  });

  /** "10 minutes" in the reader's language, not a hardcoded English clause. */
  const doorsOpen = number(DOORS_OPEN_MIN, {
    style: "unit",
    unit: "minute",
    unitDisplay: "long",
  });

  const facts: Fact[] = [
    { icon: "calendar", k: t("screensB.live.factWhen"), v: when },
    {
      icon: "user-round",
      k: t("screensB.live.factHost"),
      v: t("screensB.live.hostValue", {
        instructor: instructor.name,
        assistant: assistant.name,
      }),
    },
    {
      icon: "users",
      k: t("screensB.live.factWho"),
      v: t("screensB.live.whoValue", { yes: number(RSVP_YES), total: number(seats) }),
      mono: true,
    },
    {
      icon: "video",
      k: t("screensB.live.factWhere"),
      v: joined
        ? t("screensB.live.whereRecording", {
            length: number(RECORDING_MIN, {
              style: "unit",
              unit: "minute",
              unitDisplay: "short",
            }),
          })
        : t("screensB.live.whereBefore", { lead: doorsOpen }),
    },
  ];

  const calendarFile = `session_wk${week}.ics`;

  return (
    <div className="lp-page scr-live">
      <PageHead
        eyebrow={
          <span className="lv-eyebrow">
            <Icon name="radio" size={15} />
            {t("screensB.live.eyebrow", { week: number(week) })}
          </span>
        }
        title={session.title}
      />

      {/* The comp's "past" glyph is `play-circle`, which the icon registry does
          not carry; `play` reads the same at 72px. */}
      <Cover
        tint={course.tint}
        icon={joined ? "play" : "radio"}
        iconSize={72}
        angle="150deg"
        filename={joined ? `recording_wk${week}.mp4` : calendarFile}
        className="lv-cover"
      >
        <Pill tone={joined ? "info" : "pos"} className="lv-state">
          {joined ? t("screensB.live.stateRecorded") : t("screensB.live.stateSoon")}
        </Pill>
      </Cover>

      <div className="lv-card">
        {facts.map((f) => (
          <div key={f.k} className="lv-fact">
            <Icon name={f.icon} size={16} className="lv-fact__ico" />
            <span className="lv-fact__k">{f.k}</span>
            <span className={`lv-fact__v${f.mono ? " lp-mono" : ""}`}>{f.v}</span>
          </div>
        ))}

        {joined ? null : (
          <div className="lv-count">
            <Icon name="timer" size={18} className="lv-count__ico" />
            <span className="lv-count__clock lp-mono">{countdown(week, elapsed)}</span>
            <span className="lv-count__to">{t("screensB.live.untilStart")}</span>
          </div>
        )}

        <div className="lv-actions">
          <ButtonPrimary
            icon={joined ? "play" : "video"}
            onClick={() =>
              showToast(
                joined
                  ? t("screensB.live.toastRecording")
                  : t("screensB.live.toastDoors", {
                      lead: doorsOpen,
                      weekday: fmtWeekdayLong(start),
                    }),
                "video",
              )
            }
          >
            {joined ? t("screensB.live.watchRecording") : t("screensB.live.join")}
          </ButtonPrimary>

          <ButtonSecondary
            icon="calendar-plus"
            onClick={() =>
              showToast(t("screensB.live.toastCalendar", { file: calendarFile }), "calendar-plus")
            }
          >
            {t("screensB.live.addToCalendar")}
          </ButtonSecondary>
        </div>
      </div>

      <div className="lv-bring">
        <div className="lv-bring__title">{t("screensB.live.bringTitle")}</div>
        <p className="lv-bring__body">{t("screensB.live.bringBody")}</p>
      </div>
    </div>
  );
}
