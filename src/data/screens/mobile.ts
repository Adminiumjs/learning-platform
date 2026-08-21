/*
 * Mobile-app screen seed — the copy and the tiles that only this screen shows.
 *
 * Page-local on purpose: none of it is a record a customer would edit in the
 * generated dashboard, so it stays out of the `dataSource` contract. The
 * numbers are in-fiction and verbatim from the comp.
 *
 * All of it is phone chrome — three tab names, three page heads, a stat row
 * and four account rows — so all of it is translated. The platform line
 * ("iOS 17+ · Android 12+") is a pair of product names and stays as written.
 */

import { number, t } from "../../i18n/ambient";
import { ratio, shortUnit } from "../format";
import type { ViewId } from "../types";

/** The three sections of the phone app; also the bottom tab bar. */
export type MobileTab = "learn" | "discuss" | "you";

export interface MobileTabDef {
  id: MobileTab;
  label: string;
  icon: string;
}

export const MOBILE_TABS: MobileTabDef[] = [
  {
    id: "learn",
    get label() {
      return t("data.mobile.tab.learn");
    },
    icon: "play",
  },
  {
    id: "discuss",
    get label() {
      return t("data.mobile.tab.discuss");
    },
    icon: "message-square-text",
  },
  {
    id: "you",
    get label() {
      return t("data.mobile.tab.you");
    },
    icon: "user-round",
  },
];

/** Kicker + title per tab — the phone's own page head. */
export const MOBILE_HEADS: Record<
  MobileTab,
  { kicker: string | null; title: string }
> = {
  /** Learn's kicker is the demo clock's "Week n of 8", so it cannot be seeded. */
  learn: {
    kicker: null,
    get title() {
      return t("data.mobile.head.learn");
    },
  },
  discuss: {
    get kicker() {
      return t("data.mobile.head.discussKicker", {
        no: number(3, { minimumIntegerDigits: 2, useGrouping: false }),
      });
    },
    get title() {
      return t("data.mobile.head.discuss");
    },
  },
  you: {
    get kicker() {
      return t("data.mobile.head.youKicker");
    },
    get title() {
      return t("data.mobile.head.you");
    },
  },
};

export const MOBILE_INTRO = {
  get title() {
    return t("data.mobile.intro.title");
  },
  get body() {
    return t("data.mobile.intro.body");
  },
  /** The footnote under the phone; the platform line is mono. */
  get offline() {
    return t("data.mobile.intro.offline");
  },
  platforms: "iOS 17+ · Android 12+",
};

/*
 * The four phone stats, as numbers. As the strings "21h" / "2" / "17/20" /
 * "3" they shipped Latin digits and an English "h" to every locale.
 */
const HOURS_WATCHED = 21;
const COURSES_ENROLLED = 2;
const LAST_GRADE = 17;
const LAST_GRADE_MAX = 20;
const DOWNLOADED = 3;
/** The grades row's running average. */
const GRADE_AVERAGE = 0.88;

export const MOBILE_STATS: { value: string; label: string }[] = [
  {
    get value() {
      return shortUnit(HOURS_WATCHED, "hour");
    },
    get label() {
      return t("data.mobile.stat.watched");
    },
  },
  {
    get value() {
      return number(COURSES_ENROLLED);
    },
    get label() {
      return t("data.mobile.stat.courses");
    },
  },
  {
    /* The phone tile is narrow — the comp's tight "17/20", not "17 / 20". */
    get value() {
      return ratio(LAST_GRADE, LAST_GRADE_MAX, "/");
    },
    get label() {
      return t("data.mobile.stat.lastGrade");
    },
  },
  {
    get value() {
      return number(DOWNLOADED);
    },
    get label() {
      return t("data.mobile.stat.downloads");
    },
  },
];

export interface MobileAccountRow {
  label: string;
  icon: string;
  /** Static readout. The certificate row's is computed from progress instead. */
  value?: string;
  /** Where the row goes; null rows only toast. */
  view: ViewId | null;
}

export const MOBILE_ACCOUNT_ROWS: MobileAccountRow[] = [
  {
    get label() {
      return t("data.mobile.row.downloads");
    },
    icon: "download",
    get value() {
      return t(
        "data.mobile.row.downloadsValue",
        { count: number(3), size: "412 MB" },
        3,
      );
    },
    view: null,
  },
  {
    get label() {
      return t("data.mobile.row.certificate");
    },
    icon: "award",
    view: "certificate",
  },
  {
    get label() {
      return t("data.mobile.row.grades");
    },
    icon: "trophy",
    get value() {
      return number(GRADE_AVERAGE, { style: "percent" });
    },
    view: "grades",
  },
  {
    get label() {
      return t("data.mobile.row.notifications");
    },
    icon: "bell",
    get value() {
      return t("data.mobile.row.on");
    },
    view: "profile",
  },
];

/**
 * The streak the account card brags about.
 *
 * A module-level `const`, so English here; `data.mobile.streak` takes the
 * `{count}` of weeks and carries the plural.
 */
export const MOBILE_STREAK_WEEKS = 6;
export const MOBILE_STREAK = "6-week streak";
