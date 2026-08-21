/*
 * Waitlist.
 *
 * Fourteen people who wanted cohort 03 and did not get in, each carrying the
 * reason they gave. The reason column is the screen: it turns a queue into
 * fourteen decisions — a team of three, someone repeating, someone who has
 * been waiting since cohort 02.
 *
 * Inviting is one-way here. Nothing un-invites, because in the real thing an
 * offer email has already left.
 */

import { Avatar, ButtonPrimary, ButtonSecondary, PageHead } from "../components";
import { COHORT_04_OPENS, COHORT_04_SOLD, WAITLIST } from "../data/screens/waitlist";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-waitlist.css";

/** How long an offered seat is held before it goes back on the list. */
const HOLD_HOURS = 48;

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function Waitlist() {
  const { t, number } = useI18n();
  const wlInvited = useAppStore((s) => s.wlInvited);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const seats = dataSource.cohortCapacity();
  const invitedCount = Object.keys(wlInvited).length;
  const hold = number(HOLD_HOURS, { style: "unit", unit: "hour", unitDisplay: "long" });

  function invite(name: string): void {
    if (wlInvited[name]) return;
    set({ wlInvited: { ...wlInvited, [name]: 1 } });
    showToast(t("screensB.waitlist.offered", { name, hold }), "send");
  }

  function inviteAll(): void {
    const all: Record<string, number> = {};
    for (const p of WAITLIST) all[p.name] = 1;
    set({ wlInvited: all });
    showToast(
      t("screensB.waitlist.allSent", { total: number(WAITLIST.length) }, WAITLIST.length),
      "send",
    );
  }

  const stats = [
    { label: t("screensB.waitlist.statWaiting"), value: number(WAITLIST.length) },
    { label: t("screensB.waitlist.statInvited"), value: number(invitedCount) },
    {
      label: t("screensB.waitlist.statSold"),
      value: t("screensB.waitlist.soldValue", {
        sold: number(COHORT_04_SOLD),
        total: number(seats),
      }),
    },
  ];

  return (
    <div className="lp-page scr-waitlist">
      <PageHead
        className="wl-head"
        title={t("screensB.waitlist.title")}
        lede={t(
          "screensB.waitlist.lede",
          { total: number(WAITLIST.length), date: COHORT_04_OPENS },
          WAITLIST.length,
        )}
        action={
          <ButtonPrimary icon="send" iconSize={15} className="wl-all" onClick={inviteAll}>
            {t("screensB.waitlist.inviteAll")}
          </ButtonPrimary>
        }
      />

      <div className="wl-stats">
        {stats.map((s) => (
          <div className="wl-stat" key={s.label}>
            <span className="lp-mono wl-stat__value">{s.value}</span>
            <span className="wl-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="lp-list wl-table">
        <div className="wl-row wl-row--head">
          <span>{t("screensB.waitlist.colPerson")}</span>
          <span className="wl-col--soft">{t("screensB.waitlist.colJoined")}</span>
          <span className="wl-col--soft">{t("screensB.waitlist.colWhy")}</span>
          <span className="wl-row__end">{t("screensB.waitlist.colAction")}</span>
        </div>

        {WAITLIST.map((p) => {
          const done = !!wlInvited[p.name];
          return (
            <div className="wl-row" key={p.name}>
              <span className="wl-who">
                <Avatar
                  initials={initials(p.name)}
                  size="sm"
                  className={`wl-ava${done ? " wl-ava--done" : ""}`}
                />
                <span className="wl-who__text">
                  <span className="wl-who__name">{p.name}</span>
                  <span className="wl-who__email">{p.email}</span>
                </span>
              </span>
              <span className="lp-mono wl-at wl-col--soft">{p.at}</span>
              <span className="wl-why wl-col--soft">{p.why}</span>
              <span className="wl-row__end">
                <ButtonSecondary
                  className={`wl-invite${done ? " wl-invite--done" : ""}`}
                  onClick={() => invite(p.name)}
                >
                  {done ? t("screensB.waitlist.invited") : t("screensB.waitlist.invite")}
                </ButtonSecondary>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
