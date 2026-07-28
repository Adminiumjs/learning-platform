/*
 * Study streaks.
 *
 * A streak screen is where a learning app is most tempted to lie, so this one
 * says out loud what counts: a lesson watched, a note written, a review given.
 * Opening the app does not.
 *
 * The only live state is `stToday` — logging today moves the count, the last
 * cell of the heat map, and the student's place on the cohort board, which is
 * sorted rather than hand-ordered so overtaking someone actually happens.
 */

import { useMemo } from "react";
import { ButtonPrimary, ButtonSecondary, Icon, Pill } from "../components";
import {
  STREAK_BADGES,
  STREAK_BASE_DAYS,
  STREAK_PEERS,
  STREAK_TOTALS,
  heatWeeks,
} from "../data/screens/streaks";
import { dataSource } from "../data/source";
import { useAppStore } from "../state/store";
import "../styles/screen-streaks.css";

const LEGEND: number[] = [0, 1, 2, 3];

export default function Streaks() {
  const stToday = useAppStore((s) => s.stToday);
  const stFreeze = useAppStore((s) => s.stFreeze);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const go = useAppStore((s) => s.go);

  const days = STREAK_BASE_DAYS + (stToday ? 1 : 0);
  const weeks = useMemo(() => heatWeeks(stToday), [stToday]);

  /* The student joins the board with their live count and it re-sorts, so
     logging today can move you past someone. The comp matched on the name
     string; the student record is the honest source. */
  const student = dataSource.student();
  const board = useMemo(() => {
    const rows = STREAK_PEERS.map((p) => ({ ...p, me: false }));
    rows.push({ name: "You", initials: student.initials, days, me: true });
    return rows.sort((a, b) => b.days - a.days);
  }, [days, student.initials]);

  const logToday = () => {
    const next = !stToday;
    set({ stToday: next });
    showToast(
      /* The comp announced the pre-toggle count ("Day 42 logged") the moment
         you logged day 43. It also asked for `undo-2`, which is not in the
         app's icon registry — rotate-ccw is the registered equivalent. */
      next ? `Day ${STREAK_BASE_DAYS + 1} logged. Keep going.` : "Today unlogged.",
      next ? "flame" : "rotate-ccw",
    );
  };

  return (
    <div className="lp-page scr-streaks">
      <div className="st-hero">
        <div className="st-hero__main">
          <div className="st-hero__count">
            <Icon name="flame" size={26} className="st-hero__flame" />
            <span className="lp-mono st-hero__days">{days}</span>
            <span className="st-hero__unit">day streak</span>
          </div>
          <p className="st-hero__blurb">
            {stToday
              ? "Today is logged. Six weeks without a gap — that is longer than the course itself."
              : "You have not logged today yet. One lesson, one note, or one peer review does it."}
          </p>
        </div>

        <div className="st-hero__side">
          <Pill icon="snowflake" className="st-freeze">
            {stFreeze} freezes left
          </Pill>
          <ButtonPrimary
            icon={stToday ? "check" : "flame"}
            className={stToday ? "st-log st-log--done" : "st-log"}
            onClick={logToday}
          >
            {stToday ? "Logged today" : "Log today"}
          </ButtonPrimary>
        </div>
      </div>

      <section className="st-heat">
        <div className="st-heat__head">
          <span className="st-heat__title">Last twelve weeks</span>
          <span className="st-legend">
            Less
            {LEGEND.map((l) => (
              <span key={l} className={`st-cell st-cell--l${l} st-cell--legend`} />
            ))}
            More
          </span>
        </div>

        <div className="lp-scroll st-heat__scroll">
          <div className="st-grid">
            {weeks.map((w) => (
              <div className="st-grid__week" key={w.i}>
                {w.days.map((d) => (
                  <span key={d.key} title={d.title} className={`st-cell st-cell--l${d.level}`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="st-stats">
          <div className="st-stat">
            <span className="lp-mono st-stat__value">{days}</span>
            <span className="st-stat__label">Current streak</span>
          </div>
          {STREAK_TOTALS.map((s) => (
            <div className="st-stat" key={s.label}>
              <span className="lp-mono st-stat__value">{s.value}</span>
              <span className="st-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="st-bottom">
        <div className="lp-list st-badges">
          <div className="st-badges__head">Milestones</div>
          {STREAK_BADGES.map((b) => (
            <div
              className={`lp-list__row st-badge${b.earned ? "" : " st-badge--locked"}`}
              key={b.title}
            >
              <span className={`st-badge__ico${b.earned ? "" : " st-badge__ico--locked"}`}>
                <Icon name={b.icon} size={17} />
              </span>
              <span className="st-badge__text">
                <span className="st-badge__title">{b.title}</span>
                <span className="st-badge__sub">{b.sub}</span>
              </span>
              <Pill tone={b.earned ? "pos" : "neutral"}>{b.earned ? "Earned" : "Locked"}</Pill>
            </div>
          ))}
        </div>

        <div className="st-side">
          <section className="st-board">
            <div className="st-board__head">
              <Icon name="users" size={16} className="st-board__ico" />
              <span className="st-board__title">Cohort streaks</span>
            </div>
            {board.map((b) => (
              <div className="st-board__row" key={b.name}>
                <span className={`st-ava${b.me ? " st-ava--me" : ""}`}>{b.initials}</span>
                <span className={`st-board__name${b.me ? " st-board__name--me" : ""}`}>
                  {b.name}
                </span>
                <span className={`lp-mono st-board__days${b.me ? " st-board__days--me" : ""}`}>
                  <Icon name="flame" size={13} />
                  {b.days}
                </span>
              </div>
            ))}
          </section>

          <section className="st-honest">
            <div className="st-honest__head">
              <Icon name="bell" size={16} className="st-honest__ico" />
              <span className="st-honest__title">Keep it honest</span>
            </div>
            <p className="st-honest__body">
              A streak counts a day you actually learned something — a lesson watched, a note
              written, a review given. Opening the app does not count, and we are not going to
              pretend it does.
            </p>
            <ButtonSecondary className="st-honest__btn" onClick={() => go("profile")}>
              Reminder settings
            </ButtonSecondary>
          </section>
        </div>
      </div>
    </div>
  );
}
