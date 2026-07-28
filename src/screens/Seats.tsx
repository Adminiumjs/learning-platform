/*
 * Team seats — a studio buying a block of places and handing them out.
 *
 * The seat count is the one number that moves: it re-prices the block, it
 * re-scales the claimed bar, and it decides how much of the member table is
 * visible. Everything else on the screen reads off it.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  IconButton,
  PageHead,
  Pill,
  ProgressBar,
  Segmented,
  TextInput,
} from "../components";
import type { Tone } from "../components";
import { SEAT_COURSES, SEAT_MEMBERS, SEAT_PRICE } from "../data/screens/seats";
import type { SeatStatus } from "../data/screens/seats";
import { useAppStore } from "../state/store";
import "../styles/screen-seats.css";

const MIN_SEATS = 1;
const MAX_SEATS = 50;

/** How each seat state pills itself, and whether its bar counts as progress. */
const SEAT_TONE: Record<SeatStatus, Tone> = {
  Active: "pos",
  Invited: "warn",
  Open: "neutral",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2);
}

export default function Seats() {
  const tsSeats = useAppStore((s) => s.tsSeats);
  const tsInvite = useAppStore((s) => s.tsInvite);
  const tsCourse = useAppStore((s) => s.tsCourse);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  /* Buying more seats than the studio has filled does not invent people, so
     the table is the roster capped at the seats actually paid for. */
  const members = SEAT_MEMBERS.slice(0, tsSeats);

  /* The comp hardcoded `used = 4`, which then contradicted its own table as
     soon as you dropped below four seats ("4 of 3 claimed"). Counting the
     non-open seats on show gives the same 4 at the seeded five, and stays
     true at every other count. */
  const claimed = members.filter((m) => m.status !== "Open").length;
  const claimedPct = Math.min(100, Math.round((claimed / tsSeats) * 100));

  const sendInvite = () => {
    if (!tsInvite.trim()) {
      showToast("An email address first.", "info");
      return;
    }
    set({ tsInvite: "" });
    showToast("Invite sent. The seat is held for 14 days.", "send");
  };

  return (
    <div className="lp-page scr-seats">
      <PageHead
        className="ts-head"
        title="Team seats"
        lede="Marchetti Studio · buy a block of seats and hand them out as people join."
      />

      <div className="ts-top">
        <section className="lp-cardbox ts-plan">
          <h2 className="ts-plan__head">Seats on your plan</h2>

          <div className="ts-count">
            <IconButton
              icon="minus"
              className="ts-step"
              title="One fewer seat"
              onClick={() => set({ tsSeats: Math.max(MIN_SEATS, tsSeats - 1) })}
            />
            <span className="lp-mono ts-count__n">{tsSeats}</span>
            <IconButton
              icon="plus"
              className="ts-step"
              title="One more seat"
              onClick={() => set({ tsSeats: Math.min(MAX_SEATS, tsSeats + 1) })}
            />
            <div className="ts-price">
              <div className="lp-mono ts-price__total">${tsSeats * SEAT_PRICE}</div>
              <div className="ts-price__per">${SEAT_PRICE} per seat · 10% off</div>
            </div>
          </div>

          <div className="ts-claimed">
            <ProgressBar pct={claimedPct} className="ts-claimed__bar" label="Seats claimed" />
            <span className="lp-mono ts-claimed__n">
              {claimed} of {tsSeats} claimed
            </span>
          </div>

          <div className="ts-actions">
            <ButtonPrimary
              className="ts-buy"
              onClick={() => showToast(`Seats updated to ${tsSeats} · demo only.`, "users")}
            >
              Update seats
            </ButtonPrimary>
            <ButtonSecondary className="ts-billing" onClick={() => go("teambilling")}>
              Billing
            </ButtonSecondary>
          </div>
        </section>

        <section className="ts-invite">
          <h2 className="ts-invite__head">Invite someone</h2>
          <TextInput
            className="ts-invite__field"
            value={tsInvite}
            onChange={(v) => set({ tsInvite: v })}
            placeholder="name@studio.com"
            type="email"
            inputMode="email"
            ariaLabel="Email address to invite"
          />
          <Segmented
            className="ts-seg"
            options={SEAT_COURSES.map((c) => ({ id: c.id, label: c.label }))}
            value={tsCourse}
            onChange={(id) => set({ tsCourse: id })}
            label="Course this seat opens"
          />
          <ButtonPrimary className="ts-send" onClick={sendInvite}>
            Send invite
          </ButtonPrimary>
          <span className="ts-invite__note">
            They get an email with a seat attached. Unclaimed invites free up after 14 days.
          </span>
        </section>
      </div>

      <section className="lp-list ts-table">
        <div className="ts-row ts-row--head">
          <span>Member</span>
          <span className="ts-cell-course">Course</span>
          <span>Progress</span>
          <span className="ts-cell-status">Status</span>
        </div>
        {members.map((m) => {
          const open = m.status === "Open";
          const idle = open || m.status === "Invited";
          return (
            <div className="lp-row ts-row" key={m.email}>
              <span className="ts-member">
                <Avatar
                  initials={open ? "+" : initials(m.name)}
                  size="sm"
                  className={open ? "ts-av ts-av--open" : "ts-av"}
                />
                <span className="ts-member__text">
                  <span className="ts-member__name">{open ? "Free seat" : m.name}</span>
                  <span className="ts-member__email">{m.email}</span>
                </span>
              </span>
              <span className="ts-cell-course ts-member__course">{m.course}</span>
              <span className="ts-progress">
                <ProgressBar
                  pct={m.pct}
                  tone={idle ? "neutral" : "accent"}
                  className="ts-progress__bar"
                  label={`${m.name} progress`}
                />
                <span className="lp-mono ts-progress__pct">{open ? "—" : `${m.pct}%`}</span>
              </span>
              <span className="ts-cell-status">
                <Pill tone={SEAT_TONE[m.status]}>{m.status}</Pill>
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
