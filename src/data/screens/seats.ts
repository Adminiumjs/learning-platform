/*
 * Team seats — page-local seed data.
 *
 * A studio block of five seats: three people working, one invite still out and
 * one seat nobody has claimed. None of this is contract data — it belongs to
 * the buying organisation, not to Yara's catalogue — so it lives here rather
 * than behind the `dataSource` seam.
 *
 * `SeatStatus` stays as the English token because it is the row's state id,
 * switched on by the screen; its reader-facing names are `data.seatStatus.*`.
 * The empty seat's two placeholder cells are interface and are translated.
 */

import { t } from "../../i18n/ambient";

export type SeatStatus = "Active" | "Invited" | "Open";

export interface SeatMember {
  name: string;
  email: string;
  course: string;
  /** Percent of that course finished. */
  pct: number;
  status: SeatStatus;
}

export const SEAT_MEMBERS: SeatMember[] = [
  {
    name: "Rosa Marchetti",
    email: "rosa@marchetti.studio",
    course: "Design Systems",
    pct: 50,
    status: "Active",
  },
  {
    name: "Elena Bruno",
    email: "elena@marchetti.studio",
    course: "Type & Layout",
    pct: 72,
    status: "Active",
  },
  {
    name: "Paolo Greco",
    email: "paolo@marchetti.studio",
    course: "Design Systems",
    pct: 18,
    status: "Active",
  },
  {
    name: "Sara Iachini",
    email: "sara@marchetti.studio",
    course: "Motion for Interfaces",
    pct: 0,
    status: "Invited",
  },
  {
    name: "—",
    get email() {
      return t("data.seats.freeSeat");
    },
    get course() {
      return t("data.seats.unassigned");
    },
    pct: 0,
    status: "Open",
  },
];

/** What a seat costs on the studio block — list price less the 10%. */
export const SEAT_PRICE = 162;

/** The courses an invite can be attached to. Course names are fiction. */
export const SEAT_COURSES: { id: string; label: string }[] = [
  { id: "ds", label: "Design Systems" },
  { id: "ty", label: "Type & Layout" },
];
