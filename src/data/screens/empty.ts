/*
 * Empty states — page-local seed copy.
 *
 * This screen is a specimen sheet: four real empty states lifted out of the
 * places they belong to, shown side by side so the tone can be judged as a
 * set. Each one names where it comes from and every one offers a way out —
 * an empty state without a next step is just a dead end with better type.
 *
 * All of it is interface, so all of it is translated. Judging the tone of a
 * set of empty states is exactly the job this screen exists for, and it is
 * only worth doing in the language the reader will meet them in.
 */

import { t } from "../../i18n/ambient";
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
    get where() {
      return t("data.empty.learning.where");
    },
    get tag() {
      return t("data.empty.learning.tag");
    },
    tone: "accent",
    icon: "sprout",
    get title() {
      return t("data.empty.learning.title");
    },
    get body() {
      return t("data.empty.learning.body");
    },
    get cta() {
      return t("data.empty.learning.cta");
    },
    go: "catalog",
  },
  {
    get where() {
      return t("data.empty.grading.where");
    },
    get tag() {
      return t("data.empty.grading.tag");
    },
    tone: "pos",
    icon: "check-check",
    get title() {
      return t("data.empty.grading.title");
    },
    get body() {
      return t("data.empty.grading.body");
    },
    get cta() {
      return t("data.empty.grading.cta");
    },
    go: "teach",
  },
  {
    get where() {
      return t("data.empty.board.where");
    },
    get tag() {
      return t("data.empty.board.tag");
    },
    tone: "info",
    icon: "message-square-dashed",
    get title() {
      return t("data.empty.board.title");
    },
    get body() {
      return t("data.empty.board.body");
    },
    get cta() {
      return t("data.empty.board.cta");
    },
    go: "board",
  },
  {
    get where() {
      return t("data.empty.search.where");
    },
    get tag() {
      return t("data.empty.search.tag");
    },
    tone: "warn",
    icon: "search-x",
    get title() {
      return t("data.empty.search.title");
    },
    get body() {
      return t("data.empty.search.body");
    },
    get cta() {
      return t("data.empty.search.cta");
    },
    go: "qa",
  },
];
