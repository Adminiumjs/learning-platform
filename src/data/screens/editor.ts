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

import type { CourseLevel } from "../types";

/** The three levels the segmented control offers, in the comp's order. */
export const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

export interface TintChoice {
  /** Raw hex is allowed here and only here: a tint is data, and it reaches
      the DOM as the `--tint` custom property, never as a colour literal. */
  hex: string;
  /** Accessible name — a swatch button has no text of its own. */
  name: string;
}

export const TINTS: TintChoice[] = [
  { hex: "#7c3aed", name: "Violet" },
  { hex: "#2563eb", name: "Blue" },
  { hex: "#0d9488", name: "Teal" },
  { hex: "#e11d48", name: "Rose" },
  { hex: "#a95800", name: "Amber" },
];

export interface IconChoice {
  /** Kebab-case lucide name, as stored on the course record. */
  name: string;
  label: string;
}

export const COVER_ICONS: IconChoice[] = [
  { name: "layout-grid", label: "Grid" },
  { name: "type", label: "Type" },
  { name: "orbit", label: "Orbit" },
  { name: "briefcase", label: "Briefcase" },
  { name: "pen-tool", label: "Pen" },
];

/** Reviews live on the reviews screen; the course record carries no rating. */
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
