/*
 * Empty states — page-local seed copy.
 *
 * This screen is a specimen sheet: four real empty states lifted out of the
 * places they belong to, shown side by side so the tone can be judged as a
 * set. Each one names where it comes from and every one offers a way out —
 * an empty state without a next step is just a dead end with better type.
 */

import type { Tone } from "../../components/Primitives";
import type { ViewId } from "../types";

export interface EmptyCard {
  /** The screen this state actually belongs to. */
  where: string;
  tag: string;
  tone: Tone;
  icon: string;
  title: string;
  body: string;
  cta: string;
  go: ViewId;
}

export const EMPTY_CARDS: EmptyCard[] = [
  {
    where: "My learning",
    tag: "Day one",
    tone: "accent",
    icon: "sprout",
    title: "Nothing on the go yet",
    body: "Pick a course and the first lesson opens straight away. You can change your mind within fourteen days.",
    cta: "Browse courses",
    go: "catalog",
  },
  {
    where: "Grading queue",
    tag: "Instructor",
    tone: "pos",
    icon: "check-check",
    title: "Queue clear",
    body: "Every submission is graded. Thirty students will see your feedback next time they open the course.",
    cta: "Back to teaching",
    go: "teach",
  },
  {
    where: "Discussion",
    tag: "Quiet week",
    tone: "info",
    icon: "message-square-dashed",
    title: "No threads here yet",
    body: "Somebody has to go first. A half-formed question is worth more than a polished one nobody asks.",
    cta: "Start a thread",
    go: "board",
  },
  {
    where: "Search",
    tag: "No matches",
    tone: "warn",
    icon: "search-x",
    title: "Nothing for that word",
    body: "Try something shorter, or ask it as a question — Yara answers most within a day.",
    cta: "Ask a question",
    go: "qa",
  },
];
