/*
 * Page-local seed for the Notes screen.
 *
 * These are the student's own notes — presentational page copy, not a
 * contract table a customer would edit in a generated dashboard, so they live
 * here rather than behind the `dataSource` seam (see src/data/source.ts for
 * where that line is drawn). The lesson and module names are strings on
 * purpose: a note keeps the title it was written under even if the curriculum
 * is later renamed.
 */

export interface SavedNote {
  id: string;
  /** Module number the note's lesson sits in, e.g. "03". Groups the list. */
  mod: string;
  /** Module title, shown as the group heading. */
  module: string;
  lesson: string;
  /** Player position the note was taken at, "mm:ss" — "—" for a reading. */
  stamp: string;
  at: string;
  text: string;
}

export const NOTES: SavedNote[] = [
  {
    id: "n1",
    mod: "03",
    module: "Type and spacing",
    lesson: "Grids and rhythm",
    stamp: "04:32",
    at: "Today 09:41",
    text: "Spacing scale comes from line-height, not from a round number. 16 × 1.6 = 25.6 → round to 24. That is the unit for everything else.",
  },
  {
    id: "n2",
    mod: "03",
    module: "Type and spacing",
    lesson: "A type scale you can defend",
    stamp: "07:10",
    at: "Yesterday 20:12",
    text: "Every size needs a job you can say out loud. If I cannot finish the sentence “this size is for…”, cut it.",
  },
  {
    id: "n3",
    mod: "02",
    module: "Colour and tokens",
    lesson: "Dark mode without a rewrite",
    stamp: "11:26",
    at: "28 Jul 18:03",
    text: "Same hue, more light. Fix it once in the semantic layer.\nCheck contrast against the text sitting on the colour, not the page behind it.",
  },
  {
    id: "n4",
    mod: "02",
    module: "Colour and tokens",
    lesson: "Token layers",
    stamp: "03:48",
    at: "27 Jul 12:30",
    text: "Three layers: primitive → semantic → component. Add a fourth only when I can name what it protects me from.",
  },
  {
    id: "n5",
    mod: "01",
    module: "Foundations",
    lesson: "Naming things",
    stamp: "—",
    at: "22 Jul 08:55",
    text: "Name by job, never by look. surface-2, not grey-100. The day we rebrand, this is the difference between an afternoon and a fortnight.",
  },
];

/** The id the classroom's unsaved draft note borrows while it is on screen. */
export const DRAFT_NOTE_ID = "live";
