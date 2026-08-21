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

import { number } from "../../i18n/ambient";

/**
 * Per-lesson download size in megabytes, keyed by lesson id.
 *
 * Numbers, not the strings "388 MB" — the megabyte marker is a CLDR unit and
 * the digits are the reader's. `sizeLabel` renders them at call time.
 */
export const DOWNLOAD_SIZES_MB: Record<string, number> = {
  L9: 388,
  L11: 286,
  L12: 412,
  L13: 2,
  L15: 1,
};

/** "388 MB" / "٣٨٨ م.بايت" — the size chip on a download row. */
export function sizeLabel(id: string): string {
  const mb = DOWNLOAD_SIZES_MB[id];
  return mb === undefined
    ? NO_SIZE
    : number(mb, { style: "unit", unit: "megabyte", unitDisplay: "short" });
}

/** Shown when a lesson has no size of its own. A dash reads the same anywhere. */
export const NO_SIZE = "—";

/**
 * Device storage, as the comp states it.
 *
 * A module-level `const` is evaluated once, before React mounts, so it cannot
 * be a getter; the translation is filed as `data.downloads.deviceLabel` and
 * takes a `{size}` the screen already knows.
 */
export const DEVICE_TOTAL_GB = 8;
export const DEVICE_LABEL = "of 8 GB on this device";
/** Rule of thumb the used-space readout is built from. */
export const GB_PER_FILE = 0.36;
/** How much of the storage bar one finished download fills. */
export const BAR_PCT_PER_FILE = 9;

/** How long a download "runs" before it lands. */
export const DOWNLOAD_MS = 1600;
/** The progress every in-flight download reports. Nothing is really moving. */
export const BUSY_PCT = 62;
