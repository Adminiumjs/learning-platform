/*
 * Course page — the sales page for one course.
 *
 * Three of the comp's JavaScript branches are media queries in the sheet: the
 * 340px price rail folds under the content below 1000px, the rail only goes
 * sticky above it, and "What you'll learn" drops to one column below 720px.
 *
 * The curriculum is the real one — `isModuleLocked` decides what is open on
 * the demo clock (D6), so flipping the dock to self-paced or advancing a week
 * changes this page the same way it changes the classroom.
 */

import { Avatar, ButtonPrimary, Cover, Icon, Pill, ProgressBar } from "../components";
import type { Tone } from "../components";
import {
  COHORT,
  EFFORT,
  INSTRUCTOR_BIO,
  INSTRUCTOR_TAGLINE,
  LIVE_SLOT,
  PERKS,
  SEATS_LABEL,
  SEATS_TAKEN_PCT,
  SELF_PACED_BLURB,
} from "../data/screens/course";
import { dataSource } from "../data/source";
import type { CourseLevel } from "../data/types";
import {
  addDays,
  fmtDate,
  fmtDateLong,
  isCohort,
  isModuleLocked,
  isPreviewLesson,
  unlockLabel,
  weekStart,
} from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-course.css";

/** The comp's `levelStyle()` map, expressed as design-system tones. */
const LEVEL_TONE: Record<CourseLevel, Tone> = {
  Beginner: "pos",
  Intermediate: "info",
  Advanced: "accent",
};

export default function Course() {
  const courseId = useAppStore((s) => s.courseId);
  const week = useAppStore((s) => s.week);
  const mode = useAppStore((s) => s.mode);
  const openMods = useAppStore((s) => s.openMods);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);

  const course = dataSource.course(courseId);
  const modules = dataSource.modules();
  const kinds = dataSource.lessonKinds();
  const instructor = dataSource.instructor();
  const cohortWeeks = dataSource.cohortWeeks();

  /* A cohort course only *behaves* like one while the app is in cohort mode. */
  const cohort = course.kind === "cohort" && isCohort(mode);

  const enrol = () => {
    /* Clear the last attempt so checkout opens on its first step, not a result. */
    set({ ckDone: false, ckError: false });
    go("checkout");
  };

  const toggleModule = (id: string) =>
    set({ openMods: { ...openMods, [id]: !openMods[id] } });

  return (
    <>
      <div className="lp-page scr-course">
        <button type="button" className="lp-nav scr-course__back" onClick={() => go("catalog")}>
          <Icon name="arrow-left" size={15} />
          All courses
        </button>

        <div className="scr-course__grid">
          <div className="scr-course__main">
            <Cover
              className="scr-course__cover"
              tint={course.tint}
              icon={course.icon}
              iconSize={88}
              filename={course.file}
            />

            <header>
              <div className="scr-course__pills">
                <Pill tone={LEVEL_TONE[course.level]}>{course.level}</Pill>
                <Pill
                  tone={cohort ? "accent" : "neutral"}
                  icon={cohort ? "calendar-days" : "infinity"}
                  iconSize={13}
                >
                  {cohort ? `Cohort · ${cohortWeeks} weeks` : "Self-paced"}
                </Pill>
                <Pill tone="neutral" className="scr-course__code">
                  {course.id}
                </Pill>
              </div>
              <h1 className="scr-course__title">{course.title}</h1>
              <p className="scr-course__blurb">{course.blurb}</p>
            </header>

            <section className="scr-course__panel">
              <h2 className="scr-course__panelhead">What you'll learn</h2>
              <div className="scr-course__learn">
                {dataSource.learningOutcomes().map((l) => (
                  <p key={l.t} className="scr-course__learnrow">
                    <Icon name="check" size={16} className="scr-course__tick" />
                    {l.t}
                  </p>
                ))}
              </div>
            </section>

            <section>
              <div className="scr-course__currhead">
                <h2 className="scr-course__currtitle">Curriculum</h2>
                <span className="scr-course__currmeta">
                  {course.lessons} lessons · {course.dur} · {modules.length} modules
                </span>
              </div>

              <div className="scr-course__modules">
                {modules.map((m) => {
                  const locked = isModuleLocked(m, week, mode);
                  const open = !!openMods[m.id];
                  return (
                    <div key={m.id} className="scr-course__module">
                      <button
                        type="button"
                        className="lp-row scr-course__modhead"
                        onClick={() => toggleModule(m.id)}
                        aria-expanded={open}
                      >
                        <span className={`scr-course__modnum${locked ? " is-locked" : ""}`}>
                          {m.num}
                        </span>
                        <span className="scr-course__modtext">
                          <span className="scr-course__modtitle">{m.title}</span>
                          <span className="scr-course__modsub">
                            {isCohort(mode)
                              ? `Week ${m.week} · ${fmtDate(weekStart(m.week))} · `
                              : ""}
                            {m.lessons.length} lessons
                          </span>
                        </span>
                        <Pill tone={locked ? "neutral" : "pos"}>
                          {locked ? unlockLabel(m) : "Open"}
                        </Pill>
                        <Icon
                          name="chevron-right"
                          size={18}
                          className={`scr-course__chev${open ? " is-open" : ""}`}
                        />
                      </button>

                      {open ? (
                        <div className="scr-course__lessons">
                          {m.lessons.map((l) => {
                            /* The first two lessons are the free preview (D6). */
                            const preview = !locked && isPreviewLesson(l.id);
                            const kind = kinds[l.kind];
                            return (
                              <div
                                key={l.id}
                                className={`scr-course__lesson${locked ? " is-locked" : ""}`}
                              >
                                <Icon
                                  name={locked ? "lock" : kind.i}
                                  size={16}
                                  className={`scr-course__lessonico${preview ? " is-preview" : ""}`}
                                />
                                <span className="scr-course__lessontitle">{l.title}</span>
                                {preview ? (
                                  <Pill tone="accent">Preview</Pill>
                                ) : (
                                  <span className="scr-course__lessontag">
                                    {locked ? unlockLabel(m) : kind.l}
                                  </span>
                                )}
                                <span className="scr-course__lessondur">{l.dur}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="scr-course__teacher">
              <Avatar initials={instructor.initials} size="xl" />
              <div className="scr-course__teachertext">
                <span className="scr-course__teachername">{instructor.name}</span>
                <span className="scr-course__teacherrole">{INSTRUCTOR_TAGLINE}</span>
                <p className="scr-course__teacherbio">{INSTRUCTOR_BIO}</p>
              </div>
            </section>
          </div>

          <aside className="scr-course__rail">
            <div className="scr-course__buy">
              <div className="scr-course__pricerow">
                <span className="scr-course__price">${course.price}</span>
                <span className="scr-course__pricenote">one payment</span>
              </div>

              {cohort ? (
                <div className="scr-course__facts">
                  <span className="scr-course__factshead">
                    <Icon name="users" size={15} className="scr-course__factsico" />
                    Cohort {COHORT.label}
                  </span>
                  <span className="scr-course__fact">
                    <span className="scr-course__factk">Starts</span>
                    <span className="scr-course__factv lp-mono">{fmtDateLong(weekStart(1))}</span>
                  </span>
                  <span className="scr-course__fact">
                    <span className="scr-course__factk">Ends</span>
                    <span className="scr-course__factv lp-mono">
                      {fmtDateLong(addDays(weekStart(cohortWeeks), 4))}
                    </span>
                  </span>
                  <span className="scr-course__fact">
                    <span className="scr-course__factk">Live session</span>
                    <span className="scr-course__factv">{LIVE_SLOT}</span>
                  </span>
                  <span className="scr-course__fact">
                    <span className="scr-course__factk">Effort</span>
                    <span className="scr-course__factv">{EFFORT}</span>
                  </span>
                  <div className="scr-course__seats">
                    <ProgressBar
                      className="scr-course__seatbar"
                      pct={SEATS_TAKEN_PCT}
                      tone="warn"
                      label="Seats taken"
                    />
                    <span className="scr-course__seatslabel">{SEATS_LABEL}</span>
                  </div>
                </div>
              ) : (
                <div className="scr-course__facts scr-course__facts--self">
                  <span className="scr-course__factshead">
                    <Icon name="infinity" size={15} className="scr-course__factsico" />
                    Self-paced
                  </span>
                  {SELF_PACED_BLURB}
                </div>
              )}

              <ButtonPrimary className="scr-course__enrol" onClick={enrol}>
                {cohort ? `Enrol — cohort ${COHORT.no}` : "Enrol and start today"}
              </ButtonPrimary>

              <div className="scr-course__perks">
                {PERKS.map((p) => (
                  <span key={p.t} className="scr-course__perk">
                    <Icon name={p.i} size={15} className="scr-course__perkico" />
                    {p.t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="scr-course__sticky">
        <div className="scr-course__stickyinner">
          <div className="scr-course__stickytext">
            <span className="scr-course__stickytitle">{course.title}</span>
            <span className="scr-course__stickysub">
              {cohort ? `Cohort ${COHORT.no} · ${SEATS_LABEL}` : "Self-paced · lifetime access"}
            </span>
          </div>
          <span className="scr-course__stickyprice">${course.price}</span>
          <ButtonPrimary className="scr-course__stickybtn" onClick={enrol}>
            Enrol
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
}
