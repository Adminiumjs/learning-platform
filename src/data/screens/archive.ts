/*
 * Course archive — page-local seed copy.
 *
 * The courses themselves come from the `dataSource` seam (they are contract
 * data — a customer would edit those). What lives here is the shelf's own
 * narration: which course carries a certificate, and the two lines of copy
 * each row shows. Both are written against the enrolment record so the numbers
 * can never drift from it.
 */

import type { EnrolledCourse, ViewId } from "../types";

export interface ShelfEntry {
  id: string;
  /** Only a finished, certified course gets a downloadable certificate. */
  cert: boolean;
  /** The mono line on the end of the row — when it ended, or that it has not. */
  line: (course: EnrolledCourse, week: number) => string;
  meta: (course: EnrolledCourse) => string;
}

/** Newest activity first, which is not the same as newest purchase first. */
export const ARCHIVE_SHELF: ShelfEntry[] = [
  {
    id: "TY-140",
    cert: false,
    line: () => "In progress · self-paced",
    meta: (c) => `Self-paced · ${c.done ?? 0} of ${c.total} lessons · next: ${c.next ?? "—"}`,
  },
  {
    id: "DS-101",
    cert: false,
    line: (_c, week) => `In progress · week ${week}`,
    meta: (c) => `Cohort 03 · ${c.total} lessons · started ${c.date}`,
  },
  {
    id: "MO-220",
    cert: false,
    line: () => "Paused since 2 May 2026",
    meta: (c) => `Self-paced · ${c.done ?? 0} of ${c.total} lessons done`,
  },
  {
    id: "PF-201",
    cert: true,
    line: () => "Finished 18 Nov 2025",
    meta: () => "Cohort 01 · retired course · kept for you",
  },
];

export const ARCHIVE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "done", label: "Finished" },
  { id: "active", label: "In progress" },
  { id: "paused", label: "Paused" },
];

export interface KeptItem {
  title: string;
  sub: string;
  /** Mono trailing detail — a filename, a size, a certificate id. */
  meta: string;
  icon: string;
  go: ViewId;
}

/** What survives a finished course. The promise is that none of it expires. */
export const ARCHIVE_KEPT: KeptItem[] = [
  {
    title: "Your case study page",
    sub: "Writing for Interfaces · graded 19/20",
    meta: "case_study_final.pdf",
    icon: "file-text",
    go: "notes",
  },
  {
    /* The comp counted the Notes screen's own seed list; it holds five. */
    title: "5 notes",
    sub: "Across two courses, timestamped",
    meta: "notes",
    icon: "notebook-pen",
    go: "notes",
  },
  {
    title: "One certificate",
    sub: "Verifiable for as long as we exist",
    meta: "YA-CERT-1804-PF",
    icon: "award",
    go: "certificate",
  },
  {
    title: "Every lesson you downloaded",
    sub: "Playable offline, no expiry",
    meta: "1.1 GB",
    icon: "download",
    go: "downloads",
  },
];
