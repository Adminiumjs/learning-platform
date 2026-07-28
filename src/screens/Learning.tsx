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
import {
  allLessons,
  clockLabel,
  countdown,
  doneCount,
  dueDate,
  fmtDate,
  fmtDateLong,
  isCohort,
  liveDate,
  progressPct,
  weekStart,
} from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-learning.css";

/** The week the specimen assignment is set in; past it, the row reads overdue. */
const ASSIGNMENT_WEEK = 3;

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

  const rows: CourseRow[] = [
    {
      id: cohortCourse.id,
      title: cohortCourse.title,
      tint: cohortCourse.tint,
      icon: cohortCourse.icon,
      sub: [
        isCohort(mode) ? `Cohort 03 · week ${week} of ${weeks}` : "Self-paced",
        nextUp ? `next: ${nextUp}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      pct: progressPct(done),
      lessons: `${doneCount(done)} / ${totalLessons} lessons`,
      cta: "Continue",
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
      sub: `Self-paced · next: ${selfEnrolment.next ?? "—"}`,
      pct: Math.round((doneN / selfEnrolment.total) * 100),
      lessons: `${doneN} / ${selfEnrolment.total} lessons`,
      cta: "Resume",
      onCta: () =>
        showToast(
          "Type & Layout opens in the classroom too — this demo follows the cohort course.",
          "info",
        ),
    });
  }

  const overdue = week > ASSIGNMENT_WEEK;
  const dueRows = [
    {
      title: "Type specimen page",
      icon: "pen-line",
      due: `${overdue ? "Overdue · was due " : "Due "}${fmtDate(dueDate())} 23:59`,
      overdue,
      onClick: () => go("assignment"),
    },
    {
      title: "Watch: Grids and rhythm",
      icon: "play",
      due: "18:30 · you are 39% through",
      overdue: false,
      onClick: () => go("classroom"),
    },
    {
      title: "Read: Spacing tokens",
      icon: "book-open",
      due: "6 min",
      overdue: false,
      onClick: () => {
        set({ lesson: "L13" });
        go("classroom");
      },
    },
  ];

  const sessionEnd = live.hour + Math.round(live.durationMin / 60);
  const sessionWhen = `${fmtDateLong(liveDate(week, live.dayOffset, live.hour))} · ${live.hour}:00–${sessionEnd}:00 ${live.timezone}`;

  return (
    <div className="lp-page scr-learning">
      <PageHead
        title="My learning"
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
                        label={`${r.title} progress`}
                      />
                      <span className="ml-course__count lp-mono">{r.lessons}</span>
                    </div>
                  </div>

                  <ProgressRing pct={r.pct} size="md" label={`${r.title} complete`} />

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
              <span>Next live session</span>
            </div>
            <div className="ml-live__body">
              <div className="ml-live__title">{live.title}</div>
              <div className="ml-live__when">{sessionWhen}</div>
              <div className="ml-live__count">
                <Icon name="timer" size={16} className="ml-live__ico" />
                <span className="ml-live__clock lp-mono">{countdown(week, elapsed)}</span>
                <span className="ml-live__to">to go</span>
              </div>
              <ButtonSecondary className="ml-live__cta" onClick={() => go("live")}>
                Session details
              </ButtonSecondary>
            </div>
          </div>

          <Card className="ml-due">
            <div className="ml-due__head">
              <Icon name="clipboard-list" size={16} className="ml-due__headico" />
              <span>Due this week</span>
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
