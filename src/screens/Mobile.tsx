/*
 * The app — the course as a phone, drawn in CSS.
 *
 * A marketing screen with a working product inside it: the device is a styled
 * box (the comp imported an `IOSDevice` component that does not exist here),
 * and everything in it reads the same store as the desktop app. Playing a
 * lesson here plays it in the classroom, ticking a tab moves `mbTab`, and
 * opening a thread lands on the discussion board with that thread open.
 *
 * Three things are worth knowing:
 *
 *   • The phone is a fixed 402px column, so nothing in it needs a media
 *     query. The page around it is a single centred stack.
 *   • The hero is `<PlayerShell>` — the same shell the classroom uses, so the
 *     over-media colours stay in components.css where they belong.
 *   • "This week" picks the *latest unlocked* module. The comp matched a
 *     module whose `week` equalled the clock (capped at 7), which silently
 *     fell back to module 03 in weeks 4 and 6 — the two weeks with no module
 *     of their own. Reading "This week" as the most recent unlock fixes it.
 */

import {
  Chip,
  ChipRow,
  CoverChip,
  Icon,
  Pill,
  PlayerShell,
  ProgressBar,
  ProgressRing,
} from "../components";
import { BOARD_THREADS } from "../data/screens/board";
import type { MobileTab } from "../data/screens/mobile";
import {
  MOBILE_ACCOUNT_ROWS,
  MOBILE_HEADS,
  MOBILE_INTRO,
  MOBILE_STATS,
  MOBILE_STREAK,
  MOBILE_TABS,
} from "../data/screens/mobile";
import { dataSource } from "../data/source";
import {
  countdown,
  doneCount,
  fmtDate,
  lessonSeconds,
  mmss,
  playheadPos,
  progressPct,
  weekStart,
} from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-mobile.css";

/** How many threads fit on the phone's discussion tab. */
const THREAD_COUNT = 4;

export default function Mobile() {
  const week = useAppStore((s) => s.week);
  const done = useAppStore((s) => s.done);
  const lessonId = useAppStore((s) => s.lesson);
  const playing = useAppStore((s) => s.playing);
  const pos = useAppStore((s) => s.pos);
  const playAnchor = useAppStore((s) => s.playAnchor);
  const elapsed = useAppStore((s) => s.elapsed);
  const mbTab = useAppStore((s) => s.mbTab);

  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openLesson = useAppStore((s) => s.openLesson);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const scrubTo = useAppStore((s) => s.scrubTo);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.courses()[0];
  const kinds = dataSource.lessonKinds();
  const student = dataSource.student();
  const weeks = dataSource.cohortWeeks();
  const totalLessons = dataSource.totalLessons();

  /* `mbTab` is a plain string on the store, so an unknown value falls back to
     the first tab rather than blanking the phone. */
  const tab: MobileTab = MOBILE_TABS.find((t) => t.id === mbTab)?.id ?? "learn";

  const lessons = dataSource.lessons();
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const duration = lessonSeconds(lesson.id);
  const head = playheadPos({ playing, pos, lessonId: lesson.id, elapsed, playAnchor });
  const time = `${mmss(head * duration)} / ${mmss(duration)}`;

  const pct = progressPct(done);
  const finished = doneCount(done);

  /* The most recently unlocked module — see the header note. Because it is
     chosen by unlock date it can never be locked, so the comp's lock icon on
     these rows is unreachable and is not ported. */
  const modules = dataSource.modules();
  const thisWeek = [...modules].reverse().find((m) => m.week <= week) ?? modules[0];

  const heads = MOBILE_HEADS[tab];
  const kicker = heads.kicker ?? `Week ${week} of ${weeks}`;

  const threads = BOARD_THREADS.slice(0, THREAD_COUNT);

  /** The mini player only earns its place when playback outlives the tab. */
  const nowPlaying = playing && tab !== "learn";

  function pick(next: MobileTab) {
    set({ mbTab: next });
  }

  return (
    <div className="lp-page scr-mobile">
      <div className="mb-intro">
        <h1 className="mb-intro__title">{MOBILE_INTRO.title}</h1>
        <p className="mb-intro__body">{MOBILE_INTRO.body}</p>
      </div>

      <ChipRow className="mb-chips">
        {MOBILE_TABS.map((t) => (
          <Chip key={t.id} icon={t.icon} active={t.id === tab} onClick={() => pick(t.id)}>
            {t.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="mb-device">
        <span className="mb-device__island" aria-hidden="true" />

        <div className="mb-app">
          <div className="mb-head">
            <div className="mb-head__text">
              <div className="mb-head__kicker">{kicker}</div>
              <div className="mb-head__title">{heads.title}</div>
            </div>
            <span className="mb-head__me" aria-hidden="true">
              {student.initials}
            </span>
          </div>

          <div className="mb-body lp-hide">
            {tab === "learn" ? (
              <>
                {/* The filename is drawn beside the player, not inside it: the
                    comp puts the chip in the top corner, and the player's own
                    copy lives in the control bar, where it would leave the
                    scrubber about 60px of a 340px phone. */}
                <div className="mb-herowrap">
                  <PlayerShell
                    className="mb-hero"
                    tint={course.tint}
                    icon="clapperboard"
                    filename={lesson.file}
                    playing={playing}
                    onTogglePlay={togglePlay}
                    pos={head}
                    onScrub={scrubTo}
                    time={time}
                  />
                  <span className="mb-herowrap__file lp-mono">{lesson.file}</span>
                </div>

                <div className="mb-continue">
                  <div className="mb-eyebrow">Continue</div>
                  <div className="mb-continue__title">{lesson.title}</div>
                  <div className="mb-continue__row">
                    <ProgressBar pct={pct} className="mb-continue__bar" label="Course progress" />
                    <span className="mb-continue__pct lp-mono">{pct}%</span>
                  </div>
                </div>

                <div className="mb-week">
                  <div className="mb-week__head">
                    <span className="mb-week__title">This week</span>
                    <span className="mb-week__date lp-mono">{fmtDate(weekStart(week))}</span>
                  </div>

                  {thisWeek.lessons.map((l) => {
                    const isDone = !!done[l.id];
                    const isCurrent = l.id === lesson.id;
                    const kind = kinds[l.kind];
                    const state = isDone ? "is-done" : isCurrent ? "is-current" : "";
                    return (
                      <button
                        key={l.id}
                        type="button"
                        className={`lp-row mb-lesson ${state}`.trim()}
                        onClick={() => {
                          openLesson(l.id);
                          pick("learn");
                        }}
                      >
                        <span className="mb-lesson__tile">
                          <Icon name={isDone ? "check" : kind.i} size={16} />
                        </span>
                        <span className="mb-lesson__text">
                          <span className="mb-lesson__title">{l.title}</span>
                          <span className="mb-lesson__sub">
                            {isDone
                              ? `Completed · ${l.dur}`
                              : isCurrent
                                ? `In progress · ${l.dur}`
                                : `${kind.l} · ${l.dur}`}
                          </span>
                        </span>
                        <Icon
                          name={isDone ? "rotate-ccw" : "chevron-right"}
                          size={16}
                          className="mb-lesson__go"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mb-live">
                  <Icon name="radio" size={19} className="mb-live__ico" />
                  <span className="mb-live__text">
                    <span className="mb-live__title">Live critique</span>
                    <span className="mb-live__count lp-mono">{countdown(week, elapsed)}</span>
                  </span>
                  <button
                    type="button"
                    className="lp-btn mb-live__cta"
                    onClick={() => showToast("We will buzz you an hour before.", "bell")}
                  >
                    Remind me
                  </button>
                </div>
              </>
            ) : null}

            {tab === "discuss"
              ? threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="lp-row mb-thread"
                    onClick={() => {
                      set({ dbThread: t.id });
                      go("board");
                    }}
                  >
                    <span className="mb-thread__meta">
                      <Pill tone="neutral">{t.tag}</Pill>
                      <span className="mb-thread__at lp-mono">{t.at}</span>
                    </span>
                    <span className="mb-thread__title">{t.title}</span>
                    <span className="mb-thread__foot">
                      <span className="mb-thread__stat">
                        <Icon name="arrow-big-up" size={13} />
                        {t.votes}
                      </span>
                      <span className="mb-thread__stat">
                        <Icon name="message-square" size={13} />
                        {t.posts.length - 1}
                      </span>
                      <span className="mb-thread__by">{t.by}</span>
                    </span>
                  </button>
                ))
              : null}

            {tab === "you" ? (
              <>
                <div className="mb-you">
                  <ProgressRing pct={pct} size="sm" label="Course complete" />
                  <div className="mb-you__text">
                    <div className="mb-you__name">{student.name}</div>
                    <div className="mb-you__sub">
                      Cohort 03 · {finished} of {totalLessons} lessons · {MOBILE_STREAK}
                    </div>
                  </div>
                </div>

                <div className="mb-stats">
                  {MOBILE_STATS.map((s) => (
                    <div key={s.label} className="mb-stat">
                      <span className="mb-stat__value lp-mono">{s.value}</span>
                      <span className="mb-stat__label">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="lp-list mb-rows">
                  {MOBILE_ACCOUNT_ROWS.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      className="lp-list__row lp-row mb-row"
                      onClick={() =>
                        r.view
                          ? go(r.view)
                          : showToast("Three lessons are on this phone already.", "download")
                      }
                    >
                      <Icon name={r.icon} size={16} className="mb-row__ico" />
                      <span className="mb-row__label">{r.label}</span>
                      <span className="mb-row__value">
                        {r.value ?? (finished >= totalLessons ? "Ready" : "Locked")}
                      </span>
                      <Icon name="chevron-right" size={15} className="mb-row__ico" />
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {nowPlaying ? (
            <div className="mb-mini">
              <CoverChip
                tint={course.tint}
                icon="clapperboard"
                size="sm"
                iconSize={15}
                className="mb-mini__tile"
              />
              <span className="mb-mini__text">
                <span className="mb-mini__title">{lesson.title}</span>
                <span className="mb-mini__time lp-mono">{time}</span>
              </span>
              <button
                type="button"
                className="lp-btn mb-mini__btn"
                onClick={togglePlay}
                aria-label="Pause"
              >
                <Icon name="pause" size={15} />
              </button>
            </div>
          ) : null}

          <div className="mb-tabs" role="tablist" aria-label="App sections">
            {MOBILE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === tab}
                className={`lp-btn mb-tab${t.id === tab ? " is-active" : ""}`}
                onClick={() => pick(t.id)}
              >
                <Icon name={t.icon} size={21} />
                <span className="mb-tab__label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-foot">
        <Icon name="download" size={14} />
        {MOBILE_INTRO.offline}
        <span className="lp-mono">{MOBILE_INTRO.platforms}</span>
      </div>
    </div>
  );
}
