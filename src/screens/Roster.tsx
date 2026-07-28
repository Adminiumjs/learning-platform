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
  const roFilter = useAppStore((s) => s.roFilter);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);

  const students = dataSource.students();
  const behind = students.filter((s) => s[1] < BEHIND_PCT);
  const rows = roFilter === "behind" ? behind : students;

  const filters = [
    { id: "co", label: `Cohort 03 · ${students.length}` },
    { id: "behind", label: `Behind · ${behind.length}` },
  ];

  return (
    <div className="lp-page scr-roster">
      <PageHead
        title="Roster"
        lede={`${students.length} students in cohort 03 · ${behind.length} behind at week ${week}`}
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
          <span>Student</span>
          <span>Progress</span>
          <span className="ro-col--soft">Last active</span>
          <span className="ro-row__end">Average</span>
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
                      Behind
                    </Pill>
                  ) : null}
                </span>
              </span>

              <span className="ro-prog">
                <ProgressBar
                  pct={pct}
                  tone={isBehind ? "warn" : "accent"}
                  className="ro-bar"
                  label={`${name} — course progress`}
                />
                <span className="lp-mono ro-pct">{pct}%</span>
              </span>

              <span className="ro-last ro-col--soft">{last}</span>
              <span className={`lp-mono ro-avg${avg >= STRONG_AVG ? " ro-avg--strong" : ""}`}>
                {avg}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
