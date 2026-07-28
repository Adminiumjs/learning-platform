/*
 * Page-local seed for downloads.
 *
 * Sizes are presentational — a real platform would report them per encoded
 * file, and there are no files here at all (spec 20 D9: no media, no network).
 * The lessons themselves come from the DataSource; only the numbers this one
 * page invents live here.
 *
 * The comp also carried a size for L14, the week-3 live session, which it then
 * filtered out of the list — a live call is not a download. Dropped.
 */

/** Per-lesson download size, keyed by lesson id. */
export const DOWNLOAD_SIZES: Record<string, string> = {
  L9: "388 MB",
  L11: "286 MB",
  L12: "412 MB",
  L13: "2 MB",
  L15: "1 MB",
};

/** Shown when a lesson has no size of its own. */
export const NO_SIZE = "—";

/** Device storage, as the comp states it. */
export const DEVICE_LABEL = "of 8 GB on this device";
/** Rule of thumb the used-space readout is built from. */
export const GB_PER_FILE = 0.36;
/** How much of the storage bar one finished download fills. */
export const BAR_PCT_PER_FILE = 9;

/** How long a download "runs" before it lands. */
export const DOWNLOAD_MS = 1600;
/** The progress every in-flight download reports. Nothing is really moving. */
export const BUSY_PCT = 62;
