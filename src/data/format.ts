/*
 * Locale-aware helpers for the seed data.
 *
 * Two problems this file solves, both of them peculiar to seed data.
 *
 * 1. Lazy labels. Everything under `src/data/` is a module-level constant, so
 *    a label translated at module-initialisation time would freeze into
 *    whatever locale was active before React mounted — English, always. The UI
 *    labels in these files are therefore GETTERS: `get label() { return
 *    t("data.…"); }` reads the message on every access, which is during render,
 *    which is after `<App>` has pushed the live `t` into `i18n/ambient`. The
 *    screens keep reading `f.label` and need no change.
 *
 *    The one shape a getter cannot take is a bare `string[]`, so `lazyStrings`
 *    below builds an array whose *indices* are getters. `arr.map()`,
 *    `arr[i]` and `arr.length` all behave normally.
 *
 * 2. Relative time. The seed is full of "2 days ago" and "3h" — written by
 *    hand, in English, in a demo that ships in eight languages. `ago` and
 *    `shortUnit` hand those to `Intl.RelativeTimeFormat` and CLDR's narrow
 *    units instead, so a German reader gets "vor 2 Tagen" and an Egyptian one
 *    "منذ يومين" without a single hand-written translation of a time unit.
 *
 * Nothing here is called at module scope. If you ever find yourself calling
 * one of these to initialise a `const`, that constant is frozen in English —
 * make it a getter instead.
 */

import { locale, number as fmtNumber, tOr } from "../i18n/ambient";
import type { CourseLevel } from "./types";

/* ------------------------------------------------------------ enum names */

/**
 * The reader's name for a `CourseLevel`.
 *
 * A level is an id that happens to look like an English word: the course
 * record stores "Intermediate", and `data/screens/editor.ts` keeps that token
 * because a segmented control's *value* must not move when the language does.
 * Its NAME is a different thing, and it is what gets drawn — so every draw
 * site goes through here rather than printing the id.
 *
 * `tOr` rather than `t` because the key is assembled from data the compiler
 * cannot see; an unknown level falls back to its own token instead of leaking
 * "data.level.expert" onto the screen.
 */
export function levelName(level: CourseLevel | string): string {
  return tOr(`data.level.${String(level).toLowerCase()}`, String(level));
}

/* ------------------------------------------------------------ lazy arrays */

/**
 * A `string[]` whose items are computed on every read.
 *
 * Array index properties are ordinary properties, so they can be accessors;
 * defining "0".."n-1" also sets `length` for free. The result is a real array
 * — `map`, `join`, `slice` and the spread operator all work — that happens to
 * re-read its contents each time, which is exactly what a translated label
 * needs.
 */
export function lazyStrings(
  length: number,
  at: (i: number) => string,
): string[] {
  const arr: string[] = [];
  for (let i = 0; i < length; i++) {
    Object.defineProperty(arr, i, {
      get: () => at(i),
      enumerable: true,
      configurable: true,
    });
  }
  return arr;
}

/* --------------------------------------------------------------- scores */

/**
 * "19 / 20" — a score, a seat count, anything of the form "n out of m".
 *
 * Only the digits change with the locale, but they do change: an Egyptian
 * reader expects "١٩ / ٢٠". The separator is the caller's because the comps
 * use both "19 / 20" and a tighter "17/20".
 */
export function ratio(a: number, b: number, separator = " / "): string {
  return `${fmtNumber(a)}${separator}${fmtNumber(b)}`;
}

/* --------------------------------------------------------------- clocks */

/**
 * "11:48" — a digital-clock pair in the reader's own digits ("١١:٤٨").
 *
 * `:` is the universal separator, but the DIGITS are not: an Arabic reader
 * expects Arabic-Indic ones. Mirrors `lib/schedule.ts`'s `mmss`, which cannot
 * be imported here — `schedule` reads `data/demo`, and that would be a cycle.
 */
export function clock(a: number, b: number): string {
  const pad = (n: number) =>
    fmtNumber(n, { minimumIntegerDigits: 2, useGrouping: false });
  return `${pad(a)}:${pad(b)}`;
}

/* --------------------------------------------------------- relative time */

const RTF_CACHE = new Map<string, Intl.RelativeTimeFormat>();

function rtf(): Intl.RelativeTimeFormat {
  const key = locale();
  let f = RTF_CACHE.get(key);
  if (!f) {
    f = new Intl.RelativeTimeFormat(key, { numeric: "auto" });
    RTF_CACHE.set(key, f);
  }
  return f;
}

/**
 * "2 hours ago" / "vor 2 Stunden" / "منذ ساعتين".
 *
 * CLDR owns the phrasing, the plural and the word order — which is why the
 * Arabic dual ("ساعتين", not "2 ساعات") comes out right without anybody here
 * knowing that Arabic has a dual.
 */
export function ago(n: number, unit: Intl.RelativeTimeFormatUnit): string {
  return rtf().format(-Math.abs(n), unit);
}

/** "2h" / "٢ س" — the narrow badge a queue column has room for. */
export function shortUnit(n: number, unit: string): string {
  return fmtNumber(n, { style: "unit", unit, unitDisplay: "narrow" });
}
