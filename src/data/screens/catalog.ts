/*
 * Catalog — page-local seed.
 *
 * The category chips and the autumn intake date are presentational: neither
 * would ever be a row a customer edits in the generated dashboard, so they sit
 * beside the screen rather than behind the `dataSource` seam (see source.ts).
 */

import type { CourseCategory } from "../types";

export interface CatalogFilter {
  id: "all" | CourseCategory;
  label: string;
}

/** The filter row above the grid. "All" is the seeded default. */
export const CATEGORIES: CatalogFilter[] = [
  { id: "all", label: "All" },
  { id: "design", label: "Design" },
  { id: "typography", label: "Typography" },
  { id: "motion", label: "Motion" },
  { id: "portfolio", label: "Portfolio" },
];

/**
 * The autumn intake the second cohort course advertises.
 *
 * A fixed date rather than one derived from the demo clock, so it stays ahead
 * of every week the dock can reach (the clock only runs to week 8, mid-Sep).
 */
export const AUTUMN_COHORT_START = new Date(2026, 8, 7);

/** Skeleton cards shown while the dock's "Reload list" runs. */
export const SKELETON_CARDS = [1, 2, 3, 4];
