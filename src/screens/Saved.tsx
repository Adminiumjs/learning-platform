/*
 * Saved — the courses the student bookmarked but has not bought.
 *
 * Two of them, because a saved list of one is not a list. Removing a course is
 * undoable from the toast, which is the whole reason `svRemoved` is a map of
 * ids rather than a filtered array: nothing is really deleted.
 */

import {
  ButtonPrimary,
  ButtonSecondary,
  Card,
  CoverChip,
  EmptyState,
  Icon,
  IconButton,
  PageHead,
  Pill,
} from "../components";
import { dataSource } from "../data/source";
import type { Course } from "../data/types";
import { useI18n } from "../i18n";
import { fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-saved.css";

/**
 * The two saved courses, in the comp's order (Portfolio Studio, then Motion).
 * Ids rather than array positions, so reordering the catalogue cannot silently
 * change what is on this page.
 */
const SAVED_IDS = ["PF-310", "MO-220"];

/**
 * When the next cohort opens. It is deliberately *not* on the demo clock: the
 * clock runs cohort 03, and this is the intake after it.
 */
const NEXT_COHORT_START = new Date(2026, 8, 7);

export default function Saved() {
  const { t, money, number } = useI18n();
  const svRemoved = useAppStore((s) => s.svRemoved);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openCourse = useAppStore((s) => s.openCourse);
  const showToast = useAppStore((s) => s.showToast);

  const catalogue = dataSource.courses();
  const list = SAVED_IDS.map((id) => catalogue.find((c) => c.id === id))
    .filter((c): c is Course => Boolean(c))
    .filter((c) => !svRemoved[c.id]);

  const remove = (c: Course) => {
    set({ svRemoved: { ...svRemoved, [c.id]: 1 } });
    showToast(t("screensB.saved.removed"), "bookmark-x", t("screensB.saved.undo"), () => {
      /* Read the live map, not the closed-over one — other rows may have gone since. */
      const current = { ...useAppStore.getState().svRemoved };
      delete current[c.id];
      set({ svRemoved: current });
    });
  };

  return (
    <div className="lp-page scr-saved">
      <PageHead
        title={t("screensB.saved.title")}
        lede={
          list.length
            ? t("screensB.saved.lede", { total: number(list.length) }, list.length)
            : t("screensB.saved.ledeEmpty")
        }
        action={
          <ButtonSecondary className="sv-head__cta" onClick={() => go("catalog")}>
            {t("screensB.saved.browse")}
          </ButtonSecondary>
        }
      />

      {list.length ? (
        <div className="sv-list">
          {list.map((c) => {
            const cohort = c.kind === "cohort";
            return (
              <Card key={c.id} className="sv-row" interactive>
                <CoverChip tint={c.tint} icon={c.icon} size="lg" iconSize={24} />

                <div className="sv-row__body">
                  <div className="sv-row__head">
                    <span className="sv-row__title">{c.title}</span>
                    <Pill tone={cohort ? "accent" : "neutral"}>
                      {cohort
                        ? t("screensB.saved.cohortStarts", {
                            date: fmtDate(NEXT_COHORT_START),
                          })
                        : t("screensB.saved.selfPaced")}
                    </Pill>
                  </div>
                  <p className="sv-row__sub">{c.blurb}</p>
                  {cohort ? (
                    <p className="sv-row__notify">
                      <Icon name="bell" size={14} />
                      {t("screensB.saved.emailWhenOpen")}
                    </p>
                  ) : null}
                </div>

                <span className="sv-row__price lp-mono">{money(c.price)}</span>

                <div className="sv-row__acts">
                  <ButtonPrimary className="sv-row__cta" onClick={() => openCourse(c.id)}>
                    {cohort ? t("screensB.saved.joinWaitlist") : t("screensB.saved.enrol")}
                  </ButtonPrimary>
                  <IconButton
                    icon="bookmark-x"
                    className="sv-row__remove"
                    title={t("screensB.saved.removeAria", { title: c.title })}
                    onClick={() => remove(c)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* The comp's empty state carried a filled CTA; the shared one is
           bordered, which is the house treatment for a secondary route out. */
        <EmptyState
          className="sv-empty"
          icon="bookmark"
          title={t("screensB.saved.emptyTitle")}
          body={t("screensB.saved.emptyBody")}
          action={{ label: t("screensB.saved.browse"), onClick: () => go("catalog") }}
        />
      )}

      <div className="sv-compare">
        <Icon name="git-compare" size={18} className="sv-compare__ico" />
        <span className="sv-compare__text">{t("screensB.saved.compareText")}</span>
        <ButtonSecondary className="sv-compare__cta" onClick={() => go("compare")}>
          {t("screensB.saved.compareCta")}
        </ButtonSecondary>
      </div>
    </div>
  );
}
