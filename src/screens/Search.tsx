/*
 * Search — one box over everything the student can reach.
 *
 * The index is built on every render from the live data: the catalogue, every
 * lesson in the curriculum, the board threads and the Q&A including whatever
 * was asked thirty seconds ago. Nothing is precomputed, so nothing goes stale.
 *
 * Each hit knows how to open itself, which is the whole trick — a course opens
 * the course page, a lesson loads the player (or the exam, or the assignment,
 * whichever screen owns that kind), a thread opens itself on the board.
 */

import { ButtonSecondary, Chip, ChipRow, Icon, Pill } from "../components";
import type { Tone } from "../components";
import { BOARD_THREADS } from "../data/screens/board";
import type { SearchType } from "../data/screens/search";
import { SEARCH_TYPES } from "../data/screens/search";
import { dataSource } from "../data/source";
import { allLessons, isModuleLocked } from "../lib/schedule";
import { questionList } from "../lib/thread";
import { useAppStore } from "../state/store";
import "../styles/screen-search.css";

interface Hit {
  id: string;
  type: Exclude<SearchType, "all">;
  title: string;
  sub: string;
  /** Mono right-hand column — duration, lesson count, post count. */
  meta: string;
  icon: string;
  tag: string;
  open: () => void;
}

/** Which token pair each bucket wears. */
const TONE: Record<Hit["type"], Tone> = {
  course: "accent",
  lesson: "info",
  thread: "pos",
  qa: "warn",
};

/** With a query, 14 rows; browsing with an empty box, a taste of 8. */
const CAP_QUERY = 14;
const CAP_BROWSE = 8;

export default function Search() {
  const query = useAppStore((s) => s.sqQ);
  const type = useAppStore((s) => s.sqType);
  const week = useAppStore((s) => s.week);
  const mode = useAppStore((s) => s.mode);
  const qaAdded = useAppStore((s) => s.qaAdded);
  const qaReplies = useAppStore((s) => s.qaReplies);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openCourse = useAppStore((s) => s.openCourse);
  const openLesson = useAppStore((s) => s.openLesson);

  const kinds = dataSource.lessonKinds();

  const pool: Hit[] = [
    ...dataSource.courses().map<Hit>((c) => ({
      id: `c${c.id}`,
      type: "course",
      title: c.title,
      sub: c.blurb,
      meta: `${c.lessons} lessons`,
      icon: c.icon,
      tag: "Course",
      open: () => openCourse(c.id),
    })),
    ...allLessons().map<Hit>((l) => ({
      id: `l${l.id}`,
      type: "lesson",
      title: l.title,
      sub: `Module ${l.mod.num} · ${l.mod.title}`,
      meta: l.dur,
      icon: kinds[l.kind].i,
      tag: kinds[l.kind].l,
      /*
       * The comp called `openLesson` and then unconditionally routed to the
       * classroom, which overrode the routing `openLesson` had just done for
       * an exam, an assignment or a live session — and marched you into the
       * player even when the module was still locked. The store already picks
       * the right screen, so only the player kinds are pushed here, and a
       * locked module is left to its own refusal toast.
       */
      open: () => {
        openLesson(l.id);
        const playable = l.kind === "video" || l.kind === "reading";
        if (playable && !isModuleLocked(l.mod, week, mode)) go("classroom");
      },
    })),
    ...BOARD_THREADS.map<Hit>((t) => ({
      id: `t${t.id}`,
      type: "thread",
      title: t.title,
      sub: t.posts[0].text.split("\n")[0],
      meta: `${t.posts.length} posts`,
      icon: "message-square-text",
      tag: "Thread",
      open: () => {
        set({ dbThread: t.id });
        go("board");
      },
    })),
    ...questionList(qaAdded, qaReplies).map<Hit>((q) => ({
      id: `q${q.id}`,
      type: "qa",
      title: q.text,
      sub: `${q.who} · ${q.lesson}`,
      meta: q.reply ? "Answered" : "Open",
      icon: "message-circle-question",
      tag: "Q&A",
      open: () => go("qa"),
    })),
  ];

  const needle = query.trim().toLowerCase();
  const typed = pool.filter((r) => type === "all" || r.type === type);
  const matches = needle
    ? typed.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(needle))
    : typed;

  const shown = matches.slice(0, needle ? CAP_QUERY : CAP_BROWSE);
  /* The comp counted every match but rendered at most fourteen rows, so the
     label could promise thirty-seven results and show fourteen. It now says
     what is actually on the page when the two differ. */
  const count =
    shown.length < matches.length
      ? `${shown.length} of ${matches.length} results`
      : `${matches.length} ${matches.length === 1 ? "result" : "results"}`;

  return (
    <div className="lp-page scr-search">
      <label className="sq-box">
        <Icon name="search" size={19} className="sq-box__ico" />
        <input
          className="sq-box__input"
          value={query}
          placeholder="Search courses, lessons, threads, questions"
          aria-label="Search"
          onChange={(e) => set({ sqQ: e.target.value })}
          /* The comp printed an "esc" key cap with nothing behind it. Wired. */
          onKeyDown={(e) => {
            if (e.key === "Escape") set({ sqQ: "" });
          }}
        />
        <span className="lp-mono sq-box__key">esc</span>
      </label>

      <ChipRow className="sq-types">
        {SEARCH_TYPES.map((t) => (
          <Chip
            key={t.id}
            active={type === t.id}
            onClick={() => set({ sqType: t.id })}
            className="sq-type"
          >
            {t.label}
          </Chip>
        ))}
        <span className="sq-count">
          {count}
          {needle ? ` for “${query.trim()}”` : ""}
        </span>
      </ChipRow>

      {shown.length > 0 ? (
        <div className="lp-list sq-results">
          {shown.map((r) => (
            <button
              type="button"
              className="lp-list__row lp-row sq-row"
              key={r.id}
              onClick={r.open}
            >
              <span className={`sq-tile sq-tile--${TONE[r.type]}`}>
                <Icon name={r.icon} size={17} />
              </span>
              <span className="sq-row__main">
                <span className="sq-row__head">
                  <span className="sq-row__title">{r.title}</span>
                  <Pill>{r.tag}</Pill>
                </span>
                <span className="sq-row__sub">{r.sub}</span>
              </span>
              <span className="lp-mono sq-row__meta">{r.meta}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="sq-empty">
          <Icon name="search-x" size={26} className="sq-empty__ico" />
          <div className="sq-empty__title">Nothing for “{query.trim()}”.</div>
          <div className="sq-empty__body">
            Try a shorter word, or ask it as a question — Yara answers most within a day.
          </div>
          <ButtonSecondary className="sq-empty__btn" onClick={() => go("qa")}>
            Ask a question
          </ButtonSecondary>
        </div>
      )}
    </div>
  );
}
