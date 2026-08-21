/*
 * Instructor analytics — how cohort 03 is actually going.
 *
 * The comp declared `var doneW = this.state.week` in this screen's logic and
 * then never used it: its column chart drew three weeks of data no matter
 * where the demo clock stood, so rewinding to week 1 still showed week 3's
 * numbers. That dead variable is wired to its evident purpose here — a week
 * later than the demo clock is drawn as unwritten, and the chart total counts
 * only the weeks that have happened. At the default week 3 the chart is
 * identical to the comp's; at week 1 it stops claiming to know the future.
 * The gate applies to the week series only: "All time" is cohorts, not weeks.
 *
 * The KPI deltas asked for lucide's `trending-up` / `trending-down`, neither
 * of which is in the app's shared icon registry (and a screen may not add to
 * it). `arrow-big-up`, rotated for the down case, carries the same reading
 * from the registry the app already has.
 */

import { Icon, Pill, ProgressBar, Segmented } from "../components";
import type { SegmentOption, Tone } from "../components";
import {
  ALL_SERIES,
  BAR_FLAT_PX,
  BAR_MAX_PX,
  BAR_MIN_PX,
  DROP_BAD,
  DROP_MID,
  INSIGHT,
  KPIS,
  LESSON_STATS,
  RANGES,
  SHORT_RANGE_WEEKS,
  SOURCES,
  WEEK_SERIES,
} from "../data/screens/analytics";
import type { Bar, Trend } from "../data/screens/analytics";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-analytics.css";

const RANGE_OPTIONS: SegmentOption<string>[] = RANGES.map((r) => ({ id: r.id, label: r.label }));

const TREND_ICON: Record<Trend, string> = {
  up: "arrow-big-up",
  down: "arrow-big-up",
  flat: "minus",
};

/** A column the chart draws, once the demo clock has had its say. */
interface Column extends Bar {
  future: boolean;
}

function dropTone(drop: number): Tone {
  if (drop >= DROP_BAD) return "warn";
  return drop >= DROP_MID ? "neutral" : "pos";
}

export default function Analytics() {
  const { t, number } = useI18n();
  const anRange = useAppStore((s) => s.anRange);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);

  const cohortWeeks = dataSource.cohortWeeks();

  /* "All time" counts cohorts, so the demo clock has no say over it; the two
     week ranges do, and a week past the clock has not been taught yet. */
  const columns: Column[] =
    anRange === "all"
      ? ALL_SERIES.map((b) => ({ ...b, future: b.n === 0 }))
      : (anRange === "4w" ? WEEK_SERIES.slice(0, SHORT_RANGE_WEEKS) : WEEK_SERIES).map((b, i) => ({
          ...b,
          future: b.n === 0 || i + 1 > week,
        }));

  const peak = Math.max(...columns.map((c) => (c.future ? 0 : c.n)), 1);
  const watched = columns.reduce((sum, c) => sum + (c.future ? 0 : c.n), 0);

  /** Percentages are a locale's business too — "44 %" in French, "٤٤٪" in Arabic. */
  const pct = (value: number): string =>
    number(value / 100, { style: "percent", maximumFractionDigits: 0 });

  return (
    <div className="lp-page scr-analytics">
      <header className="an-head">
        <div className="an-head__text">
          <h1 className="an-title">{t("screensA.analytics.title")}</h1>
          <p className="an-lede">
            {t("screensA.analytics.lede", {
              course: dataSource.course("DS-101").title,
              week: number(week),
              total: number(cohortWeeks),
            })}
          </p>
        </div>
        <Segmented
          className="an-ranges"
          options={RANGE_OPTIONS}
          value={anRange}
          onChange={(r) => set({ anRange: r })}
          label={t("screensA.analytics.rangeLabel")}
        />
      </header>

      <div className="an-kpis">
        {KPIS.map((k) => (
          <div key={k.label} className="an-kpi">
            <span className="an-kpi__label">
              <Icon name={k.icon} size={15} />
              {k.label}
            </span>
            <span className="lp-mono an-kpi__value">{k.value}</span>
            <span className={`an-kpi__delta an-kpi__delta--${k.trend}`}>
              <Icon name={TREND_ICON[k.trend]} size={13} className="an-kpi__arrow" />
              {k.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="an-grid">
        <section className="an-card an-chart">
          <div className="an-chart__head">
            <h2 className="an-card__title">{t("screensA.analytics.chartTitle")}</h2>
            <span className="lp-mono an-chart__total">
              {t("screensA.analytics.watched", { count: number(watched) }, watched)}
            </span>
          </div>

          <div className="an-bars">
            {columns.map((c) => (
              <div key={c.label} className="an-bar">
                <span className="lp-mono an-bar__n">{c.future ? "—" : number(c.n)}</span>
                <span
                  className={`an-bar__fill${c.future ? " an-bar__fill--future" : ""}`}
                  style={{
                    blockSize: c.future
                      ? `${BAR_FLAT_PX}px`
                      : `${Math.round((c.n / peak) * BAR_MAX_PX) + BAR_MIN_PX}px`,
                  }}
                />
                <span className={`an-bar__label${c.future ? " an-bar__label--future" : ""}`}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="an-card an-sources">
          <h2 className="an-card__title">{t("screensA.analytics.sourcesTitle")}</h2>
          {SOURCES.map((s) => (
            <div key={s.label} className="an-source">
              <div className="an-source__top">
                <span className="an-source__label">{s.label}</span>
                <span className="lp-mono an-source__pct">{pct(s.pct)}</span>
              </div>
              <ProgressBar
                className="an-source__bar"
                pct={s.pct}
                label={t("screensA.analytics.sourceShare", { source: s.label })}
              />
            </div>
          ))}
        </section>
      </div>

      <section className="an-table">
        <header className="an-table__head">
          <h2 className="an-card__title">{t("screensA.analytics.tableTitle")}</h2>
          <span className="an-table__sort">{t("screensA.analytics.sortedByDrop")}</span>
        </header>

        <div className="an-cols an-cols--head">
          <span>{t("screensA.analytics.colLesson")}</span>
          <span className="an-col--views an-col--end">{t("screensA.analytics.colViews")}</span>
          <span className="an-col--end">{t("screensA.analytics.colCompleted")}</span>
          <span className="an-col--watch an-col--end">{t("screensA.analytics.colWatch")}</span>
          <span className="an-col--end">{t("screensA.analytics.colDrop")}</span>
        </div>

        {LESSON_STATS.map((r) => (
          <div key={r.title} className="lp-row an-cols an-cols--row">
            <span className="an-lesson">
              <span className="an-lesson__title">{r.title}</span>
              <span className="an-lesson__mod">{r.mod}</span>
            </span>
            <span className="lp-mono an-num an-col--views">{number(r.views)}</span>
            <span className="lp-mono an-num">
              {t("screensA.analytics.completedOf", {
                done: number(r.done),
                pct: pct((r.done / r.views) * 100),
              })}
            </span>
            <span className="lp-mono an-num an-col--watch">{r.watch}</span>
            <span className="an-dropcell">
              <Pill tone={dropTone(r.drop)}>{pct(r.drop)}</Pill>
            </span>
          </div>
        ))}

        <div className="an-insight">
          <Icon name="triangle-alert" size={17} className="an-insight__ico" />
          <p className="an-insight__text">{INSIGHT}</p>
        </div>
      </section>
    </div>
  );
}
