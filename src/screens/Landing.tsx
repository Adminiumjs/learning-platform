/*
 * Course landing page — the long-form sales page for the cohort course.
 *
 * Full-bleed (`lp-page--flush`): the hero band runs edge to edge and each
 * section centres its own 1240px column. The comp's single JS breakpoint here
 * was `S.w < 900`; it is one media query in the sheet, and every block ships
 * its markup in both layouts.
 *
 * The hero wash is the course tint at 12% (16% in dark). It arrives as the
 * `--tint` custom property so the colour stays data and the alpha stays CSS.
 */

import type { CSSProperties } from "react";
import { Avatar, ButtonPrimary, ButtonSecondary, Cover, Icon } from "../components";
import {
  COHORT_4,
  COHORT_4_OPENS,
  FAQ,
  PAINS,
  PROOF,
  TEACHER_BIO,
  WEEKS,
} from "../data/screens/landing";
import { dataSource } from "../data/source";
import { fmtDateLong } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-landing.css";

export default function Landing() {
  const faqOpen = useAppStore((s) => s.lpFaq);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openCourse = useAppStore((s) => s.openCourse);

  const course = dataSource.course("DS-101");
  const instructor = dataSource.instructor();

  const enrol = () => {
    /*
     * The comp cleared `ckDone` but not `ckError` here (the course page cleared
     * both), so an earlier declined card followed you back into checkout.
     */
    set({ courseId: course.id, ckDone: false, ckError: false });
    go("checkout");
  };

  return (
    <div className="lp-page lp-page--flush scr-landing">
      <section
        className="scr-landing__hero"
        style={{ "--tint": course.tint } as CSSProperties}
      >
        <div className="scr-landing__heroinner">
          <div className="scr-landing__herotext">
            <span className="scr-landing__urgency">
              <span className="scr-landing__dot" />
              Cohort {COHORT_4.no} · {COHORT_4.sold} of {COHORT_4.seats} seats sold
            </span>
            <h1 className="scr-landing__title">Stop rebuilding the same button.</h1>
            <p className="scr-landing__lede">
              Eight weeks, thirty people, one system built from your own product. You leave with a
              documented library and the arguments to defend it.
            </p>
            <div className="scr-landing__cta">
              <ButtonPrimary className="scr-landing__ctabtn" onClick={enrol}>
                Enrol · ${course.price}
              </ButtonPrimary>
              <ButtonSecondary
                className="scr-landing__ctabtn"
                icon="list-tree"
                onClick={() => openCourse(course.id)}
              >
                See the syllabus
              </ButtonSecondary>
            </div>
            <div className="scr-landing__proof">
              {PROOF.map((p) => (
                <span key={p.k} className="scr-landing__proofitem">
                  <span className="scr-landing__proofv">{p.v}</span>
                  <span className="scr-landing__proofk">{p.k}</span>
                </span>
              ))}
            </div>
          </div>

          <Cover
            className="scr-landing__cover"
            tint={course.tint}
            icon={course.icon}
            iconSize={110}
            angle="150deg"
            filename={course.file}
          />
        </div>
      </section>

      <section className="scr-landing__body">
        <div className="scr-landing__pains">
          <div className="scr-landing__painlede">
            <h2 className="scr-landing__h2">
              You already have a design system. It's just spread across nine files and two people's
              heads.
            </h2>
            <p className="scr-landing__p">
              Most teams don't need more components. They need names they agree on, tokens that
              survive a rebrand, and documentation somebody actually reads. That's the whole course.
            </p>
          </div>
          <div className="scr-landing__painlist">
            {PAINS.map((p) => (
              <p key={p.t} className="scr-landing__pain">
                <Icon name={p.i} size={17} className="scr-landing__painico" />
                {p.t}
              </p>
            ))}
          </div>
        </div>

        <div className="scr-landing__weeks">
          <div className="scr-landing__weekshead">
            <h2 className="scr-landing__h2 scr-landing__h2--sm">Eight weeks, week by week</h2>
            <span className="scr-landing__weeksmeta">
              {course.lessons} lessons · {course.dur} · 4 graded assignments
            </span>
          </div>
          <div className="scr-landing__weekgrid">
            {WEEKS.map((w) => (
              <div key={w.n} className="lp-card scr-landing__week">
                <span className="scr-landing__weekno">{w.n}</span>
                <span className="scr-landing__weektitle">{w.title}</span>
                <span className="scr-landing__weeksub">{w.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <figure className="scr-landing__quote">
          <Icon name="quote" size={26} className="scr-landing__quoteico" />
          <blockquote className="scr-landing__quotetext">
            “I came in with a folder of components and left with a system I can defend in a
            meeting.”
          </blockquote>
          <figcaption className="scr-landing__quotewho">
            <span className="scr-landing__quoteini">IH</span>
            <span>
              <span className="scr-landing__quotename">Ingrid Halvorsen</span>
              <span className="scr-landing__quoterole">
                Cohort 02 · now runs the system at Nordre
              </span>
            </span>
            <button
              type="button"
              className="lp-nav scr-landing__quotelink"
              onClick={() => go("reviews")}
            >
              All 6 reviews
            </button>
          </figcaption>
        </figure>

        <div className="scr-landing__teachgrid">
          <div className="scr-landing__teach">
            <Avatar initials={instructor.initials} size="xl" accent />
            <div className="scr-landing__teachtext">
              <span className="scr-landing__teachname">{instructor.name}</span>
              <span className="scr-landing__teachrole">Design lead, 14 years</span>
              <p className="scr-landing__teachbio">{TEACHER_BIO}</p>
            </div>
          </div>

          <div className="scr-landing__faq">
            {FAQ.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q} className="scr-landing__faqitem">
                  <button
                    type="button"
                    className="lp-row scr-landing__faqq"
                    onClick={() => set({ lpFaq: open ? -1 : i })}
                    aria-expanded={open}
                  >
                    <span className="scr-landing__faqlabel">{f.q}</span>
                    <Icon
                      name="chevron-right"
                      size={17}
                      className={`scr-landing__faqchev${open ? " is-open" : ""}`}
                    />
                  </button>
                  {open ? <p className="scr-landing__faqa">{f.a}</p> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="scr-landing__final">
          <div className="scr-landing__finaltext">
            <span className="scr-landing__finaltitle">
              Cohort {COHORT_4.no} opens {fmtDateLong(COHORT_4_OPENS)}
            </span>
            <span className="scr-landing__finalsub">
              {COHORT_4.seats - COHORT_4.sold} of {COHORT_4.seats} seats left ·{" "}
              {COHORT_4.funded} funded places each cohort
            </span>
          </div>
          <div className="scr-landing__finalcta">
            <ButtonSecondary
              className="scr-landing__finalbtn"
              onClick={() => go("scholarship")}
            >
              Apply for a scholarship
            </ButtonSecondary>
            <ButtonPrimary className="scr-landing__finalbtn" onClick={enrol}>
              Enrol · ${course.price}
            </ButtonPrimary>
          </div>
        </div>
      </section>
    </div>
  );
}
