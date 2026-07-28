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
import { countdown, fmtDateLong, liveDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-live.css";

/** RSVPs in for this week's critique — in-fiction, like the roster. */
const RSVP_YES = 24;
/** The recording runs short of the hour booked; it always does. */
const RECORDING_MIN = 58;

interface Fact {
  icon: string;
  k: string;
  v: string;
  /** Counts are mono; prose is not. */
  mono?: boolean;
}

export default function Live() {
  const week = useAppStore((s) => s.week);
  const elapsed = useAppStore((s) => s.elapsed);
  const joined = useAppStore((s) => s.lvJoined);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.courses()[0];
  const session = dataSource.liveSession();
  const seats = dataSource.cohortCapacity();
  const instructor = dataSource.instructor();
  const assistant = dataSource.assistant();

  const endHour = session.hour + Math.round(session.durationMin / 60);
  const when = `${fmtDateLong(liveDate(week, session.dayOffset, session.hour))} · ${session.hour}:00–${endHour}:00 ${session.timezone}`;

  const facts: Fact[] = [
    { icon: "calendar", k: "When", v: when },
    { icon: "user-round", k: "Hosted by", v: `${instructor.name}, with ${assistant.name}` },
    { icon: "users", k: "Who is coming", v: `${RSVP_YES} of ${seats} said yes`, mono: true },
    {
      icon: "video",
      k: "Where",
      v: joined ? `Recording · ${RECORDING_MIN} min` : "Link opens 10 minutes before",
    },
  ];

  const calendarFile = `session_wk${week}.ics`;

  return (
    <div className="lp-page scr-live">
      <PageHead
        eyebrow={
          <span className="lv-eyebrow">
            <Icon name="radio" size={15} />
            Week {week} live session
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
          {joined ? "Recording available" : "Starts soon"}
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
            <span className="lv-count__to">until we start</span>
          </div>
        )}

        <div className="lv-actions">
          <ButtonPrimary
            icon={joined ? "play" : "video"}
            onClick={() =>
              showToast(
                joined
                  ? "Demo recording — the player is a shell."
                  : "The room opens 10 minutes before. See you Thursday.",
                "video",
              )
            }
          >
            {joined ? "Watch the recording" : "Join the session"}
          </ButtonPrimary>

          <ButtonSecondary
            icon="calendar-plus"
            onClick={() => showToast(`${calendarFile} — demo file.`, "calendar-plus")}
          >
            Add to calendar
          </ButtonSecondary>
        </div>
      </div>

      <div className="lv-bring">
        <div className="lv-bring__title">What to bring</div>
        <p className="lv-bring__body">
          One specimen page, however rough, and the one decision you can't settle. We'll look at
          six of them together and everyone leaves with a next step.
        </p>
      </div>
    </div>
  );
}
