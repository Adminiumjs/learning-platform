/*
 * Study-rooms seed — the comp's `roomsV()` fixtures.
 *
 * Page-local: rooms are a peer-run thing, not part of the course contract, so
 * nothing outside this screen reads them.
 *
 * Translation. A room's name and the line describing it were written by the
 * student who opened it — fiction, English. Everything the app says about a
 * room is not: when it runs, how full it is, and the three standing sessions
 * the school itself hosts. The weekday and clock in a `when` come from `Intl`
 * rather than from a hand-written "Wed 19:00".
 */

import { number, t } from "../../i18n/ambient";
import { fmtTime, fmtWeekday, weekStart } from "../../lib/schedule";
import { STUDENT } from "../demo";

export interface StudyRoom {
  id: string;
  title: string;
  topic: string;
  /** Live rooms can be joined; scheduled ones can only be RSVP'd. */
  live: boolean;
  when: string;
  /** Monograms of the people already in — the app renders no avatar images. */
  faces: string[];
  count: string;
}

export interface StandingSession {
  title: string;
  sub: string;
  when: string;
  icon: string;
}

/** "Wed 19:00" — a weekday offset from Monday, plus an hour of the day. */
function slot(dayOffset: number, hour: number): string {
  const d = weekStart(1);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return t("data.rooms.slot", { day: fmtWeekday(d), time: fmtTime(d) });
}

export const STUDY_ROOMS: StudyRoom[] = [
  {
    id: "r1",
    title: "Specimen swap",
    topic:
      "Bring your type specimen, get three sets of eyes on it before Thursday.",
    live: true,
    get when() {
      return t("data.rooms.liveFor", { count: number(34) }, 34);
    },
    faces: ["TL", "PR", "AB", "CO"],
    get count() {
      return t("data.rooms.inRoom", { n: number(4), of: number(6) });
    },
  },
  {
    id: "r2",
    title: "Token clinic",
    topic:
      "Priya is walking through her three-layer setup. Bring the thing that broke.",
    live: true,
    get when() {
      return t("data.rooms.liveFor", { count: number(12) }, 12);
    },
    faces: ["PR", "BA"],
    get count() {
      return t("data.rooms.inRoom", { n: number(2), of: number(6) });
    },
  },
  {
    id: "r3",
    title: "Week 2 catch-up",
    topic:
      "For anyone behind on the token sheet. No judgement, we have all been there.",
    live: false,
    get when() {
      return t("data.rooms.tomorrowAt", { time: fmtTime(atHour(19)) });
    },
    faces: ["MF", "KM", "DF"],
    get count() {
      return t("data.rooms.going", { count: number(3) }, 3);
    },
  },
  {
    id: "r4",
    title: "Quiet co-working",
    topic: "Cameras off, mics off, timer on. Two hours of getting it done.",
    live: false,
    get when() {
      return slot(5, 10);
    },
    faces: ["FN", "NL", "AN", "IH", "JW"],
    get count() {
      return t("data.rooms.going", { count: number(5) }, 5);
    },
  },
];

/** A bare time of day on an arbitrary date — only the clock face is read. */
function atHour(hour: number): Date {
  const d = weekStart(1);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export const STANDING_SESSIONS: StandingSession[] = [
  {
    get title() {
      return t("data.rooms.standing.kickoff");
    },
    get sub() {
      return t("data.rooms.standing.kickoffSub");
    },
    get when() {
      return slot(0, 9);
    },
    icon: "sunrise",
  },
  {
    get title() {
      return t("data.rooms.standing.midweek");
    },
    get sub() {
      return t("data.rooms.standing.midweekSub");
    },
    get when() {
      return slot(2, 19);
    },
    icon: "timer",
  },
  {
    get title() {
      return t("data.rooms.standing.showAndTell");
    },
    get sub() {
      return t("data.rooms.standing.showAndTellSub");
    },
    get when() {
      return slot(4, 17);
    },
    icon: "presentation",
  },
];

/**
 * Where the live room's clock stands when the demo mounts — 34:12, matching
 * room r1's "Live now · 34 min". The comp froze the readout at this value;
 * here it is the starting point and `elapsed` moves it.
 */
export const ROOM_ELAPSED_BASE_SEC = 34 * 60 + 12;

/** Your own monogram, appended to the face row of the room you are in. */
export const YOU_FACE = STUDENT.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w.charAt(0).toUpperCase())
  .join("");
