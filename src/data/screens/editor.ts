/*
 * Course editor — page-local seed.
 *
 * The palettes here are the *choices the editor offers*, not records: a
 * customer editing a course in the generated dashboard would change that
 * course's tint, never the list of tints on offer. So they sit beside the
 * screen rather than behind the `dataSource` seam.
 *
 * Everything the seam already knows — module count, lesson count, cohort
 * capacity — is read from it in the screen and is deliberately absent here.
 */

import { t } from "../../i18n/ambient";
import type { CourseLevel } from "../types";

/**
 * The three levels the segmented control offers, in the comp's order.
 *
 * These stay as the English tokens because a `CourseLevel` is what a course
 * record stores — it is an id that happens to look like a word. The reader's
 * names for them are `data.level.beginner` / `.intermediate` / `.advanced`,
 * resolved wherever a level is drawn.
 */
export const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

export interface TintChoice {
  /** Raw hex is allowed here and only here: a tint is data, and it reaches
      the DOM as the `--tint` custom property, never as a colour literal. */
  hex: string;
  /** Accessible name — a swatch button has no text of its own. */
  name: string;
}

export const TINTS: TintChoice[] = [
  {
    hex: "#7c3aed",
    get name() {
      return t("data.editor.tint.violet");
    },
  },
  {
    hex: "#2563eb",
    get name() {
      return t("data.editor.tint.blue");
    },
  },
  {
    hex: "#0d9488",
    get name() {
      return t("data.editor.tint.teal");
    },
  },
  {
    hex: "#e11d48",
    get name() {
      return t("data.editor.tint.rose");
    },
  },
  {
    hex: "#a95800",
    get name() {
      return t("data.editor.tint.amber");
    },
  },
];

export interface IconChoice {
  /** Kebab-case lucide name, as stored on the course record. */
  name: string;
  label: string;
}

export const COVER_ICONS: IconChoice[] = [
  {
    name: "layout-grid",
    get label() {
      return t("data.editor.icon.grid");
    },
  },
  {
    name: "type",
    get label() {
      return t("data.editor.icon.type");
    },
  },
  {
    name: "orbit",
    get label() {
      return t("data.editor.icon.orbit");
    },
  },
  {
    name: "briefcase",
    get label() {
      return t("data.editor.icon.briefcase");
    },
  },
  {
    name: "pen-tool",
    get label() {
      return t("data.editor.icon.pen");
    },
  },
];

/**
 * Reviews live on the reviews screen; the course record carries no rating.
 *
 * English here (module-level `const`); `data.editor.ratingLine` takes the
 * rating and the review count as `{rating}` and `{count}`.
 */
export const RATING_COUNT = 6;
export const RATING_LINE = "4.8 · 6 reviews";

/** The intake this course is currently running. */
export const COHORT_NO = "03";

/**
 * The time of day the "last saved" stamp shows.
 *
 * The demo clock supplies the date; this is the clock face beside it, kept
 * just before `demoNow`'s 10:20 so the stamp reads as the past.
 */
export const LAST_SAVED_TIME = "09:04";
