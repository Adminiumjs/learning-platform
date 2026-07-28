/*
 * Offline — page-local seed data.
 *
 * What is already on the device. The sizes are in-fiction: nothing is stored,
 * nothing is fetched, and the "download" is a state on a row (see the store's
 * `dlState`) rather than a file.
 */

export interface OfflineLesson {
  title: string;
  size: string;
}

export const OFFLINE_DOWNLOADS: OfflineLesson[] = [
  { title: "Grids and rhythm", size: "412 MB" },
  { title: "A type scale you can defend", size: "286 MB" },
  { title: "Dark mode without a rewrite", size: "388 MB" },
];

/** The rounded total the header chip shows beside the count. */
export const OFFLINE_TOTAL = "1.1 GB";
