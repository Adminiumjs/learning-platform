/*
 * Classroom — the lesson player, the curriculum rail, and the four tabs.
 *
 * This is the screen the product exists for, and it is where the comp's JS
 * layout branching was thickest: it measured `S.w < 1000` to choose between a
 * 298px rail and a collapsible drawer. Both halves render here unconditionally
 * and the 1000px media query in screen-classroom.css picks. `clDrawer` is the
 * only piece of that still in state, because whether the drawer is *open* is a
 * user decision rather than a viewport fact.
 *
 * The player is `<PlayerShell>` — no <video>, no bitmap, no request. Its
 * playhead comes from the store's ticking `elapsed` through `playheadPos`,
 * which is why this screen subscribes to the tick.
 *
 * Class prefix is `scr-cl` rather than `scr-classroom`: the same screen-local
 * namespace, kept short because it appears on sixty-odd elements.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  Pill,
  PlayerShell,
  ProgressBar,
  Tabs,
  TextArea,
  TextInput,
} from "../components";
import { dataSource } from "../data/source";
import type { Question } from "../data/types";
import { useI18n, type MessageKey } from "../i18n";
import {
  demoNow,
  doneCount,
  fmtDate,
  isModuleLocked,
  lessonSeconds,
  mmss,
  playheadPos,
  progressPct,
  weekStart,
} from "../lib/schedule";
import { questionList } from "../lib/thread";
import { useAppStore } from "../state/store";
import "../styles/screen-classroom.css";

/** The comp's four tabs, as a union so `<Tabs>` stays type-safe. */
type ClassroomTab = "overview" | "transcript" | "notes" | "qa";

/** Tab labels are keys: this table is module scope, where no hook can run. */
const TABS: { id: ClassroomTab; key: MessageKey }[] = [
  { id: "overview", key: "screensA.classroom.tabOverview" },
  { id: "transcript", key: "screensA.classroom.tabTranscript" },
  { id: "notes", key: "screensA.classroom.tabNotes" },
  { id: "qa", key: "screensA.classroom.tabQa" },
];

/** "mm:ss" cue → seconds. The transcript's only arithmetic. */
function cueSeconds(cue: string): number {
  const [m, s] = cue.split(":");
  return parseInt(m, 10) * 60 + parseInt(s, 10);
}

export default function Classroom() {
  const { t, number } = useI18n();
  const week = useAppStore((s) => s.week);
  const mode = useAppStore((s) => s.mode);
  const done = useAppStore((s) => s.done);
  const lessonId = useAppStore((s) => s.lesson);
  const tab = useAppStore((s) => s.tab) as ClassroomTab;
  const playing = useAppStore((s) => s.playing);
  const pos = useAppStore((s) => s.pos);
  const playAnchor = useAppStore((s) => s.playAnchor);
  const elapsed = useAppStore((s) => s.elapsed);
  const drawer = useAppStore((s) => s.clDrawer);
  const notes = useAppStore((s) => s.notes);
  const noteSaved = useAppStore((s) => s.noteSaved);
  const qaText = useAppStore((s) => s.qaText);
  const qaAdded = useAppStore((s) => s.qaAdded);
  const qaReplies = useAppStore((s) => s.qaReplies);

  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openLesson = useAppStore((s) => s.openLesson);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const scrubTo = useAppStore((s) => s.scrubTo);
  const markComplete = useAppStore((s) => s.markComplete);
  const askQuestion = useAppStore((s) => s.askQuestion);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.courses()[0];
  const modules = dataSource.modules();
  const kinds = dataSource.lessonKinds();
  const lessons = dataSource.lessons();
  const lesson = dataSource.lesson(lessonId) ?? dataSource.lesson("L12") ?? lessons[0];
  const meta = dataSource.lessonMeta(lesson.id);
  const total = dataSource.totalLessons();

  const index = lessons.findIndex((l) => l.id === lesson.id);
  const next = lessons[index + 1];
  const pct = progressPct(done);
  const progressLabel = t(
    "screensA.classroom.lessonsDone",
    { count: number(doneCount(done)), total: number(total) },
    doneCount(done),
  );
  const isDone = Boolean(done[lesson.id]);

  const duration = lessonSeconds(lesson.id);
  const head = playheadPos({ playing, pos, lessonId: lesson.id, elapsed, playAnchor });
  const headSeconds = head * duration;

  const questions = questionList(qaAdded, qaReplies);

  /* A video lesson gets a clapperboard on the player: the rail's small play
   * triangle would read as a second play button over the real one. */
  const kindIcon = kinds[lesson.kind].i;
  const playerIcon = kindIcon === "play" ? "clapperboard" : kindIcon;

  const completeLabel = isDone
    ? next
      ? t("screensA.classroom.nextLesson")
      : t("screensA.classroom.courseFinished")
    : t("screensA.classroom.markComplete");

  function goPrevious() {
    const previous = lessons[index - 1];
    if (previous) openLesson(previous.id);
    else showToast(t("screensA.classroom.firstLesson"), "info");
  }

  /* The stamp is the playhead plus the demo clock's "now" — a saved note has
   * to date itself against the cohort week, not the wall clock. */
  function saveNote() {
    set({
      noteSaved: t("screensA.classroom.noteStamp", {
        time: mmss(headSeconds),
        date: fmtDate(demoNow(week)),
      }),
    });
    showToast(t("screensA.classroom.noteSaved"), "notebook-pen");
  }

  return (
    <div className="lp-page lp-page--flush scr-cl">
      {/* Below 1000px the rail hides behind this bar; above, CSS drops the bar. */}
      <div className="scr-cl__drawer">
        <button
          type="button"
          className="lp-row scr-cl__drawerbtn"
          aria-expanded={drawer}
          onClick={() => set({ clDrawer: !drawer })}
        >
          <Icon name="list-tree" size={17} className="scr-cl__drawerlead" />
          <span className="scr-cl__drawerlabel">{t("screensA.classroom.lessons")}</span>
          <span className="scr-cl__drawercount">{progressLabel}</span>
          {/* The shared icon registry carries no chevron-up/down, so the open
              and closed states rotate chevron-right in CSS instead. */}
          <span className="scr-cl__drawerico">
            <Icon name="chevron-right" size={17} />
          </span>
        </button>
      </div>

      <aside className={`lp-scroll scr-cl__side${drawer ? " is-open" : ""}`}>
        <div className="scr-cl__sidehead">
          <div className="scr-cl__sidetitle">{course.title}</div>
          <div className="scr-cl__sideprog">
            <ProgressBar
              pct={pct}
              label={t("screensA.classroom.courseProgress")}
              className="scr-cl__sidebar"
            />
            <span className="scr-cl__sidepct">
              {number(pct / 100, { style: "percent", maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="scr-cl__mods">
          {modules.map((m) => {
            const locked = isModuleLocked(m, week, mode);
            return (
              <div key={m.id} className="scr-cl__mod">
                <div className="scr-cl__modhead">
                  <span className="scr-cl__modnum">{m.num}</span>
                  <span className="scr-cl__modtitle">{m.title}</span>
                  {locked ? (
                    <span className="scr-cl__modlock">{fmtDate(weekStart(m.week))}</span>
                  ) : null}
                </div>

                {m.lessons.map((l) => {
                  const complete = Boolean(done[l.id]);
                  const current = l.id === lesson.id;
                  const state = [
                    complete ? "is-done" : "",
                    current ? "is-current" : "",
                    locked ? "is-locked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      key={l.id}
                      type="button"
                      className={`lp-row scr-cl__lesson ${state}`}
                      aria-current={current ? "true" : undefined}
                      onClick={() => openLesson(l.id)}
                    >
                      <Icon
                        name={locked ? "lock" : complete ? "check-circle-2" : kinds[l.kind].i}
                        size={15}
                        className="scr-cl__lessonico"
                      />
                      <span className="scr-cl__lessontitle">{l.title}</span>
                      <span className="scr-cl__lessondur">{l.dur}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="scr-cl__main">
        <PlayerShell
          tint={course.tint}
          icon={playerIcon}
          filename={lesson.file}
          playing={playing}
          onTogglePlay={togglePlay}
          pos={head}
          onScrub={scrubTo}
          time={t("screensA.classroom.playerTime", {
            now: mmss(headSeconds),
            total: mmss(duration),
          })}
        />

        <div className="scr-cl__head">
          <div className="scr-cl__headrow">
            <div className="scr-cl__headtext">
              <div className="scr-cl__crumb">
                <span>
                  {t("screensA.classroom.moduleCrumb", {
                    num: lesson.mod.num,
                    title: lesson.mod.title,
                  })}
                </span>
                <span>·</span>
                <span className="scr-cl__lessonno">
                  {t("screensA.classroom.lessonNo", {
                    n: number(index + 1),
                    total: number(total),
                  })}
                </span>
              </div>
              <h1 className="scr-cl__title">{lesson.title}</h1>
            </div>
            {isDone ? (
              <Pill tone="pos" icon="check" iconSize={14} className="scr-cl__donepill">
                {t("screensA.classroom.completed")}
              </Pill>
            ) : null}
          </div>

          <Tabs
            className="scr-cl__tabs"
            label={t("screensA.classroom.tabsLabel")}
            value={tab}
            onChange={(id) => set({ tab: id })}
            options={TABS.map((entry) => ({
              id: entry.id,
              label: t(entry.key),
              count: entry.id === "qa" ? questions.length : undefined,
            }))}
          />
        </div>

        <div className="scr-cl__body">
          {tab === "overview" ? (
            <div className="scr-cl__pane">
              <p className="scr-cl__overview">{meta.overview}</p>
              <div className="scr-cl__points">
                <div className="scr-cl__pointshead">{t("screensA.classroom.inThisLesson")}</div>
                {meta.points.map((p) => (
                  <div key={p.t} className="scr-cl__point">
                    <span className="scr-cl__dot" />
                    {p.t}
                  </div>
                ))}
              </div>
              <div className="scr-cl__files">
                {meta.files.map((f) => (
                  <ButtonSecondary
                    key={f.n}
                    icon="download"
                    iconSize={14}
                    className="scr-cl__file"
                    onClick={() => showToast(t("screensA.classroom.fileDemo"), "download")}
                  >
                    {f.n}
                  </ButtonSecondary>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "transcript" ? (
            <div className="scr-cl__transcript">
              {meta.transcript.map((row, i) => {
                const start = cueSeconds(row.t);
                const following = meta.transcript[i + 1];
                const end = following ? cueSeconds(following.t) : Number.POSITIVE_INFINITY;
                const active = headSeconds >= start && headSeconds < end;
                return (
                  <button
                    key={row.t}
                    type="button"
                    className={`lp-row scr-cl__cue${active ? " is-active" : ""}`}
                    onClick={() => scrubTo(Math.min(1, start / duration))}
                  >
                    <span className="scr-cl__cuet">{row.t}</span>
                    <span className="scr-cl__cues">{row.s}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="scr-cl__notes">
              <TextArea
                value={notes}
                onChange={(v) => set({ notes: v })}
                placeholder={t("screensA.classroom.notePlaceholder")}
                ariaLabel={t("screensA.classroom.noteLabel")}
                className="scr-cl__notearea"
              />
              <div className="scr-cl__noterow">
                <ButtonPrimary onClick={saveNote}>
                  {t("screensA.classroom.saveNote")}
                </ButtonPrimary>
                <span className="scr-cl__notesaved">{noteSaved}</span>
              </div>
            </div>
          ) : null}

          {tab === "qa" ? (
            <div className="scr-cl__pane">
              <div className="scr-cl__ask">
                <Avatar initials={dataSource.student().initials} size="sm" />
                <TextInput
                  value={qaText}
                  onChange={(v) => set({ qaText: v })}
                  placeholder={t("screensA.classroom.askPlaceholder")}
                  ariaLabel={t("screensA.classroom.askLabel")}
                  className="scr-cl__askinput"
                />
                <ButtonPrimary className="scr-cl__askbtn" onClick={askQuestion}>
                  {t("screensA.classroom.ask")}
                </ButtonPrimary>
              </div>

              {questions.slice(0, 3).map((q) => (
                <LessonQuestion key={q.id} question={q} />
              ))}

              <ButtonSecondary
                className="scr-cl__allq"
                icon="arrow-right"
                iconSize={15}
                iconEnd
                onClick={() => go("qa")}
              >
                {t("screensA.classroom.allQuestions")}
              </ButtonSecondary>
            </div>
          ) : null}
        </div>

        <div className="scr-cl__foot">
          <div className="scr-cl__footprog">
            <ProgressBar
              pct={pct}
              label={t("screensA.classroom.courseProgress")}
              className="scr-cl__footbar"
            />
            <span className="scr-cl__footlabel">{progressLabel}</span>
          </div>
          <ButtonSecondary icon="arrow-left" iconSize={15} onClick={goPrevious}>
            {t("screensA.classroom.previous")}
          </ButtonSecondary>
          <ButtonPrimary icon="arrow-right" iconEnd onClick={markComplete}>
            {completeLabel}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Q&A card */

/**
 * The compact question card the Q&A tab shows.
 *
 * The full Q&A screen renders the same record with a heavier treatment — a
 * filled reply card, the lesson name, a trailing pill — so the two are
 * deliberately separate markup rather than one component behind a `compact`
 * flag, which is what the comp's shared `qaCard()` builder forced on it.
 */
function LessonQuestion({ question }: { question: Question }) {
  const t = useI18n().t;
  const reply = question.reply;

  return (
    <div className="scr-cl__q">
      <Avatar
        initials={question.ini}
        size="sm"
        className={`scr-cl__ava${question.mine ? " is-mine" : ""}`}
      />
      <div className="scr-cl__qbody">
        <div className="scr-cl__qmeta">
          <span className="scr-cl__qwho">{question.who}</span>
          <span className="scr-cl__qat">{question.at}</span>
          <Pill tone={reply ? "pos" : "neutral"}>
            {reply
              ? t("screensA.classroom.answered")
              : t("screensA.classroom.awaitingAnswer")}
          </Pill>
        </div>
        <p className="scr-cl__qtext">{question.text}</p>
        {reply ? (
          <div className="scr-cl__reply">
            <div className="scr-cl__replymeta">
              <span className="scr-cl__replywho">{reply.who}</span>
              <Pill tone="accent">{t("screensA.classroom.instructor")}</Pill>
              <span className="scr-cl__replyat">{reply.at}</span>
            </div>
            <p className="scr-cl__replytext">{reply.text}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
