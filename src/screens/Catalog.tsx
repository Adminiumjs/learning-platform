/*
 * Catalog — the course grid, the school's front door.
 *
 * Two things the comp measured in JavaScript are CSS here: the card grid is an
 * `auto-fill` track list rather than a column count derived from the window
 * width, and "Browse courses" scrolls the grid into view through a ref instead
 * of the comp's hardcoded `scrollTo({ top: 420 })`.
 *
 * The search box lives in the shared header and writes `q` on the store; this
 * screen only reads it.
 */

import { useRef } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  Cover,
  EmptyState,
  Pill,
  Skel,
} from "../components";
import { AUTUMN_COHORT_START, CATEGORIES, SKELETON_CARDS } from "../data/screens/catalog";
import { dataSource } from "../data/source";
import type { Course } from "../data/types";
import { clockLabel, fmtDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-catalog.css";

/** "Cohort · starts Mon 3 Aug" or "Self-paced" — the card's delivery badge. */
function badgeFor(c: Course): string {
  if (c.kind !== "cohort") return "Self-paced";
  /*
   * Both intake dates are fixed, not read off the demo clock: the badge has to
   * say the same thing after the dock advances a week, or the catalogue would
   * appear to reschedule itself mid-demo.
   */
  const start = c.id === "DS-101" ? weekStart(3) : AUTUMN_COHORT_START;
  return `Cohort · starts ${fmtDate(start)}`;
}

export default function Catalog() {
  const cat = useAppStore((s) => s.cat);
  const q = useAppStore((s) => s.q);
  const week = useAppStore((s) => s.week);
  const loading = useAppStore((s) => s.loading);
  const set = useAppStore((s) => s.set);
  const openCourse = useAppStore((s) => s.openCourse);

  const gridRef = useRef<HTMLDivElement>(null);

  /*
   * A live search query overrides the category chip — the comp's rule, and the
   * reason the chip row keeps rendering "All" as active while you type.
   */
  const query = q.trim().toLowerCase();
  const courses = dataSource.courses().filter((c) =>
    query
      ? `${c.title} ${c.teacher} ${c.cat}`.toLowerCase().includes(query)
      : cat === "all" || c.cat === cat,
  );

  const clearFilters = () => set({ cat: "all", q: "" });

  const browse = () => {
    clearFilters();
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lp-page scr-catalog">
      <section className="scr-catalog__hero">
        <span className="scr-catalog__clock">
          <span className="scr-catalog__dot" />
          Cohort in session · {clockLabel(week)}
        </span>
        <h1 className="scr-catalog__title">
          Learn the craft of digital design, one week at a time.
        </h1>
        <p className="scr-catalog__lede">
          Small classes taught by working designers. Watch a lesson, make the thing, get real
          critique. No fluff, no filler.
        </p>
        <div className="scr-catalog__cta">
          <ButtonPrimary className="scr-catalog__herobtn" onClick={browse}>
            Browse courses
          </ButtonPrimary>
          <ButtonSecondary
            className="scr-catalog__herobtn"
            icon="calendar-days"
            onClick={() => openCourse("DS-101")}
          >
            How cohorts work
          </ButtonSecondary>
        </div>
      </section>

      <div className="scr-catalog__filters">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => set({ cat: c.id })}>
            {c.label}
          </Chip>
        ))}
        <span className="scr-catalog__count">
          {courses.length} {courses.length === 1 ? "course" : "courses"}
        </span>
      </div>

      {/* The anchor the hero scrolls to — outside the branches so it survives
          the empty and loading states. */}
      <div ref={gridRef}>
        {loading ? (
          <div className="scr-catalog__grid">
            {SKELETON_CARDS.map((i) => (
              <div key={i} className="scr-catalog__skel">
                <Skel className="scr-catalog__skelcover" />
                <div className="scr-catalog__skelbody">
                  <Skel className="scr-catalog__skelline scr-catalog__skelline--title" />
                  <Skel className="scr-catalog__skelline scr-catalog__skelline--a" />
                  <Skel className="scr-catalog__skelline scr-catalog__skelline--b" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            className="scr-catalog__empty"
            icon="search-x"
            title={`Nothing matches "${q}" yet.`}
            body="Try a broader word — or browse everything."
            action={{ label: "Show all courses", onClick: clearFilters }}
          />
        ) : (
          <div className="scr-catalog__grid">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                className="lp-card scr-catalog__card"
                onClick={() => openCourse(c.id)}
              >
                <Cover tint={c.tint} icon={c.icon} filename={c.file}>
                  <Pill tone="neutral" className="scr-catalog__level">
                    {c.level}
                  </Pill>
                </Cover>
                <div className="scr-catalog__body">
                  <span className="scr-catalog__name">{c.title}</span>
                  <span className="scr-catalog__teacher">
                    <span className="scr-catalog__ini">{c.teacherIni}</span>
                    {c.teacher}
                  </span>
                  <Pill
                    className="scr-catalog__badge"
                    tone={c.kind === "cohort" ? "accent" : "neutral"}
                    icon={c.kind === "cohort" ? "calendar-days" : "infinity"}
                    iconSize={13}
                  >
                    {badgeFor(c)}
                  </Pill>
                  <span className="scr-catalog__foot">
                    <span className="scr-catalog__meta">
                      {c.lessons} lessons · {c.dur}
                    </span>
                    <span className="scr-catalog__price">${c.price}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
