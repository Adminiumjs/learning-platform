/*
 * Notifications — the feed, grouped by when rather than by type.
 *
 * Every row is a door: tapping one marks it read and goes where it points, so
 * the feed empties itself by being used rather than by a "clear" button. Read
 * state is a tombstone map in the store, which is why "Mark all as read" can
 * be a single patch and why nothing here mutates the seed.
 */

import { ButtonSecondary, Chip, ChipRow, EmptyState, Icon, PageHead } from "../components";
import type { Notif } from "../data/screens/notifs";
import { NOTIFS, NOTIF_GROUPS } from "../data/screens/notifs";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-notifs.css";

export default function Notifs() {
  const { t, number } = useI18n();
  const tab = useAppStore((s) => s.nfTab);
  const read = useAppStore((s) => s.nfRead);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const items: Notif[] = NOTIFS.map((n) => ({ ...n, unread: read[n.id] ? false : n.unread }));
  const unread = items.filter((n) => n.unread).length;

  const shown = items.filter((n) => tab === "all" || n.unread);
  const groups = NOTIF_GROUPS.map((label) => ({
    label,
    rows: shown.filter((n) => n.group === label),
  })).filter((g) => g.rows.length > 0);

  function open(n: Notif) {
    set({ nfRead: { ...read, [n.id]: 1 } });
    go(n.go);
  }

  function markAll() {
    const all: Record<string, number> = {};
    for (const n of NOTIFS) all[n.id] = 1;
    set({ nfRead: all });
    showToast(t("screensB.notifs.allRead"), "check-check");
  }

  return (
    <div className="lp-page scr-notifs">
      <PageHead
        className="nf-head"
        title={t("screensB.notifs.title")}
        lede={
          unread
            ? t("screensB.notifs.ledeUnread", { total: number(unread) }, unread)
            : t("screensB.notifs.ledeClear")
        }
        action={
          <ButtonSecondary className="nf-markall" onClick={markAll}>
            {t("screensB.notifs.markAll")}
          </ButtonSecondary>
        }
      />

      <ChipRow>
        <Chip active={tab === "all"} onClick={() => set({ nfTab: "all" })} className="nf-tab">
          {t("screensB.notifs.tabAll")}
        </Chip>
        <Chip active={tab === "unread"} onClick={() => set({ nfTab: "unread" })} className="nf-tab">
          {t("screensB.notifs.tabUnread", { total: number(unread) })}
        </Chip>
      </ChipRow>

      {groups.map((g) => (
        <div className="nf-group" key={g.label}>
          <div className="nf-group__label">{g.label}</div>
          <div className="lp-list nf-list">
            {g.rows.map((n) => (
              <button
                type="button"
                className={`lp-list__row lp-row nf-row${n.unread ? " is-unread" : ""}`}
                key={n.id}
                onClick={() => open(n)}
              >
                <span className={`nf-tile nf-tile--${n.tone}`}>
                  <Icon name={n.icon} size={16} />
                </span>
                <span className="nf-row__main">
                  <span className="nf-row__title">{n.title}</span>
                  <span className="nf-row__sub">{n.sub}</span>
                </span>
                <span className="lp-mono nf-row__at">{n.at}</span>
                {n.unread ? (
                  <span className="nf-dot" aria-label={t("screensB.notifs.unreadDot")} />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* The comp rendered nothing at all once the Unread tab ran dry — the
          page just ended after the chips. An empty feed is a state worth
          drawing, and it is the state "Mark all as read" leaves you in. */}
      {groups.length === 0 ? (
        <EmptyState
          className="nf-empty"
          icon="check-check"
          title={t("screensB.notifs.emptyTitle")}
          body={t("screensB.notifs.emptyBody")}
          action={{
            label: t("screensB.notifs.showAll"),
            icon: "bell",
            onClick: () => set({ nfTab: "all" }),
          }}
        />
      ) : null}
    </div>
  );
}
