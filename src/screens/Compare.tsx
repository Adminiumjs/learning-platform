/*
 * Compare — self-paced or cohort.
 *
 * The screen a hesitating buyer lands on: two priced columns, then the eight
 * rows that actually differ. Picking a column is not just a highlight — it
 * flips the app's course mode (which drives every lock and date in the demo)
 * and opens the matching course.
 */

import { Card, Icon, Pill } from "../components";
import {
  COMPARE_OPTIONS,
  COMPARE_ROWS,
  isAbsent,
  type CompareOption,
} from "../data/screens/compare";
import { useAppStore } from "../state/store";
import "../styles/screen-compare.css";

export default function Compare() {
  const cmPick = useAppStore((s) => s.cmPick);
  const set = useAppStore((s) => s.set);
  const openCourse = useAppStore((s) => s.openCourse);

  /* Picking a column sets the demo's course mode too, so the course page it
     opens is already telling the right story. */
  const pick = (o: CompareOption) => {
    set({ cmPick: o.k, mode: o.k });
    openCourse(o.courseId);
  };

  return (
    <div className="lp-page scr-compare">
      <div className="cp-intro">
        <h1 className="cp-intro__title">Self-paced or cohort?</h1>
        <p className="cp-intro__lede">
          Same material, same teacher. The difference is whether anyone is waiting for you
          on Thursday.
        </p>
      </div>

      <div className="cp-cols">
        {COMPARE_OPTIONS.map((o) => {
          const picked = cmPick === o.k;
          return (
            <Card key={o.k} className={`cp-col${picked ? " is-picked" : ""}`}>
              <div className="cp-col__head">
                <span className="cp-col__ico">
                  <Icon name={o.icon} size={18} />
                </span>
                <span className="cp-col__title">{o.title}</span>
                {picked ? (
                  /* Solid accent, not the soft `accent` tone — it has to read on
                     the accent-washed card behind it. */
                  <Pill tone="accent" className="cp-pick">
                    Your pick
                  </Pill>
                ) : null}
              </div>

              <div className="cp-col__price">
                <span className="cp-col__amount lp-mono">{o.price}</span>
                <span className="cp-col__per">{o.priceSub}</span>
              </div>

              <p className="cp-col__blurb">{o.blurb}</p>

              <button
                type="button"
                className={`lp-btn cp-col__cta${picked ? " is-picked" : ""}`}
                onClick={() => pick(o)}
              >
                {o.cta}
              </button>
            </Card>
          );
        })}
      </div>

      <div className="cp-table">
        <div className="cp-table__head">
          <span />
          <span>Self-paced</span>
          <span>Cohort</span>
        </div>
        {COMPARE_ROWS.map((r) => (
          <div key={r.k} className="lp-row cp-table__row">
            <span className="cp-table__k">{r.k}</span>
            <span className={`cp-table__a${isAbsent(r.self) ? " is-absent" : ""}`}>{r.self}</span>
            <span className="cp-table__b">{r.cohort}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
