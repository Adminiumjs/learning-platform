/*
 * Study rooms — the cohort's own calls, not the instructor's.
 *
 * Three blocks: an optional "you are in a room" bar, the room grid, and the
 * standing weekly sessions. `srIn` holds the room you have joined, `srMuted`
 * your mic, `srRsvp` which standing sessions you have said yes to.
 */

import { Mic, MicOff } from "lucide-react";
import { ButtonPrimary, ButtonSecondary, Icon, Pill } from "../components";
import type { StudyRoom } from "../data/screens/rooms";
import {
  ROOM_ELAPSED_BASE_SEC,
  STANDING_SESSIONS,
  STUDY_ROOMS,
  YOU_FACE,
} from "../data/screens/rooms";
import { hhmmss } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-rooms.css";

/**
 * The room clock.
 *
 * Its own component so only this readout re-renders on a tick — the rest of
 * the screen never selects `elapsed`. The comp built the string as
 * `'00:' + String(34).padStart(2,'0') + ':12'`, i.e. a constant dressed up as
 * a computation, which left a frozen timer next to a pulsing "live" dot.
 */
function RoomTimer() {
  const elapsed = useAppStore((s) => s.elapsed);
  return <span className="scr-rooms__timer lp-mono">{hhmmss(ROOM_ELAPSED_BASE_SEC + elapsed)}</span>;
}

/** One overlapping monogram square. */
function Face({ ini, live }: { ini: string; live: boolean }) {
  return (
    <span className={`scr-rooms__face${live ? " is-live" : ""}`} aria-hidden="true">
      {ini}
    </span>
  );
}

export default function Rooms() {
  const srIn = useAppStore((s) => s.srIn);
  const srMuted = useAppStore((s) => s.srMuted);
  const srRsvp = useAppStore((s) => s.srRsvp);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const joined = STUDY_ROOMS.find((r) => r.id === srIn);
  const liveCount = STUDY_ROOMS.filter((r) => r.live).length;

  const join = (r: StudyRoom) => {
    if (r.id === srIn) return;
    if (r.live) {
      set({ srIn: r.id });
      try {
        window.scrollTo({ top: 0, behavior: "auto" });
      } catch {
        /* non-browser hosts */
      }
      showToast(`You are in “${r.title}”.`, "mic");
      return;
    }
    showToast(`Added to your calendar · ${r.when}`, "calendar-plus");
  };

  const rsvp = (title: string) => {
    const next = { ...srRsvp };
    if (next[title]) delete next[title];
    else next[title] = 1;
    set({ srRsvp: next });
  };

  return (
    <div className="lp-page scr-rooms">
      <div className="scr-rooms__head">
        <div>
          <h1 className="scr-rooms__title">Study rooms</h1>
          <p className="scr-rooms__lede">
            {liveCount} rooms live now · cohort 03 runs these, not us
          </p>
        </div>
        <ButtonPrimary
          className="scr-rooms__open"
          icon="plus"
          iconSize={15}
          onClick={() => showToast("Demo — rooms are seeded here.", "plus")}
        >
          Open a room
        </ButtonPrimary>
      </div>

      {joined ? (
        <div className="scr-rooms__live">
          <span className="scr-rooms__livename">
            <span className="scr-rooms__dot is-live" aria-hidden="true" />
            <span className="scr-rooms__livetitle">{joined.title}</span>
          </span>
          <RoomTimer />
          <div className="scr-rooms__liveright">
            <div className="scr-rooms__faces">
              {joined.faces.concat(YOU_FACE).map((f) => (
                <Face key={f} ini={f} live />
              ))}
            </div>
            {/*
             * `mic` / `mic-off` are missing from the shared Icon registry, so
             * the two lucide components are used directly rather than via
             * <IconButton>. Same package, no new dependency, no shared edit.
             */}
            <button
              type="button"
              className={`lp-gi scr-rooms__mute${srMuted ? " is-muted" : ""}`}
              onClick={() => set({ srMuted: !srMuted })}
              aria-pressed={srMuted}
              title={srMuted ? "Unmute" : "Mute"}
              aria-label={srMuted ? "Unmute" : "Mute"}
            >
              {srMuted ? (
                <MicOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Mic size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="lp-btn scr-rooms__leave"
              onClick={() => {
                set({ srIn: null });
                /* The comp asked for "log-out", which the registry lacks. */
                showToast("Left the room.", "arrow-left");
              }}
            >
              Leave
            </button>
          </div>
        </div>
      ) : null}

      <div className="scr-rooms__grid">
        {STUDY_ROOMS.map((r) => {
          const inThis = r.id === srIn;
          return (
            <div key={r.id} className={`scr-rooms__card${inThis ? " is-in" : ""}`}>
              <div className="scr-rooms__cardtop">
                <span
                  className={`scr-rooms__dot${r.live ? " is-live" : ""}`}
                  aria-hidden="true"
                />
                <span className="scr-rooms__cardtitle">{r.title}</span>
                <Pill className="scr-rooms__status" tone={r.live ? "pos" : "neutral"}>
                  {r.live ? "Live" : "Scheduled"}
                </Pill>
              </div>

              <p className="scr-rooms__topic">{r.topic}</p>

              <div className="scr-rooms__who">
                <div className="scr-rooms__faces">
                  {r.faces.map((f) => (
                    <Face key={f} ini={f} live={r.live} />
                  ))}
                </div>
                <span className="scr-rooms__count lp-mono">{r.count}</span>
              </div>

              <div className="scr-rooms__cardfoot">
                <span className="scr-rooms__when">
                  <Icon name={r.live ? "radio" : "calendar"} size={14} />
                  {r.when}
                </span>
                {/*
                 * The comp let the joined button stay clickable and no-op.
                 * "You are in" is a state label, so it is disabled here.
                 */}
                <ButtonPrimary
                  className={`scr-rooms__cta${inThis ? " is-in" : ""}`}
                  disabled={inThis}
                  onClick={() => join(r)}
                >
                  {inThis ? "You are in" : r.live ? "Join" : "I will come"}
                </ButtonPrimary>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lp-list">
        <div className="scr-rooms__standhead">
          <Icon name="calendar-clock" size={16} className="scr-rooms__standico" />
          <span className="scr-rooms__standtitle">Standing sessions</span>
          <span className="scr-rooms__standnote">Set by the group, not by us</span>
        </div>

        {STANDING_SESSIONS.map((s) => {
          const going = Boolean(srRsvp[s.title]);
          return (
            <div key={s.title} className="lp-list__row scr-rooms__standrow">
              <span className="scr-rooms__standicon" aria-hidden="true">
                <Icon name={s.icon} size={16} />
              </span>
              <span className="scr-rooms__standbody">
                <span className="scr-rooms__standname">{s.title}</span>
                <span className="scr-rooms__standsub">{s.sub}</span>
              </span>
              <span className="scr-rooms__standwhen lp-mono">{s.when}</span>
              <ButtonSecondary
                className={`scr-rooms__rsvp${going ? " is-on" : ""}`}
                onClick={() => rsvp(s.title)}
              >
                {going ? "Going" : "RSVP"}
              </ButtonSecondary>
            </div>
          );
        })}
      </div>
    </div>
  );
}
