/*
 * Content — the curriculum, as the instructor sees it.
 *
 * Every module and lesson comes from the same `dataSource` the student's
 * classroom reads, so the release switches here are the other end of the D6
 * drip: a lesson set to "Unlocks on" tells the student its module date, and
 * "Published" opens it now.
 *
 * The default per lesson is derived, not stored — a module whose week has
 * already arrived reads as published, everything later reads as scheduled.
 * `rel` only holds the lessons the instructor has actually overridden, so
 * advancing the demo clock keeps flipping the untouched ones on its own.
 *
 * Reordering is grip-handle affordance only. There is no drag: the comp did
 * not implement one either, and a half-working drag would be a worse lie than
 * a cursor that says "you could".
 */

import {
  ButtonSecondary,
  Icon,
  PageHead,
  Pill,
  Segmented,
} from "../components";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { fmtDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-content.css";

/** The two release states a lesson can be switched between. */
type Release = "pub" | "sch";

export default function Content() {
  const { t, number } = useI18n();
  const week = useAppStore((s) => s.week);
  const ccDraft = useAppStore((s) => s.ccDraft);
  const rel = useAppStore((s) => s.rel);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const kinds = dataSource.lessonKinds();

  const releaseOptions: { id: Release; label: string }[] = [
    { id: "pub", label: t("screensA.content.published") },
    { id: "sch", label: t("screensA.content.unlocksOn") },
  ];

  const toggleDraft = (id: string, title: string, draft: boolean) => {
    /* `ccDraft` is typed as a string map on the store, so the flag is a
       non-empty string rather than the comp's boolean. */
    set({ ccDraft: { ...ccDraft, [id]: draft ? "" : "draft" } });
    showToast(
      draft
        ? t("screensA.content.nowLive", { title })
        : t("screensA.content.nowHidden", { title }),
      draft ? "globe" : "eye-off",
    );
  };

  const setRelease = (id: string, title: string, next: Release) => {
    set({ rel: { ...rel, [id]: next } });
    /* Only publishing is worth a toast — scheduling is the resting state. */
    if (next === "pub") showToast(t("screensA.content.nowVisible", { title }), "globe");
  };

  return (
    <div className="lp-page scr-content">
      <PageHead
        title={t("screensA.content.title")}
        lede={t("screensA.content.lede")}
        action={
          <ButtonSecondary
            icon="plus"
            onClick={() => showToast(t("screensA.content.addModuleDemo"), "plus")}
          >
            {t("screensA.content.addModule")}
          </ButtonSecondary>
        }
      />

      <div className="cc-modules">
        {dataSource.modules().map((m) => {
          const draft = Boolean(ccDraft[m.id]);
          const opensOn = fmtDate(weekStart(m.week));

          return (
            <section key={m.id} className="cc-mod">
              <header className="cc-mod__head">
                <Icon name="grip-vertical" size={16} className="cc-grip" />
                <span className="cc-mod__num lp-mono">{m.num}</span>
                <h2 className="cc-mod__title">{m.title}</h2>
                <span className="cc-mod__sub">
                  {t(
                    "screensA.content.moduleSub",
                    {
                      week: number(m.week),
                      date: opensOn,
                      count: number(m.lessons.length),
                    },
                    m.lessons.length,
                  )}
                </span>
                <button
                  type="button"
                  className={`lp-chip cc-draft${draft ? " is-draft" : ""}`}
                  onClick={() => toggleDraft(m.id, m.title, draft)}
                  aria-pressed={draft}
                >
                  <Icon name={draft ? "pencil" : "globe"} size={13} />
                  {draft ? t("screensA.content.draft") : t("screensA.content.published")}
                </button>
              </header>

              {m.lessons.map((l) => {
                /* A module whose week has landed is published unless the
                   instructor said otherwise — the drip's default. */
                const mode: Release = (rel[l.id] as Release) || (m.week <= week ? "pub" : "sch");
                const kind = kinds[l.kind];

                return (
                  <div key={l.id} className="cc-lesson">
                    <Icon name="grip-vertical" size={15} className="cc-grip" />
                    <Pill tone="neutral" icon={kind.i} iconSize={12} className="cc-kind">
                      {kind.l}
                    </Pill>
                    <span className="cc-lesson__title">{l.title}</span>
                    <span className="cc-lesson__dur lp-mono">{l.dur}</span>
                    <Segmented
                      className="cc-seg"
                      options={releaseOptions}
                      value={mode}
                      onChange={(next) => setRelease(l.id, l.title, next)}
                      label={t("screensA.content.releaseOf", { title: l.title })}
                    />
                    <span className={`cc-release${mode === "pub" ? " cc-release--live" : ""}`}>
                      {mode === "pub"
                        ? t("screensA.content.liveNow")
                        : t("screensA.content.studentsSeeOn", { date: opensOn })}
                    </span>
                  </div>
                );
              })}

              <button
                type="button"
                className="lp-row cc-add"
                onClick={() => showToast(t("screensA.content.addLessonDemo"), "plus")}
              >
                <Icon name="plus" size={15} />
                {t("screensA.content.addLessonTo", { module: m.title })}
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
