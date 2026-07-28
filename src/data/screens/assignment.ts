/*
 * Page-local seed for the assignment screen.
 *
 * The parts a customer would edit in a dashboard — the title, the points, the
 * grade, the brief's attachments and the student's own files — are contract
 * data and arrive through `dataSource.myAssignment()`. What lives here is the
 * copy the comp hardcoded into this one screen: the brief itself, Yara's
 * marking note, and the three rubric lines under it.
 *
 * `MY_ASSIGNMENT.feedback` in demo.ts is a *different*, longer note — that one
 * is what the instructor-side grading queue shows. The comp wrote two, and
 * they are deliberately not merged.
 */

import type { Tone } from "../../components";

export const ASSIGNMENT_BRIEF =
  "Take the scale from lesson 11 and build one specimen page: display, heading, body, caption, and a data style in mono. Set the same paragraph in all of them. Then write two sentences on what each size is for — if you can't say it plainly, the size probably isn't earning its place.";

export const ASSIGNMENT_FEEDBACK =
  "This is a genuinely usable scale, Rosa — and the caption size finally has a job. Two notes. The display size is doing too much on small screens: cap it around 40px and let line-height carry the drama. And your body measure runs to 92 characters; pull it back under 75 and the whole page relaxes. The writing under each size is the strongest part. Keep doing that.";

/** One line of the marking rubric, toned by how the criterion went. */
export interface RubricLine {
  label: string;
  tone: Tone;
}

export const ASSIGNMENT_RUBRIC: RubricLine[] = [
  { label: "Scale · 8/8", tone: "pos" },
  { label: "Reasoning · 7/7", tone: "pos" },
  { label: "Responsive · 3/5", tone: "warn" },
];

/** The file the demo's "Attach a file" button drops in. */
export const ASSIGNMENT_EXTRA_FILE = "specimen_v2.png";
