/*
 * Downloads — keep this week's lessons on the device.
 *
 * Five rows: the four downloadable lessons of the current module (the live
 * session is not a file) plus the one week-2 video everybody re-watches.
 * A row is `none`, `busy` for 1.6s, then `done`; `dlState` on the store holds
 * that, so a download survives navigating away and back.
 *
 * Nothing is actually written anywhere — there are no media files in this app
 * at all (spec 20 D9). The sizes are copy, and the storage readout is arithmetic
 * over how many rows are marked done.
 */

import { useEffect, useRef } from "react";
import { ButtonPrimary, ButtonSecondary, Icon, PageHead, Toggle } from "../components";
import {
  BAR_PCT_PER_FILE,
  BUSY_PCT,
  DEVICE_LABEL,
  DOWNLOAD_MS,
  DOWNLOAD_SIZES,
  GB_PER_FILE,
  NO_SIZE,
} from "../data/screens/downloads";
import { dataSource } from "../data/source";
import type { Lesson } from "../data/types";
import { useAppStore } from "../state/store";
import "../styles/screen-downloads.css";

/** The registry has no "loader", so the in-flight glyph spins instead. */
const BUSY_ICON = "refresh-cw";

/** A video is a lesson; a reading or a brief counts against "Resources". */
function isLesson(l: Lesson): boolean {
  return l.kind === "video";
}

export default function Downloads() {
  const dlWifi = useAppStore((s) => s.dlWifi);
  const dlState = useAppStore((s) => s.dlState);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  /* One timer per in-flight row, cleared on unmount so a download that lands
     after the screen has gone cannot write to a dead component's closure. */
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const t of Object.values(pending)) clearTimeout(t);
    };
  }, []);

  const modules = dataSource.modules();
  const kinds = dataSource.lessonKinds();

  /* The current module, minus its live session, plus the week-2 dark-mode
     lesson — the comp's list, and the only one with sizes written for it. */
  const files: Lesson[] = [
    ...modules[2].lessons.filter((l) => l.kind !== "live"),
    modules[1].lessons[3],
  ];

  const doneIds = files.filter((l) => dlState[l.id] === "done");
  const usedPct = Math.min(100, doneIds.length * BAR_PCT_PER_FILE);
  /* The legend names two colours, so the bar draws two: the comp painted a
     single accent fill and left "Resources" pointing at nothing. */
  const lessonPct = Math.min(usedPct, doneIds.filter(isLesson).length * BAR_PCT_PER_FILE);
  const resourcePct = usedPct - lessonPct;

  const clearTimer = (id: string) => {
    const t = timers.current[id];
    if (t) {
      clearTimeout(t);
      delete timers.current[id];
    }
  };

  const toggleRow = (id: string, settled: boolean) => {
    const next = { ...dlState };
    if (settled) {
      clearTimer(id);
      delete next[id];
      set({ dlState: next });
      return;
    }

    next[id] = "busy";
    set({ dlState: next });
    timers.current[id] = setTimeout(() => {
      delete timers.current[id];
      /* Read the live map: "Download the week" or a cancel may have landed
         while this one was in flight. */
      const live = { ...useAppStore.getState().dlState };
      if (live[id] !== "busy") return;
      live[id] = "done";
      set({ dlState: live });
    }, DOWNLOAD_MS);
  };

  const downloadWeek = () => {
    const next = { ...dlState };
    for (const l of files) {
      clearTimer(l.id);
      next[l.id] = "done";
    }
    set({ dlState: next });
    showToast("Five lessons saved to this device.", "download");
  };

  const clearAll = () => {
    for (const id of Object.keys(timers.current)) clearTimer(id);
    set({ dlState: {} });
    showToast("Downloads cleared.", "trash-2");
  };

  return (
    <div className="lp-page lp-page--narrow scr-downloads">
      <PageHead
        title="Downloads"
        lede="Keep lessons on this device. They play with no signal — the train, the plane, the basement studio."
      />

      <section className="dl-storage">
        <div className="dl-storage__head">
          <span className="lp-mono dl-storage__used">
            {(doneIds.length * GB_PER_FILE).toFixed(1)} GB
          </span>
          <span className="dl-storage__of">{DEVICE_LABEL}</span>
          <button type="button" className="lp-nav dl-storage__clear" onClick={clearAll}>
            Remove all
          </button>
        </div>

        <div
          className="dl-bar"
          role="progressbar"
          aria-label="Device storage used"
          aria-valuenow={usedPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="dl-bar__seg dl-bar__seg--lessons" style={{ inlineSize: `${lessonPct}%` }} />
          <span className="dl-bar__seg dl-bar__seg--res" style={{ inlineSize: `${resourcePct}%` }} />
        </div>

        <div className="dl-legend">
          <span className="dl-legend__item">
            <span className="dl-legend__dot dl-legend__dot--lessons" />
            Lessons
          </span>
          <span className="dl-legend__item">
            <span className="dl-legend__dot dl-legend__dot--res" />
            Resources
          </span>
          <span className="dl-wifi">
            <span className="dl-wifi__label">Only on Wi-Fi</span>
            <Toggle
              checked={dlWifi}
              onChange={(next) => set({ dlWifi: next })}
              label="Only download on Wi-Fi"
              hideLabel
            />
          </span>
        </div>
      </section>

      <div className="dl-week">
        <h2 className="dl-week__title">This week</h2>
        <ButtonPrimary className="dl-week__all" icon="download" iconSize={15} onClick={downloadWeek}>
          Download the week
        </ButtonPrimary>
      </div>

      <section className="lp-list dl-list">
        {files.map((l) => {
          const state = dlState[l.id] ?? "none";
          const done = state === "done";
          const busy = state === "busy";
          const kind = kinds[l.kind];

          return (
            <div key={l.id} className="lp-row lp-list__row dl-row">
              <span className={`dl-row__tile${done ? " is-done" : ""}${busy ? " is-busy" : ""}`}>
                <Icon
                  name={done ? "check" : busy ? BUSY_ICON : kind.i}
                  size={16}
                  className={busy ? "dl-row__spin" : undefined}
                />
              </span>

              <span className="dl-row__body">
                <span className="dl-row__title">{l.title}</span>
                <span className="dl-row__sub">
                  {done ? "Downloaded · " : ""}
                  {kind.l} · {l.dur}
                  {busy ? ` · ${BUSY_PCT}% done` : ""}
                </span>
                {busy ? (
                  <span className="dl-row__track">
                    <span className="dl-row__fill" style={{ inlineSize: `${BUSY_PCT}%` }} />
                  </span>
                ) : null}
              </span>

              <span className="lp-mono dl-row__size">{DOWNLOAD_SIZES[l.id] ?? NO_SIZE}</span>

              <ButtonSecondary
                className={`dl-row__btn${done ? " is-done" : ""}`}
                icon={done ? "trash-2" : busy ? "x" : "download"}
                iconSize={15}
                onClick={() => toggleRow(l.id, done || busy)}
                title={`${done ? "Remove" : busy ? "Cancel" : "Download"} ${l.title}`}
              >
                {done ? "Remove" : busy ? "Cancel" : "Download"}
              </ButtonSecondary>
            </div>
          );
        })}
      </section>
    </div>
  );
}
