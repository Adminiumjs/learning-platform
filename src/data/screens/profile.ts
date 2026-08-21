/*
 * Page-local seed for the student profile.
 *
 * Only the things the profile page states about the demo account and nobody
 * would edit in a generated dashboard: the four notification switches and the
 * two header facts. Everything editable (name, email, bio, the switch states)
 * is store state, and everything countable (courses enrolled, lessons
 * finished) is derived from the DataSource rather than restated here.
 *
 * The four switches are a settings list — interface — so they are getters.
 * The handle is a username and never moves; "Student since February 2026" is
 * a module-level `const` and so keeps its English here, with the translation
 * under `data.profile.since` and the month left to `Intl`.
 */

import { t } from "../../i18n/ambient";

/** One row of the "Email me about" list. `k` indexes `prNotif` on the store. */
export interface NotifyRow {
  k: string;
  label: string;
  sub: string;
}

export const NOTIFY_ROWS: NotifyRow[] = [
  {
    k: "lessons",
    get label() {
      return t("data.profile.notify.lessons");
    },
    get sub() {
      return t("data.profile.notify.lessonsSub");
    },
  },
  {
    k: "replies",
    get label() {
      return t("data.profile.notify.replies");
    },
    get sub() {
      return t("data.profile.notify.repliesSub");
    },
  },
  {
    k: "live",
    get label() {
      return t("data.profile.notify.live");
    },
    get sub() {
      return t("data.profile.notify.liveSub");
    },
  },
  {
    k: "news",
    get label() {
      return t("data.profile.notify.news");
    },
    get sub() {
      return t("data.profile.notify.newsSub");
    },
  },
];

/** The mono handle under the student's name. Not editable, so not store state. */
export const PROFILE_HANDLE = "@rosa.marchetti";

/** The month Rosa enrolled. `data.profile.since` takes it as `{month}`. */
export const PROFILE_SINCE_ON = new Date(2026, 1, 1);
export const PROFILE_SINCE = "Student since February 2026";

/** The two header stats the demo does not model anywhere else. */
export const HOURS_WATCHED = "21h";
export const CURRENT_STREAK = "6 wks";
