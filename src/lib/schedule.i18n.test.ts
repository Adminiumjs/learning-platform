/*
 * The drip engine, read in another language.
 *
 * `schedule.test.ts` pins the en-US strings. This file pins the property that
 * matters more: the demo clock's INSTANTS are fixed, and only their RENDERING
 * follows the reader. Week 3 is Monday 3 August 2026 in Cairo and in Copenhagen
 * — it just does not spell itself the same way.
 *
 * It lives in its own file because `setAmbient` is module-global state and
 * vitest gives every test file a fresh module registry; sharing a file with the
 * en-US tests would leak a locale across them.
 *
 * Assertions are deliberately shape-based rather than exact CLDR strings: ICU
 * revises its patterns between Node releases, and a test that breaks on a Node
 * upgrade teaches nobody anything.
 */
import { describe, expect, it } from "vitest";

import { setAmbient } from "../i18n/ambient";
import type { LocaleTag } from "../i18n/locales";
import { MESSAGES } from "../i18n/messages";
import {
  clockLabel,
  countdown,
  fmtDate,
  lessonById,
  lessonSeconds,
  mmss,
  weekStart,
} from "./schedule";

/**
 * Point the ambient bridge at a locale, the way `<App>` does on every render.
 *
 * `t` resolves against the real bundle rather than echoing the key back: the
 * labels under test are now messages with `{placeholder}`s in them, and a stub
 * that returns "chrome.clock.readout" would prove nothing about digits or
 * field order.
 */
function use(tag: LocaleTag): void {
  setAmbient(
    tag,
    (key, params, count) => {
      let raw = MESSAGES[tag][key] ?? String(key);
      /*
       * Plurals, selected the way the real runtime selects them. The stub used
       * to ignore `count`, which was harmless while nothing under test was a
       * plural — the lesson duration chip now is, and a stub that returned
       * "20 pt|20 pts" would hide a Czech or Arabic mis-selection.
       */
      if (count !== undefined && raw.includes("|")) {
        const variants = raw.split("|");
        const order = PLURAL_ORDER[tag];
        const idx = order.indexOf(new Intl.PluralRules(tag).select(count));
        raw = variants[idx === -1 ? variants.length - 1 : Math.min(idx, variants.length - 1)];
      }
      const all = count === undefined ? params : { count, ...params };
      if (!all) return raw;
      return raw.replace(/\{(\w+)\}/g, (m, name: string) =>
        name in all ? String(all[name as keyof typeof all]) : m,
      );
    },
    (v, currency = "USD") =>
      new Intl.NumberFormat(tag, { style: "currency", currency }).format(v),
    (v, opts) => new Intl.NumberFormat(tag, opts).format(v),
  );
}

const ARABIC_INDIC = /[٠-٩]/;

/** CLDR cardinal order per locale — mirrors `i18n/index.tsx`'s own table. */
const PLURAL_ORDER: Record<string, Intl.LDMLPluralRule[]> = {
  "en-US": ["one", "other"],
  "de-DE": ["one", "other"],
  "fr-FR": ["one", "other"],
  "da-DK": ["one", "other"],
  "cs-CZ": ["one", "few", "other"],
  "zh-CN": ["other"],
  "zh-TW": ["other"],
  "ar-EG": ["zero", "one", "two", "few", "many", "other"],
};

describe("the demo clock renders per locale but never moves", () => {
  it("keeps week 3 on the same instant in every locale", () => {
    const instants = (["en-US", "de-DE", "cs-CZ", "ar-EG"] as LocaleTag[]).map((tag) => {
      use(tag);
      return weekStart(3).getTime();
    });
    expect(new Set(instants).size).toBe(1);
    expect(new Date(instants[0]).getDate()).toBe(3); // 3 August 2026, always
  });

  it("orders the date fields the way each locale does", () => {
    use("en-US");
    const en = fmtDate(weekStart(3));
    use("de-DE");
    const de = fmtDate(weekStart(3));
    use("cs-CZ");
    const cs = fmtDate(weekStart(3));

    expect(en).not.toBe(de);
    expect(en).not.toBe(cs);
    /* en-US leads with the month, de-DE with the day. */
    expect(en.indexOf("Aug")).toBeLessThan(en.indexOf("3"));
    expect(de.indexOf("3")).toBeLessThan(de.indexOf("Aug"));
  });

  it("uses the reader's own digits", () => {
    use("en-US");
    expect(mmss(72)).toBe("01:12");
    expect(ARABIC_INDIC.test(clockLabel(3))).toBe(false);

    use("ar-EG");
    expect(ARABIC_INDIC.test(mmss(72))).toBe(true);
    expect(ARABIC_INDIC.test(clockLabel(3))).toBe(true);
  });

  it("renders a lesson's duration chip per locale without moving its runtime", () => {
    const video = () => lessonById("L12")!;
    const reading = () => lessonById("L3")!;
    const assignment = () => lessonById("L15")!;

    use("en-US");
    const enVideo = video().dur;
    const enReading = reading().dur;
    expect(enVideo).toBe("18:30");
    expect(enReading).toMatch(/^9\s*min/);
    expect(assignment().dur).toBe("20 pts");

    /* German spells the minute marker differently; the number is the same. */
    use("de-DE");
    expect(reading().dur).not.toBe(enReading);
    expect(reading().dur).toMatch(/9/);
    expect(assignment().dur).toBe("20 Punkte");

    /* Arabic re-digits both, and picks its own plural category for 20. */
    use("ar-EG");
    expect(ARABIC_INDIC.test(video().dur)).toBe(true);
    expect(ARABIC_INDIC.test(assignment().dur)).toBe(true);
    expect(assignment().dur).not.toMatch(/\|/);

    /* Czech has three cardinal forms — 20 must not take the "one" variant. */
    use("cs-CZ");
    expect(assignment().dur).toBe("20 bodů");

    /* Through all of that the underlying runtime never moved. */
    expect(lessonSeconds("L12")).toBe(18 * 60 + 30);
    expect(lessonSeconds("L3")).toBe(9 * 60);
  });

  it("takes the countdown's unit letters from CLDR, not from English", () => {
    use("en-US");
    const en = countdown(3, 0);
    use("de-DE");
    const de = countdown(3, 0);

    expect(en).toMatch(/h .*m .*s$/);
    expect(de).not.toBe(en);
    /* Same remaining time, different spelling — the digits still line up. */
    expect(de.replace(/\D/g, "")).toBe(en.replace(/\D/g, ""));
  });
});
