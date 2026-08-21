/*
 * Lesson editor — page-local seed.
 *
 * The drop-zone copy changes with the lesson's kind, which is the only reason
 * this file exists: it is prompt text, not a record, so it lives beside the
 * screen. The lesson itself comes from the `dataSource` seam.
 *
 * Prompt text is interface, so `DROP_COPY` and `RELEASE_OPTIONS` are getters.
 * The file size, the filename and the release hour are figures and stay put.
 */

import { t } from "../../i18n/ambient";
import type { LessonKind } from "../types";

/**
 * The lesson this editor is opened on.
 *
 * The comp hardcoded "Module 03 · Type and spacing" into the template and
 * "lesson_03_grids.mp4" into its logic; both belong to L12, which is also what
 * the store's `le*` fields are seeded from. Naming the id once lets the screen
 * read the module and the filename off the real record instead, so a curriculum
 * edit cannot leave this page describing a lesson that moved.
 */
export const SUBJECT_LESSON_ID = "L12";

/** Rendered beside the filename on the attached video. */
export const VIDEO_SIZE = "812 MB";

/** What "Attach" adds. There are no real files, so it is always this one. */
export const NEW_RESOURCE = "spacing_scale.json";

/** Scheduled lessons open at the same hour every week. */
export const RELEASE_TIME = "09:00 CET";

export interface DropCopy {
  icon: string;
  title: string;
  sub: string;
}

/**
 * The upload prompt, per kind.
 *
 * The comp branched video / reading / everything-else; spelling all five out
 * keeps the record exhaustive, so adding a kind is a type error here rather
 * than a silently wrong paperclip on the screen.
 */
export const DROP_COPY: Record<LessonKind, DropCopy> = {
  video: {
    icon: "film",
    get title() {
      return t("data.lessoned.drop.video.title");
    },
    get sub() {
      return t("data.lessoned.drop.video.sub");
    },
  },
  reading: {
    icon: "file-text",
    get title() {
      return t("data.lessoned.drop.file.title");
    },
    get sub() {
      return t("data.lessoned.drop.file.sub");
    },
  },
  assignment: {
    icon: "paperclip",
    get title() {
      return t("data.lessoned.drop.file.title");
    },
    get sub() {
      return t("data.lessoned.drop.file.sub");
    },
  },
  exam: {
    icon: "paperclip",
    get title() {
      return t("data.lessoned.drop.file.title");
    },
    get sub() {
      return t("data.lessoned.drop.file.sub");
    },
  },
  live: {
    icon: "paperclip",
    get title() {
      return t("data.lessoned.drop.file.title");
    },
    get sub() {
      return t("data.lessoned.drop.file.sub");
    },
  },
};

export interface ReleaseOption {
  id: string;
  label: string;
}

export const RELEASE_OPTIONS: ReleaseOption[] = [
  {
    id: "pub",
    get label() {
      return t("data.lessoned.release.published");
    },
  },
  {
    id: "sch",
    get label() {
      return t("data.lessoned.release.scheduled");
    },
  },
];
