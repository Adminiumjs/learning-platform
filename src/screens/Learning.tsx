/*
 * My learning — the student's dashboard.
 *
 * Two enrolled courses on the left, and the three things that are actually
 * due on the right: the next live session with a running countdown, this
 * week's work, and the latest announcement.
 *
 * Everything dated here reads the demo clock (spec 20 D6), so advancing the
 * week in the dock moves the countdown, the deadline and the announcement
 * stamp together — the only screen-level value that ticks is `elapsed`.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Card,
  CoverChip,
  Icon,
  PageHead,
  ProgressBar,
  ProgressRing,
  Skel,
} from "../components";
import { LEARNING_ANNOUNCEMENT, LEARNING_GREETING } from "../data/screens/learning";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import {
  addMinutes,
  allLessons,
  clockLabel,
  countdown,
  doneCount,
  dueDate,
  endOfDay,
  fmtDate,
  fmtDateLong,
  fmtTime,
  isCohort,
  liveDate,
  mmss,
  progressPct,
  weekStart,
} from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-learning.css";

/** The week the specimen assignment is set in; past it, the row reads overdue. */
const ASSIGNMENT_WEEK = 3;

/*
 * The two "keep going" rows the comp pinned to fixed strings ("18:30 · you are
 * 39% through", "6 min"). Held as numbers so the runtime can render them in the
 * reader's own digits and clock, rather than as English typography.
 */
const WATCH_SECONDS = 18 * 60 + 30;
const WATCH_FRACTION = 0.39;
const READ_MINUTES = 6;

interface CourseRow {
  id: string;
  title: string;
  tint: string;
  icon: string;
  sub: string;
  pct: number;
  /** "11 / 22 lessons". */
  lessons: string;
  cta: string;
  onCta: () => void;
}

export default function Learning() {
  const { t, number } = useI18n();
  const week = useAppStore((s) => s.week);
  const mode = useAppStore((s) => s.mode);
  const done = useAppStore((s) => s.done);
  const elapsed = useAppStore((s) => s.elapsed);
  const loading = useAppStore((s) => s.loading);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const courses = dataSource.courses();
  const cohortCourse = courses[0];
  const selfCourse = courses[1];
  const selfEnrolment = dataSource.enrolledCourse(selfCourse.id);
  const live = dataSource.liveSession();
  const totalLessons = dataSource.totalLessons();
  const weeks = dataSource.cohortWeeks();

  /*
   * The comp pinned the "next:" clause to "Grids and rhythm". It reads the
   * progress map instead, so completing lessons in the classroom moves it —
   * and once nothing is left the clause is dropped rather than left lying.
   */
  const nextUp = allLessons().find((l) => !done[l.id])?.title;

  /*
   * Four whole sentences rather than fragments joined with " · ": which clause
   * comes first, and whether a separator is even used, is the translator's
   * call, not this file's.
   */
  const cohortSub = isCohort(mode)
    ? nextUp
      ? t("screensB.learning.subCohortNext", {
          week: number(week),
          weeks: number(weeks),
          title: nextUp,
        })
      : t("screensB.learning.subCohort", { week: number(week), weeks: number(weeks) })
    : nextUp
      ? t("screensB.learning.subSelfNext", { title: nextUp })
      : t("screensB.learning.subSelf");

  const rows: CourseRow[] = [
    {
      id: cohortCourse.id,
      title: cohortCourse.title,
      tint: cohortCourse.tint,
      icon: cohortCourse.icon,
      sub: cohortSub,
      pct: progressPct(done),
      lessons: t(
        "screensB.learning.lessonsOf",
        { done: number(doneCount(done)), total: number(totalLessons) },
        totalLessons,
      ),
      cta: t("screensB.learning.continue"),
      onCta: () => go("classroom"),
    },
  ];

  if (selfEnrolment) {
    const doneN = selfEnrolment.done ?? 0;
    rows.push({
      id: selfEnrolment.id,
      title: selfEnrolment.title,
      tint: selfEnrolment.tint,
      icon: selfEnrolment.icon,
      sub: selfEnrolment.next
        ? t("screensB.learning.subSelfNext", { title: selfEnrolment.next })
        : t("screensB.learning.subSelf"),
      pct: Math.round((doneN / selfEnrolment.total) * 100),
      lessons: t(
        "screensB.learning.lessonsOf",
        { done: number(doneN), total: number(selfEnrolment.total) },
        selfEnrolment.total,
      ),
      cta: t("screensB.learning.resume"),
      onCta: () =>
        showToast(
          t("screensB.learning.resumeToast", { course: selfEnrolment.title }),
          "info",
        ),
    });
  }

  const overdue = week > ASSIGNMENT_WEEK;
  const dueRows = [
    {
      title: "Type specimen page",
      icon: "pen-line",
      due: t(overdue ? "screensB.learning.overdueAt" : "screensB.learning.dueAt", {
        date: fmtDate(dueDate()),
        time: fmtTime(endOfDay(dueDate())),
      }),
      overdue,
      onClick: () => go("assignment"),
    },
    {
      title: t("screensB.learning.watch", { title: "Grids and rhythm" }),
      icon: "play",
      due: t("screensB.learning.watchSub", {
        dur: mmss(WATCH_SECONDS),
        pct: number(WATCH_FRACTION, { style: "percent" }),
      }),
      overdue: false,
      onClick: () => go("classroom"),
    },
    {
      title: t("screensB.learning.read", { title: "Spacing tokens" }),
      icon: "book-open",
      due: number(READ_MINUTES, { style: "unit", unit: "minute", unitDisplay: "short" }),
      overdue: false,
      onClick: () => {
        set({ lesson: "L13" });
        go("classroom");
      },
    },
  ];

  /*
   * Both ends of the session are real instants, so `fmtTime` can render them
   * in the reader's own clock — 12-hour in en-US, 24-hour in de-DE — instead
   * of the interpolated `${live.hour}:00` this used to print everywhere.
   */
  const sessionStart = liveDate(week, live.dayOffset, live.hour);
  const sessionWhen = t("screensB.learning.sessionWhen", {
    date: fmtDateLong(sessionStart),
    start: fmtTime(sessionStart),
    end: fmtTime(addMinutes(sessionStart, live.durationMin)),
    tz: live.timezone,
  });

  return (
    <div className="lp-page scr-learning">
      <PageHead
        title={t("screensB.learning.title")}
        lede={LEARNING_GREETING}
        action={<span className="ml-clock lp-mono">{clockLabel(week)}</span>}
      />

      <div className="ml-grid">
        <div className="ml-list">
          {/*
           * The dock offers "Reload list" on this screen but the comp had
           * nothing to show for it — only the catalog drew skeletons. The
           * enrolled cards take the same treatment so the action does something.
           */}
          {loading
            ? rows.map((r) => (
                <Card key={r.id} className="ml-course ml-course--skel">
                  <Skel className="ml-skel__thumb" />
                  <div className="ml-course__body">
                    <Skel className="ml-skel__line ml-skel__line--title" />
                    <Skel className="ml-skel__line ml-skel__line--sub" />
                    <Skel className="ml-skel__line ml-skel__line--bar" />
                  </div>
                  <Skel className="ml-skel__ring" />
                </Card>
              ))
            : rows.map((r) => (
                <Card key={r.id} className="ml-course" interactive>
                  <CoverChip tint={r.tint} icon={r.icon} size="lg" iconSize={26} />

                  <div className="ml-course__body">
                    <div className="ml-course__title">{r.title}</div>
                    <div className="ml-course__sub">{r.sub}</div>
                    <div className="ml-course__progress">
                      <ProgressBar
                        pct={r.pct}
                        className="ml-course__bar"
                        label={t("screensB.learning.courseProgress", { title: r.title })}
                      />
                      <span className="ml-course__count lp-mono">{r.lessons}</span>
                    </div>
                  </div>

                  <ProgressRing
                    pct={r.pct}
                    size="md"
                    label={t("screensB.learning.courseComplete", { title: r.title })}
                  />

                  <ButtonPrimary className="ml-course__cta" icon="play" iconSize={15} onClick={r.onCta}>
                    {r.cta}
                  </ButtonPrimary>
                </Card>
              ))}
        </div>

        <aside className="ml-aside">
          <div className="ml-live">
            <div className="ml-live__head">
              <Icon name="radio" size={17} />
              <span>{t("screensB.learning.nextLive")}</span>
            </div>
            <div className="ml-live__body">
              <div className="ml-live__title">{live.title}</div>
              <div className="ml-live__when">{sessionWhen}</div>
              <div className="ml-live__count">
                <Icon name="timer" size={16} className="ml-live__ico" />
                <span className="ml-live__clock lp-mono">{countdown(week, elapsed)}</span>
                <span className="ml-live__to">{t("screensB.learning.toGo")}</span>
              </div>
              <ButtonSecondary className="ml-live__cta" onClick={() => go("live")}>
                {t("screensB.learning.sessionDetails")}
              </ButtonSecondary>
            </div>
          </div>

          <Card className="ml-due">
            <div className="ml-due__head">
              <Icon name="clipboard-list" size={16} className="ml-due__headico" />
              <span>{t("screensB.learning.dueThisWeek")}</span>
            </div>
            {dueRows.map((d) => (
              <button key={d.title} type="button" className="lp-row ml-due__row" onClick={d.onClick}>
                <Icon name={d.icon} size={16} className="ml-due__ico" />
                <span className="ml-due__text">
                  <span className="ml-due__title">{d.title}</span>
                  <span className={`ml-due__when${d.overdue ? " is-overdue" : ""}`}>{d.due}</span>
                </span>
                <Icon name="chevron-right" size={15} className="ml-due__ico" />
              </button>
            ))}
          </Card>

          <div className="ml-ann">
            <div className="ml-ann__head">
              <Icon name="megaphone" size={16} className="ml-ann__ico" />
              <span>{LEARNING_ANNOUNCEMENT.title}</span>
            </div>
            <p className="ml-ann__body">{LEARNING_ANNOUNCEMENT.body}</p>
            <span className="ml-ann__at lp-mono">
              {dataSource.instructor().name} · {fmtDate(weekStart(week))}{" "}
              {LEARNING_ANNOUNCEMENT.time}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
