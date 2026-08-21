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
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-seats.css";

const MIN_SEATS = 1;
const MAX_SEATS = 50;
/** The block discount, and how long an unclaimed invite holds its seat. */
const BULK_DISCOUNT = 0.1;
const HOLD_DAYS = 14;
/** The studio buying the block — an in-fiction organisation name. */
const ORG = "Marchetti Studio";

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
  const { t, money, number } = useI18n();
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

  const holdDays = number(HOLD_DAYS, { style: "unit", unit: "day", unitDisplay: "long" });

  const sendInvite = () => {
    if (!tsInvite.trim()) {
      showToast(t("screensB.seats.needEmail"), "info");
      return;
    }
    set({ tsInvite: "" });
    showToast(t("screensB.seats.inviteSent", { days: holdDays }), "send");
  };

  return (
    <div className="lp-page scr-seats">
      <PageHead
        className="ts-head"
        title={t("screensB.seats.title")}
        lede={t("screensB.seats.lede", { org: ORG })}
      />

      <div className="ts-top">
        <section className="lp-cardbox ts-plan">
          <h2 className="ts-plan__head">{t("screensB.seats.planHead")}</h2>

          <div className="ts-count">
            <IconButton
              icon="minus"
              className="ts-step"
              title={t("screensB.seats.oneFewer")}
              onClick={() => set({ tsSeats: Math.max(MIN_SEATS, tsSeats - 1) })}
            />
            <span className="lp-mono ts-count__n">{number(tsSeats)}</span>
            <IconButton
              icon="plus"
              className="ts-step"
              title={t("screensB.seats.oneMore")}
              onClick={() => set({ tsSeats: Math.min(MAX_SEATS, tsSeats + 1) })}
            />
            <div className="ts-price">
              <div className="lp-mono ts-price__total">{money(tsSeats * SEAT_PRICE)}</div>
              <div className="ts-price__per">
                {t("screensB.seats.perSeat", {
                  price: money(SEAT_PRICE),
                  off: number(BULK_DISCOUNT, { style: "percent" }),
                })}
              </div>
            </div>
          </div>

          <div className="ts-claimed">
            <ProgressBar
              pct={claimedPct}
              className="ts-claimed__bar"
              label={t("screensB.seats.claimedBar")}
            />
            <span className="lp-mono ts-claimed__n">
              {t("screensB.seats.claimedCount", {
                claimed: number(claimed),
                total: number(tsSeats),
              })}
            </span>
          </div>

          <div className="ts-actions">
            <ButtonPrimary
              className="ts-buy"
              onClick={() =>
                showToast(t("screensB.seats.updatedToast", { total: number(tsSeats) }), "users")
              }
            >
              {t("screensB.seats.updateSeats")}
            </ButtonPrimary>
            <ButtonSecondary className="ts-billing" onClick={() => go("teambilling")}>
              {t("screensB.seats.billing")}
            </ButtonSecondary>
          </div>
        </section>

        <section className="ts-invite">
          <h2 className="ts-invite__head">{t("screensB.seats.inviteHead")}</h2>
          <TextInput
            className="ts-invite__field"
            value={tsInvite}
            onChange={(v) => set({ tsInvite: v })}
            /* A sample address is a machine token, not copy. */
            placeholder="name@studio.com"
            type="email"
            inputMode="email"
            ariaLabel={t("screensB.seats.inviteAria")}
          />
          <Segmented
            className="ts-seg"
            options={SEAT_COURSES.map((c) => ({ id: c.id, label: c.label }))}
            value={tsCourse}
            onChange={(id) => set({ tsCourse: id })}
            label={t("screensB.seats.courseLabel")}
          />
          <ButtonPrimary className="ts-send" onClick={sendInvite}>
            {t("screensB.seats.sendInvite")}
          </ButtonPrimary>
          <span className="ts-invite__note">
            {t("screensB.seats.inviteNote", { days: holdDays })}
          </span>
        </section>
      </div>

      <section className="lp-list ts-table">
        <div className="ts-row ts-row--head">
          <span>{t("screensB.seats.colMember")}</span>
          <span className="ts-cell-course">{t("screensB.seats.colCourse")}</span>
          <span>{t("screensB.seats.colProgress")}</span>
          <span className="ts-cell-status">{t("screensB.seats.colStatus")}</span>
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
                  <span className="ts-member__name">
                    {open ? t("screensB.seats.freeSeat") : m.name}
                  </span>
                  <span className="ts-member__email">{m.email}</span>
                </span>
              </span>
              <span className="ts-cell-course ts-member__course">{m.course}</span>
              <span className="ts-progress">
                <ProgressBar
                  pct={m.pct}
                  tone={idle ? "neutral" : "accent"}
                  className="ts-progress__bar"
                  label={t("screensB.seats.progressAria", { name: m.name })}
                />
                <span className="lp-mono ts-progress__pct">
                  {open ? "—" : number(m.pct / 100, { style: "percent" })}
                </span>
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
