/*
 * Catalog — page-local seed.
 *
 * The category chips and the autumn intake date are presentational: neither
 * would ever be a row a customer edits in the generated dashboard, so they sit
 * beside the screen rather than behind the `dataSource` seam (see source.ts).
 */

import { t } from "../../i18n/ambient";
import type { CourseCategory } from "../types";

export interface CatalogFilter {
  id: "all" | CourseCategory;
  label: string;
}

/**
 * The filter row above the grid. "All" is the seeded default.
 *
 * `id` is the machine token a course record carries; `label` is what a person
 * reads, so it is a getter and moves with the locale.
 */
export const CATEGORIES: CatalogFilter[] = [
  {
    id: "all",
    get label() {
      return t("data.category.all");
    },
  },
  {
    id: "design",
    get label() {
      return t("data.category.design");
    },
  },
  {
    id: "typography",
    get label() {
      return t("data.category.typography");
    },
  },
  {
    id: "motion",
    get label() {
      return t("data.category.motion");
    },
  },
  {
    id: "portfolio",
    get label() {
      return t("data.category.portfolio");
    },
  },
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
