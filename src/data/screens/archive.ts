/*
 * Course archive — page-local seed copy.
 *
 * The courses themselves come from the `dataSource` seam (they are contract
 * data — a customer would edit those). What lives here is the shelf's own
 * narration: which course carries a certificate, and the two lines of copy
 * each row shows. Both are written against the enrolment record so the numbers
 * can never drift from it.
 *
 * `line` and `meta` were already functions — they run at render, which is the
 * one place `t()` is safe to call from a data module — so translating them
 * needed no change of shape. The two fixed dates now go through `Intl` too:
 * "Paused since 2 May 2026" was the last date on this screen still spelled
 * out in English.
 */

import { number, t } from "../../i18n/ambient";
import { fmtDateLong } from "../../lib/schedule";
import type { EnrolledCourse, ViewId } from "../types";

export interface ShelfEntry {
  id: string;
  /** Only a finished, certified course gets a downloadable certificate. */
  cert: boolean;
  /** The mono line on the end of the row — when it ended, or that it has not. */
  line: (course: EnrolledCourse, week: number) => string;
  meta: (course: EnrolledCourse) => string;
}

/** The day the motion course was put down. Fixed, so formatted at render. */
const PAUSED_ON = new Date(2026, 4, 2);
/** The day the retired writing course was finished. */
const FINISHED_ON = new Date(2025, 10, 18);

/** A zero-padded intake number — "03", and "٠٣" in Arabic. */
function intake(n: number): string {
  return number(n, { minimumIntegerDigits: 2, useGrouping: false });
}

/** Newest activity first, which is not the same as newest purchase first. */
export const ARCHIVE_SHELF: ShelfEntry[] = [
  {
    id: "TY-140",
    cert: false,
    line: () => t("data.archive.line.selfPaced"),
    meta: (c) =>
      t("data.archive.meta.selfPaced", {
        done: number(c.done ?? 0),
        total: number(c.total),
        next: c.next ?? "—",
      }),
  },
  {
    id: "DS-101",
    cert: false,
    line: (_c, week) => t("data.archive.line.inWeek", { week: number(week) }),
    meta: (c) =>
      t("data.archive.meta.cohort", {
        cohort: intake(3),
        total: number(c.total),
        date: c.date,
      }),
  },
  {
    id: "MO-220",
    cert: false,
    line: () =>
      t("data.archive.line.pausedSince", { date: fmtDateLong(PAUSED_ON) }),
    meta: (c) =>
      t("data.archive.meta.done", {
        done: number(c.done ?? 0),
        total: number(c.total),
      }),
  },
  {
    id: "PF-201",
    cert: true,
    line: () =>
      t("data.archive.line.finishedOn", { date: fmtDateLong(FINISHED_ON) }),
    meta: () => t("data.archive.meta.retired", { cohort: intake(1) }),
  },
];

export const ARCHIVE_FILTERS: { id: string; label: string }[] = [
  {
    id: "all",
    get label() {
      return t("data.archive.filter.all");
    },
  },
  {
    id: "done",
    get label() {
      return t("data.archive.filter.finished");
    },
  },
  {
    id: "active",
    get label() {
      return t("data.archive.filter.active");
    },
  },
  {
    id: "paused",
    get label() {
      return t("data.archive.filter.paused");
    },
  },
];

export interface KeptItem {
  title: string;
  sub: string;
  /** Mono trailing detail — a filename, a size, a certificate id. */
  meta: string;
  icon: string;
  go: ViewId;
}

/** How many notes the Notes screen seeds. The comp counted them by hand. */
const KEPT_NOTES = 5;

/** What survives a finished course. The promise is that none of it expires. */
export const ARCHIVE_KEPT: KeptItem[] = [
  {
    get title() {
      return t("data.archive.kept.caseStudy");
    },
    /* The course name is fiction; the grade beside it is a figure. */
    sub: "Writing for Interfaces · graded 19/20",
    meta: "case_study_final.pdf",
    icon: "file-text",
    go: "notes",
  },
  {
    get title() {
      return t(
        "data.archive.kept.notes",
        { count: number(KEPT_NOTES) },
        KEPT_NOTES,
      );
    },
    get sub() {
      return t("data.archive.kept.notesSub");
    },
    meta: "notes",
    icon: "notebook-pen",
    go: "notes",
  },
  {
    get title() {
      return t("data.archive.kept.certificate");
    },
    get sub() {
      return t("data.archive.kept.certificateSub");
    },
    meta: "YA-CERT-1804-PF",
    icon: "award",
    go: "certificate",
  },
  {
    get title() {
      return t("data.archive.kept.downloads");
    },
    get sub() {
      return t("data.archive.kept.downloadsSub");
    },
    meta: "1.1 GB",
    icon: "download",
    go: "downloads",
  },
];
