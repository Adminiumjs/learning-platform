/*
 * Offline.
 *
 * The screen a learning app owes anyone who studies on a train. It is honest
 * about what is lost (streaming) and specific about what is not (downloads,
 * notes, and anything queued to send), rather than showing a dinosaur.
 *
 * "Try again" is the only moving part: it fails, on purpose, after a beat.
 */

import { useEffect, useRef } from "react";
import { ButtonPrimary, Icon } from "../components";
import { OFFLINE_DOWNLOADS, OFFLINE_TOTAL } from "../data/screens/offline";
import { useAppStore } from "../state/store";
import "../styles/screen-offline.css";

/** How long the doomed reconnect attempt runs before it gives up. */
const RETRY_MS = 1400;

export default function Offline() {
  const ofTrying = useAppStore((s) => s.ofTrying);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const go = useAppStore((s) => s.go);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* `ofTrying` lives in the store, so leaving mid-attempt would otherwise
     strand the button on "Trying…" the next time you came back. */
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      set({ ofTrying: false });
    },
    [set],
  );

  const retry = () => {
    if (ofTrying) return;
    set({ ofTrying: true });
    timer.current = setTimeout(() => {
      set({ ofTrying: false });
      showToast("Still nothing. We will keep checking.", "wifi-off");
    }, RETRY_MS);
  };

  return (
    <div className="lp-page scr-offline">
      <div className="of-strip">
        <Icon name="wifi-off" size={19} className="of-strip__ico" />
        <span className="of-strip__text">
          You're offline. We'll keep everything you do and send it when you're back.
        </span>
        <ButtonPrimary className="of-retry" onClick={retry}>
          {ofTrying ? "Trying…" : "Try again"}
        </ButtonPrimary>
      </div>

      <div className="of-hero">
        <span className="of-hero__ico">
          <Icon name="cloud-off" size={30} />
        </span>
        <h1 className="of-hero__title">The lesson needs a signal.</h1>
        <p className="of-hero__body">
          Streaming is off until you reconnect. What you downloaded still plays, and your notes are
          safe on this device.
        </p>
      </div>

      <div className="lp-list of-list">
        <div className="of-list__head">
          <Icon name="download" size={16} className="of-list__ico" />
          <span className="of-list__title">Ready to watch offline</span>
          <span className="lp-mono of-list__count">
            {OFFLINE_DOWNLOADS.length} lessons · {OFFLINE_TOTAL}
          </span>
        </div>

        {OFFLINE_DOWNLOADS.map((r) => (
          <button
            type="button"
            className="lp-list__row lp-row of-row"
            key={r.title}
            onClick={() => showToast("Playing from this device.", "play")}
          >
            <span className="of-row__play">
              <Icon name="play" size={15} />
            </span>
            <span className="of-row__title">{r.title}</span>
            <span className="lp-mono of-row__size">{r.size}</span>
          </button>
        ))}

        <button type="button" className="lp-row of-manage" onClick={() => go("downloads")}>
          Manage downloads
        </button>
      </div>

      <div className="of-queue">
        <Icon name="refresh-cw" size={16} className="of-queue__ico" />
        <span className="of-queue__text">
          One note and one Q&amp;A reply are waiting to send. They go out the moment you reconnect.
        </span>
      </div>
    </div>
  );
}
