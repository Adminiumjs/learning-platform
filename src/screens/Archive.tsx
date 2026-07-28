/*
 * Course archive — the shelf of everything the student has bought.
 *
 * Four courses in four different afterlives: two on the go, one paused, one
 * retired by its instructor and kept anyway. The screen exists to make the
 * promise underneath it visible — a finished course does not disappear, and
 * neither do the notes, the case study or the certificate that came with it.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  ChipRow,
  CoverChip,
  Icon,
  PageHead,
  Pill,
  ProgressBar,
} from "../components";
import type { Tone } from "../components";
import { ARCHIVE_FILTERS, ARCHIVE_KEPT, ARCHIVE_SHELF } from "../data/screens/archive";
import { dataSource } from "../data/source";
import type { EnrolledCourse } from "../data/types";
import { progressPct } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-archive.css";

/** How each enrolment state presents itself on the shelf. */
const STATE_PILL: Record<EnrolledCourse["state"], { tone: Tone; label: string }> = {
  active: { tone: "accent", label: "In progress" },
  paused: { tone: "warn", label: "Paused" },
  retired: { tone: "neutral", label: "Retired" },
};

/** What each state's primary button offers to do next. */
const STATE_CTA: Record<EnrolledCourse["state"], string> = {
  active: "Continue",
  paused: "Pick it up",
  retired: "Revisit",
};

export default function Archive() {
  const arFilter = useAppStore((s) => s.arFilter);
  const week = useAppStore((s) => s.week);
  const done = useAppStore((s) => s.done);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const enrolled = dataSource.enrolled();

  const shelf = ARCHIVE_SHELF.flatMap((entry) => {
    const course = enrolled.find((e) => e.id === entry.id);
    if (!course) return [];
    /* `done: null` on the enrolment record means "reads live" — that is the
       cohort course the classroom is actually tracking. */
    const pct =
      course.done === null ? progressPct(done) : Math.round((course.done / course.total) * 100);
    return [{ entry, course, pct }];
  });

  /* "Finished" has to include the retired course: it is the only one at 100%,
     and being retired by the instructor is not the same as being unfinished. */
  const list = shelf.filter(
    ({ course }) =>
      arFilter === "all" ||
      course.state === arFilter ||
      (arFilter === "done" && course.state === "retired"),
  );

  return (
    <div className="lp-page scr-archive">
      <PageHead
        className="ar-head"
        title="Archive"
        lede={`${shelf.length} courses on your shelf · one finished last year, two on the go`}
        action={
          <ChipRow>
            {ARCHIVE_FILTERS.map((f) => (
              <Chip
                key={f.id}
                active={arFilter === f.id}
                onClick={() => set({ arFilter: f.id })}
                className="ar-filter"
              >
                {f.label}
              </Chip>
            ))}
          </ChipRow>
        }
      />

      <div className="ar-shelf">
        {list.map(({ entry, course, pct }) => {
          const pill = STATE_PILL[course.state];
          return (
            <div
              className={`lp-cardbox lp-card ar-card${
                course.state === "retired" ? " ar-card--retired" : ""
              }`}
              key={course.id}
            >
              <CoverChip tint={course.tint} icon={course.icon} size="lg" iconSize={24} />

              <div className="ar-card__main">
                <div className="ar-card__titlerow">
                  <span className="ar-card__title">{course.title}</span>
                  <Pill tone={pill.tone}>{pill.label}</Pill>
                </div>
                <div className="ar-card__meta">{entry.meta(course)}</div>
                <div className="ar-card__progress">
                  <ProgressBar
                    pct={pct}
                    tone={pct === 100 ? "pos" : "accent"}
                    label={`${course.title} progress`}
                    className="ar-card__bar"
                  />
                  <span className="lp-mono ar-card__pct">{pct}%</span>
                </div>
              </div>

              <div className="ar-card__side">
                <span className="lp-mono ar-card__line">{entry.line(course, week)}</span>
                <div className="ar-card__buttons">
                  <ButtonSecondary
                    icon="award"
                    iconSize={14}
                    className={entry.cert ? "ar-cert" : "ar-cert ar-cert--off"}
                    onClick={() =>
                      entry.cert
                        ? go("certificate")
                        : showToast("Finish it and the certificate is yours.", "lock")
                    }
                  >
                    {entry.cert ? "Certificate" : "No certificate"}
                  </ButtonSecondary>
                  <ButtonPrimary
                    className="ar-cta"
                    onClick={() =>
                      course.id === "DS-101"
                        ? go("classroom")
                        : showToast(`“${course.title}” reopens where you left it.`, "play")
                    }
                  >
                    {STATE_CTA[course.state]}
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lp-list ar-kept">
        <div className="ar-kept__head">
          <Icon name="folder-clock" size={16} className="ar-kept__ico" />
          <span className="ar-kept__title">Kept from finished courses</span>
          <span className="ar-kept__note">Yours to keep, forever</span>
        </div>
        {ARCHIVE_KEPT.map((k) => (
          <button
            type="button"
            className="lp-list__row lp-row ar-keep"
            key={k.title}
            onClick={() => go(k.go)}
          >
            <span className="ar-keep__ico">
              <Icon name={k.icon} size={15} />
            </span>
            <span className="ar-keep__text">
              <span className="ar-keep__title">{k.title}</span>
              <span className="ar-keep__sub">{k.sub}</span>
            </span>
            <span className="lp-mono ar-keep__meta">{k.meta}</span>
            <Icon name="chevron-right" size={15} className="ar-keep__chev" />
          </button>
        ))}
      </div>
    </div>
  );
}
