/*
 * Study-rooms seed — the comp's `roomsV()` fixtures.
 *
 * Page-local: rooms are a peer-run thing, not part of the course contract, so
 * nothing outside this screen reads them.
 */

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

export const STUDY_ROOMS: StudyRoom[] = [
  {
    id: "r1",
    title: "Specimen swap",
    topic: "Bring your type specimen, get three sets of eyes on it before Thursday.",
    live: true,
    when: "Live now · 34 min",
    faces: ["TL", "PR", "AB", "CO"],
    count: "4 of 6",
  },
  {
    id: "r2",
    title: "Token clinic",
    topic: "Priya is walking through her three-layer setup. Bring the thing that broke.",
    live: true,
    when: "Live now · 12 min",
    faces: ["PR", "BA"],
    count: "2 of 6",
  },
  {
    id: "r3",
    title: "Week 2 catch-up",
    topic: "For anyone behind on the token sheet. No judgement, we have all been there.",
    live: false,
    when: "Tomorrow 19:00",
    faces: ["MF", "KM", "DF"],
    count: "3 going",
  },
  {
    id: "r4",
    title: "Quiet co-working",
    topic: "Cameras off, mics off, timer on. Two hours of getting it done.",
    live: false,
    when: "Saturday 10:00",
    faces: ["FN", "NL", "AN", "IH", "JW"],
    count: "5 going",
  },
];

export const STANDING_SESSIONS: StandingSession[] = [
  {
    title: "Monday kick-off",
    sub: "Twenty minutes, what everyone is doing this week",
    when: "Mon 09:00",
    icon: "sunrise",
  },
  {
    title: "Midweek co-working",
    sub: "Two hours, cameras optional, timer shared",
    when: "Wed 19:00",
    icon: "timer",
  },
  {
    title: "Friday show and tell",
    sub: "Five minutes each, rough work encouraged",
    when: "Fri 17:00",
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
