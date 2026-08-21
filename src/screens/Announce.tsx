/*
 * Announcements.
 *
 * A composer and the feed under it. Posting prepends to `annsAdded` in the
 * store, so a new announcement survives leaving the screen; the two seeded
 * ones come from the shared source and are never mutated.
 *
 * Pinning is honest about itself: the pin toggle in the composer really does
 * pin the thing you are about to post, but the Pin/Unpin control on an
 * existing card only says so — nothing here writes to a server.
 */

import { ButtonPrimary, Card, Icon, PageHead, Pill, TextArea, TextInput } from "../components";
import { dataSource } from "../data/source";
import type { Announcement } from "../data/types";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-announce.css";

export default function Announce() {
  const { t, number } = useI18n();
  const anTitle = useAppStore((s) => s.anTitle);
  const anBody = useAppStore((s) => s.anBody);
  const anPin = useAppStore((s) => s.anPin);
  const annsAdded = useAppStore((s) => s.annsAdded);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  /* The comp hardcoded "30" in both the audience line and every new card. */
  const audience = dataSource.students().length;

  /* Stable sort: pinned first, newest first inside each group. */
  const feed = [...annsAdded, ...dataSource.announcements()].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );

  function post(): void {
    if (!anTitle.trim() || !anBody.trim()) {
      showToast(t("screensA.announce.needTitleAndBody"), "info");
      return;
    }
    const next: Announcement = {
      id: `new${annsAdded.length}`,
      title: anTitle.trim(),
      body: anBody.trim(),
      pinned: anPin,
      /* Rendered copy, so it is stamped in the reader's language at the moment
         it is written — the record carries text, not a key. */
      at: t("screensA.announce.justNow"),
      sent: t("screensA.announce.sendingTo", { count: number(audience) }, audience),
    };
    set({ annsAdded: [next, ...annsAdded], anTitle: "", anBody: "", anPin: false });
    showToast(t("screensA.announce.posted"), "megaphone");
  }

  return (
    <div className="lp-page scr-announce">
      <PageHead title={t("screensA.announce.title")} lede={t("screensA.announce.lede")} />

      <div className="an-compose">
        <TextInput
          value={anTitle}
          onChange={(v) => set({ anTitle: v })}
          placeholder={t("screensA.announce.titlePlaceholder")}
          className="an-title"
          ariaLabel={t("screensA.announce.titleLabel")}
        />
        <TextArea
          value={anBody}
          onChange={(v) => set({ anBody: v })}
          placeholder={t("screensA.announce.bodyPlaceholder")}
          rows={4}
          className="an-body"
          ariaLabel={t("screensA.announce.bodyLabel")}
        />
        <div className="an-compose__foot">
          <button
            type="button"
            className={`lp-chip an-pin${anPin ? " is-on" : ""}`}
            onClick={() => set({ anPin: !anPin })}
            aria-pressed={anPin}
          >
            <Icon name="pin" size={14} />
            {anPin ? t("screensA.announce.pinnedToTop") : t("screensA.announce.pinToTop")}
          </button>
          <span className="an-audience">
            {t("screensA.announce.audience", { count: number(audience) }, audience)}
          </span>
          <ButtonPrimary className="an-post" onClick={post}>
            {t("screensA.announce.post")}
          </ButtonPrimary>
        </div>
      </div>

      {feed.map((a) => (
        <Card key={a.id} accent={a.pinned} className="an-card">
          <div className="an-card__top">
            {a.pinned ? (
              <Pill tone="accent" icon="pin" className="an-pinpill">
                {t("screensA.announce.pinned")}
              </Pill>
            ) : null}
            <span className="an-card__title">{a.title}</span>
            <span className="lp-mono an-card__at">{a.at}</span>
          </div>
          <p className="an-card__body">{a.body}</p>
          <div className="an-card__foot">
            <span className="an-card__sent">
              <Icon name="mail" size={14} />
              {a.sent}
            </span>
            <button
              type="button"
              className="lp-nav an-card__pin"
              onClick={() =>
                showToast(
                  a.pinned
                    ? t("screensA.announce.unpinnedDemo")
                    : t("screensA.announce.pinnedDemo"),
                  "pin",
                )
              }
            >
              {a.pinned ? t("screensA.announce.unpin") : t("screensA.announce.pinShort")}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
