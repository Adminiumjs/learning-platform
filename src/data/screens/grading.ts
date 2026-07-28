/*
 * Grading queue — page-local seed.
 *
 * The queue itself is shared data (`dataSource.submissions()`); these two are
 * presentation: a headline number and the shape of the shortcut row.
 */

/**
 * Submissions Yara had already graded before the demo opens.
 *
 * It only feeds the "N graded so far" line — the queue holds the four that are
 * still waiting, and this is what makes that line read like a working week
 * rather than a fresh install.
 */
export const SEEDED_GRADED = 3;

/**
 * The quick-score buttons, as points *below* the maximum.
 *
 * Expressed as offsets so they work for a 20-point assignment and a 10-point
 * essay alike — the comp hardcoded `max-4, max-2, max` inline.
 */
export const QUICK_SCORE_OFFSETS = [4, 2, 0];
