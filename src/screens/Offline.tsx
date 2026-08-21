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
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-offline.css";

/** How long the doomed reconnect attempt runs before it gives up. */
const RETRY_MS = 1400;

export default function Offline() {
  const { t, number } = useI18n();
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
      showToast(t("screensB.offline.retryFailed"), "wifi-off");
    }, RETRY_MS);
  };

  return (
    <div className="lp-page scr-offline">
      <div className="of-strip">
        <Icon name="wifi-off" size={19} className="of-strip__ico" />
        <span className="of-strip__text">{t("screensB.offline.strip")}</span>
        <ButtonPrimary className="of-retry" onClick={retry}>
          {ofTrying ? t("screensB.offline.trying") : t("screensB.offline.tryAgain")}
        </ButtonPrimary>
      </div>

      <div className="of-hero">
        <span className="of-hero__ico">
          <Icon name="cloud-off" size={30} />
        </span>
        <h1 className="of-hero__title">{t("screensB.offline.heroTitle")}</h1>
        <p className="of-hero__body">{t("screensB.offline.heroBody")}</p>
      </div>

      <div className="lp-list of-list">
        <div className="of-list__head">
          <Icon name="download" size={16} className="of-list__ico" />
          <span className="of-list__title">{t("screensB.offline.readyTitle")}</span>
          <span className="lp-mono of-list__count">
            {t(
              "screensB.offline.readyCount",
              { total: number(OFFLINE_DOWNLOADS.length), size: OFFLINE_TOTAL },
              OFFLINE_DOWNLOADS.length,
            )}
          </span>
        </div>

        {OFFLINE_DOWNLOADS.map((r) => (
          <button
            type="button"
            className="lp-list__row lp-row of-row"
            key={r.title}
            onClick={() => showToast(t("screensB.offline.playingLocal"), "play")}
          >
            <span className="of-row__play">
              <Icon name="play" size={15} />
            </span>
            <span className="of-row__title">{r.title}</span>
            <span className="lp-mono of-row__size">{r.size}</span>
          </button>
        ))}

        <button type="button" className="lp-row of-manage" onClick={() => go("downloads")}>
          {t("screensB.offline.manage")}
        </button>
      </div>

      <div className="of-queue">
        <Icon name="refresh-cw" size={16} className="of-queue__ico" />
        <span className="of-queue__text">{t("screensB.offline.queue")}</span>
      </div>
    </div>
  );
}
