/*
 * Teach — the instructor's dashboard, and the door into the other half of the
 * app.
 *
 * Everything on it is derived, never stored: the stat tiles, the "Needs you
 * now" queue and the class-progress chart all recount from the same live state
 * the Q&A inbox and the grading queue write to. Answer a question in the inbox
 * and the count here has dropped by the time you come back — that loop is the
 * point of the screen, so nothing is allowed to cache.
 *
 * Two comp defects are corrected, both marked below: a dead `lvTitle` binding,
 * and a hardcoded "this student is behind" row that had drifted off the roster.
 */

import type { ReactNode } from "react";
import { Icon, PageHead, Pill, StatGrid, StatTile } from "../components";
import type { Tone } from "../components";
import { COHORT_WEEKS } from "../data/demo";
import {
  BAR_MAX_PX,
  BAR_MIN_PX,
  BEHIND_BUCKETS,
  PROGRESS_BUCKETS,
  RSVP_YES,
  WEEKDAYS_LONG,
} from "../data/screens/teach";
import { dataSource } from "../data/source";
import type { ViewId } from "../data/types";
import { DAYS, clockLabel, countdown, fmtDateLong, liveDate } from "../lib/schedule";
import { inboxQueue, questionList } from "../lib/thread";
import { useAppStore } from "../state/store";
import "../styles/screen-teach.css";

interface Stat {
  label: string;
  value: ReactNode;
  icon: string;
  tone: Tone;
  view: ViewId;
}

/** Only two queue tones appear on this screen: warn nags, info waits. */
type NeedTone = "warn" | "info";

interface Need {
  id: string;
  icon: string;
  title: string;
  sub: string;
  pill: string;
  tone: NeedTone;
  view: ViewId;
}

/** A count worth noticing is tinted; a zero stays in the body colour. */
function count(n: number, tone: NeedTone): ReactNode {
  return n > 0 ? <span className={`td-hot td-hot--${tone}`}>{n}</span> : n;
}

export default function Teach() {
  const week = useAppStore((s) => s.week);
  const elapsed = useAppStore((s) => s.elapsed);
  const qaAdded = useAppStore((s) => s.qaAdded);
  const qaReplies = useAppStore((s) => s.qaReplies);
  const qiDone = useAppStore((s) => s.qiDone);
  const gqDone = useAppStore((s) => s.gqDone);
  const go = useAppStore((s) => s.go);

  const seats = dataSource.cohortCapacity();
  const session = dataSource.liveSession();
  const students = dataSource.students();

  /* The two queues the inbox and the grading screen work from, recounted. */
  const open = inboxQueue(questionList(qaAdded, qaReplies), qiDone);
  const pending = dataSource.submissions().filter((s) => !gqDone[s.id]);

  const live = liveDate(week, session.dayOffset, session.hour);

  const stats: Stat[] = [
    { label: "Students enrolled", value: seats, icon: "users", tone: "neutral", view: "roster" },
    {
      label: "Unanswered questions",
      value: count(open.length, "warn"),
      icon: "message-circle-question",
      tone: "warn",
      view: "inbox",
    },
    {
      label: "Awaiting a grade",
      value: count(pending.length, "info"),
      icon: "clipboard-check",
      tone: "info",
      view: "grading",
    },
    {
      label: "Next live session",
      value: `${DAYS[live.getDay()]} ${session.hour}:00`,
      icon: "radio",
      tone: "accent",
      view: "live",
    },
  ];

  /*
   * The comp wrote the nudged student's name and percentage into the row's
   * copy, so it lied the moment the roster moved. Reading the least-progressed
   * student off the roster names the same person, now by construction.
   */
  const behind = students.reduce((worst, s) => (s[1] < worst[1] ? s : worst));

  const needs: Need[] = [
    ...open.slice(0, 2).map<Need>((q) => ({
      id: q.id,
      icon: "message-circle-question",
      title: q.text,
      sub: `${q.who} · ${q.lesson} · ${q.at}`,
      pill: "Answer",
      tone: "warn",
      view: "inbox",
    })),
    ...pending.slice(0, 3).map<Need>((s) => ({
      id: s.id,
      icon: "pen-line",
      title: `${s.item} — ${s.who}`,
      sub: `Submitted ${s.at} · out of ${s.max}`,
      pill: "Grade",
      tone: "info",
      view: "grading",
    })),
    {
      id: "behind",
      icon: "triangle-alert",
      title: `${behind[0]} has not opened week 2`,
      sub: `${behind[1]}% through · last active ${behind[2]}`,
      pill: "Nudge",
      tone: "warn",
      view: "roster",
    },
  ];

  const counts = PROGRESS_BUCKETS.map(
    (b) => students.filter((s) => s[1] >= b.from && s[1] < b.to).length,
  );
  /* An all-empty chart would divide by zero; the floor keeps the bars flat. */
  const peak = Math.max(...counts, 1);

  return (
    <div className="lp-page scr-teach">
      <PageHead
        eyebrow={
          <span className="td-eyebrow">
            <Icon name="presentation" size={15} />
            Teaching
          </span>
        }
        title={dataSource.course("DS-101").title}
        lede={`Cohort 03 · week ${week} of ${COHORT_WEEKS} · ${seats} students · live ${WEEKDAYS_LONG[live.getDay()]}s ${session.hour}:00 ${session.timezone}`}
        action={<span className="td-clock lp-mono">{clockLabel(week)}</span>}
      />

      <StatGrid className="td-stats">
        {stats.map((s) => (
          <StatTile
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            tone={s.tone}
            onClick={() => go(s.view)}
          />
        ))}
      </StatGrid>

      <div className="td-grid">
        <section className="lp-list td-panel">
          <header className="td-panel__head">
            <Icon name="hand" size={17} className="td-panel__ico" />
            <h2 className="td-panel__title">Needs you now</h2>
            <span className="td-panel__count lp-mono">{needs.length} open</span>
          </header>

          {needs.map((n) => (
            <button key={n.id} type="button" className="lp-row td-need" onClick={() => go(n.view)}>
              <span className={`td-need__ico td-need__ico--${n.tone}`}>
                <Icon name={n.icon} size={15} />
              </span>
              <span className="td-need__text">
                <span className="td-need__title">{n.title}</span>
                <span className="td-need__sub">{n.sub}</span>
              </span>
              <Pill tone={n.tone}>{n.pill}</Pill>
              <Icon name="chevron-right" size={16} className="td-need__go" />
            </button>
          ))}
        </section>

        <div className="td-side">
          <section className="td-card">
            <div className="td-card__head">
              <Icon name="bar-chart-3" size={16} className="td-card__ico" />
              <h2 className="td-card__title">Class progress</h2>
            </div>
            <p className="td-card__sub">Where the {seats} of them are, right now</p>

            <div className="td-bars">
              {PROGRESS_BUCKETS.map((b, i) => (
                <div key={b.label} className="td-bar">
                  <span className="td-bar__n lp-mono">{counts[i]}</span>
                  <span
                    className={`td-bar__fill${i < BEHIND_BUCKETS ? " td-bar__fill--warn" : ""}`}
                    style={{
                      blockSize: `${Math.round((counts[i] / peak) * BAR_MAX_PX) + BAR_MIN_PX}px`,
                    }}
                  />
                  <span className="td-bar__label">{b.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="td-card">
            <div className="td-card__head">
              <Icon name="radio" size={16} className="td-card__ico td-card__ico--accent" />
              <h2 className="td-card__title">Next live session</h2>
            </div>
            {/* The comp bound `lvTitle` here, which only the course and live
                screens ever build — on this screen it rendered blank. */}
            <p className="td-live__title">{session.title}</p>
            <p className="td-live__when">
              {fmtDateLong(live)} · {session.hour}:00 {session.timezone} · {RSVP_YES} of {seats} said
              yes
            </p>
            <div className="td-count">
              <Icon name="timer" size={15} className="td-count__ico" />
              <span className="td-count__clock lp-mono">{countdown(week, elapsed)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
