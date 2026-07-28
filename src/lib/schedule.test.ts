/*
 * The drip / unlock engine (spec 20 D6).
 *
 * These tests exist because the drip is the app's signature behaviour and the
 * easiest thing to break silently: an off-by-one in the week comparison, or a
 * stray `Date.now()`, and locks stop matching what the UI promises.
 *
 * The whole suite is deterministic because the engine is — cohort week 1 is
 * pinned to Monday 20 July 2026, so these assertions hold on any machine on
 * any day.
 */

import { describe, expect, it } from "vitest";
import { MODULES, TOTAL_LESSONS } from "../data/demo";
import {
  addDays,
  allLessons,
  clockLabel,
  countdown,
  demoNow,
  doneCount,
  dueDate,
  fmtDate,
  fmtDateLong,
  hhmmss,
  isCohort,
  isModuleLocked,
  isPreviewLesson,
  lessonById,
  lessonSeconds,
  mmss,
  playheadPos,
  progressPct,
  unlockLabel,
  weekStart,
} from "./schedule";

describe("the demo clock", () => {
  it("anchors cohort week 1 to Monday 20 July 2026", () => {
    const w1 = weekStart(1);
    expect(fmtDateLong(w1)).toBe("Mon 20 Jul 2026");
    /* 1 === Monday in JS's zero-indexed, Sunday-first week. */
    expect(w1.getDay()).toBe(1);
  });

  it("advances exactly seven days a week, and every week starts on a Monday", () => {
    for (let w = 1; w <= 8; w++) {
      expect(weekStart(w).getDay()).toBe(1);
    }
    expect(weekStart(3).getTime() - weekStart(1).getTime()).toBe(14 * 86400_000);
    expect(fmtDate(weekStart(3))).toBe("Mon 3 Aug");
    expect(fmtDate(weekStart(8))).toBe("Mon 7 Sep");
  });

  it("clamps below week 1 rather than running backwards into June", () => {
    expect(weekStart(0).getTime()).toBe(weekStart(1).getTime());
    expect(weekStart(-4).getTime()).toBe(weekStart(1).getTime());
  });

  it("puts 'now' mid-week so week 3 is open but Thursday is still ahead", () => {
    const now = demoNow(3);
    expect(now.getDay()).toBe(2); // Tuesday
    expect(now.getHours()).toBe(10);
    expect(now.getTime()).toBeGreaterThan(weekStart(3).getTime());
    expect(now.getTime()).toBeLessThan(weekStart(4).getTime());
  });

  it("reads the dock's label straight off the week number", () => {
    expect(clockLabel(3)).toBe("Week 3 of 8 · Mon 3 Aug");
    expect(clockLabel(1)).toBe("Week 1 of 8 · Mon 20 Jul");
  });

  it("never reads the wall clock — the same week always formats identically", () => {
    expect(clockLabel(5)).toBe(clockLabel(5));
    expect(fmtDate(weekStart(5))).toBe("Mon 17 Aug");
  });
});

describe("module locking", () => {
  const [foundations, colour, typeAndSpacing, components, ship] = MODULES;

  it("locks nothing at all in self-paced mode", () => {
    expect(isCohort("self")).toBe(false);
    for (const m of MODULES) {
      expect(isModuleLocked(m, 1, "self")).toBe(false);
    }
  });

  it("opens weeks 1-3 and locks 5 and 7 when the cohort is in week 3", () => {
    expect(isModuleLocked(foundations, 3, "cohort")).toBe(false);
    expect(isModuleLocked(colour, 3, "cohort")).toBe(false);
    expect(isModuleLocked(typeAndSpacing, 3, "cohort")).toBe(false);
    expect(isModuleLocked(components, 3, "cohort")).toBe(true);
    expect(isModuleLocked(ship, 3, "cohort")).toBe(true);
  });

  it("opens a module the week it lands, not the week after", () => {
    /* Module 4 is a week-5 module: locked at 4, open at 5. */
    expect(isModuleLocked(components, 4, "cohort")).toBe(true);
    expect(isModuleLocked(components, 5, "cohort")).toBe(false);
  });

  it("has everything open by the last week", () => {
    for (const m of MODULES) {
      expect(isModuleLocked(m, 8, "cohort")).toBe(false);
    }
  });

  it("labels a lock with the date it actually opens", () => {
    expect(unlockLabel(components)).toBe("Unlocks Mon 17 Aug");
    expect(unlockLabel(ship)).toBe("Unlocks Mon 31 Aug");
  });

  it("opens the two sales-page preview lessons and nothing else", () => {
    expect(isPreviewLesson("L1")).toBe(true);
    expect(isPreviewLesson("L2")).toBe(true);
    expect(isPreviewLesson("L3")).toBe(false);
    expect(isPreviewLesson("L22")).toBe(false);
  });
});

describe("the curriculum", () => {
  it("flattens to exactly the advertised lesson count", () => {
    expect(allLessons()).toHaveLength(TOTAL_LESSONS);
  });

  it("carries each lesson's owning module along with it", () => {
    const l12 = lessonById("L12");
    expect(l12?.title).toBe("Grids and rhythm");
    expect(l12?.mod.title).toBe("Type and spacing");
    expect(l12?.mod.week).toBe(3);
  });

  it("keeps lessons in curriculum order, not id order", () => {
    const ids = allLessons().map((l) => l.id);
    expect(ids[0]).toBe("L1");
    expect(ids.at(-1)).toBe("L22");
  });

  it("returns undefined for an id that is not in the curriculum", () => {
    expect(lessonById("L999")).toBeUndefined();
  });

  it("parses mm:ss durations and falls back for the ones that aren't", () => {
    expect(lessonSeconds("L12")).toBe(18 * 60 + 30);
    /* "9 min" is not mm:ss — the reading lesson takes the fallback. */
    expect(lessonSeconds("L3")).toBe(600);
    expect(lessonSeconds("nope")).toBe(600);
  });
});

describe("progress", () => {
  it("counts only the truthy entries", () => {
    expect(doneCount({ L1: 1, L2: 1, L3: 0 })).toBe(2);
    expect(doneCount({})).toBe(0);
  });

  it("reports the seeded eleven lessons as halfway", () => {
    const done: Record<string, number> = {};
    for (let i = 1; i <= 11; i++) done[`L${i}`] = 1;
    expect(progressPct(done)).toBe(50);
  });

  it("reaches 100% only when every lesson is done", () => {
    const done: Record<string, number> = {};
    for (const l of allLessons()) done[l.id] = 1;
    expect(progressPct(done)).toBe(100);
  });
});

describe("the lesson player head", () => {
  it("stays exactly where it was scrubbed while paused", () => {
    const pos = playheadPos({
      playing: false, pos: 0.39, lessonId: "L12", elapsed: 900, playAnchor: 0,
    });
    expect(pos).toBe(0.39);
  });

  it("advances by real seconds over the lesson's runtime while playing", () => {
    /* L12 is 18:30 = 1110s. 111 seconds of play is exactly 10%. */
    const pos = playheadPos({
      playing: true, pos: 0, lessonId: "L12", elapsed: 111, playAnchor: 0,
    });
    expect(pos).toBeCloseTo(0.1, 5);
  });

  it("clamps at the end instead of running past it", () => {
    const pos = playheadPos({
      playing: true, pos: 0.9, lessonId: "L12", elapsed: 99_999, playAnchor: 0,
    });
    expect(pos).toBe(1);
  });
});

describe("dates and clocks", () => {
  it("keeps the week-3 deadline fixed so it can go overdue as time moves", () => {
    /* Friday of week 3 — the assignment brief's stated due date. */
    expect(fmtDate(dueDate())).toBe("Fri 7 Aug");
    expect(dueDate().getTime()).toBeLessThan(weekStart(4).getTime());
  });

  it("adds days without mutating the date it was given", () => {
    const base = weekStart(1);
    const before = base.getTime();
    const later = addDays(base, 3);
    expect(base.getTime()).toBe(before);
    expect(fmtDate(later)).toBe("Thu 23 Jul");
  });

  it("counts the live session down and floors at zero rather than going negative", () => {
    const early = countdown(3, 0);
    expect(early).toMatch(/^\d+d \d{2}h \d{2}m \d{2}s$/);
    expect(countdown(3, 99_999_999)).toBe("00h 00m 00s");
  });

  it("formats clocks with padding, and never renders a negative time", () => {
    expect(mmss(0)).toBe("00:00");
    expect(mmss(72)).toBe("01:12");
    expect(mmss(-5)).toBe("00:00");
    expect(hhmmss(2700)).toBe("00:45:00");
    expect(hhmmss(3661)).toBe("01:01:01");
    expect(hhmmss(-5)).toBe("00:00:00");
  });
});
