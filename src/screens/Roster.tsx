/*
 * Roster.
 *
 * Thirty students, one row each: how far through they are, when they were
 * last seen, and what they average. The "Behind" filter is the whole point of
 * the screen — it turns thirty rows into the eight conversations Yara owes
 * someone this week.
 *
 * Everything is derived, nothing is stored: the counts, the sub-heading and
 * both filter labels come off `dataSource.students()`, so a real roster of 47
 * people needs no edit here. The comp hardcoded "30" in three places.
 */

import { Avatar, Chip, ChipRow, PageHead, Pill, ProgressBar } from "../components";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-roster.css";

/** Below half-way through the course counts as behind. The comp's rule. */
const BEHIND_PCT = 50;
/** A grade average at or above this reads in the positive tone. */
const STRONG_AVG = 85;

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Roster() {
  const { t, number } = useI18n();
  const roFilter = useAppStore((s) => s.roFilter);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);

  const students = dataSource.students();
  const behind = students.filter((s) => s[1] < BEHIND_PCT);
  const rows = roFilter === "behind" ? behind : students;

  const filters = [
    { id: "co", label: t("screensB.roster.filterCohort", { total: number(students.length) }) },
    { id: "behind", label: t("screensB.roster.filterBehind", { total: number(behind.length) }) },
  ];

  return (
    <div className="lp-page scr-roster">
      <PageHead
        title={t("screensB.roster.title")}
        lede={t("screensB.roster.lede", {
          students: number(students.length),
          behind: number(behind.length),
          week: number(week),
        })}
        action={
          <ChipRow>
            {filters.map((f) => (
              <Chip
                key={f.id}
                className="ro-chip"
                active={roFilter === f.id}
                onClick={() => set({ roFilter: f.id })}
              >
                {f.label}
              </Chip>
            ))}
          </ChipRow>
        }
      />

      <div className="lp-list ro-table">
        <div className="ro-row ro-row--head">
          <span>{t("screensB.roster.colStudent")}</span>
          <span>{t("screensB.roster.colProgress")}</span>
          <span className="ro-col--soft">{t("screensB.roster.colLastActive")}</span>
          <span className="ro-row__end">{t("screensB.roster.colAverage")}</span>
        </div>

        {rows.map(([name, pct, last, avg]) => {
          const isBehind = pct < BEHIND_PCT;
          return (
            <div className="lp-row ro-row" key={name}>
              <span className="ro-who">
                <Avatar
                  initials={initials(name)}
                  size="sm"
                  className={`ro-ava${isBehind ? " ro-ava--behind" : ""}`}
                />
                <span className="ro-who__text">
                  <span className="ro-who__name">{name}</span>
                  {isBehind ? (
                    <Pill tone="warn" icon="triangle-alert" iconSize={11} className="ro-behind">
                      {t("screensB.roster.behind")}
                    </Pill>
                  ) : null}
                </span>
              </span>

              <span className="ro-prog">
                <ProgressBar
                  pct={pct}
                  tone={isBehind ? "warn" : "accent"}
                  className="ro-bar"
                  label={t("screensB.roster.progressAria", { name })}
                />
                <span className="lp-mono ro-pct">{number(pct / 100, { style: "percent" })}</span>
              </span>

              <span className="ro-last ro-col--soft">{last}</span>
              <span className={`lp-mono ro-avg${avg >= STRONG_AVG ? " ro-avg--strong" : ""}`}>
                {number(avg / 100, { style: "percent" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
