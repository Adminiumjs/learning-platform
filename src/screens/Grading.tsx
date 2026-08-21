/*
 * Grading — the queue, and the one screen where the instructor half does real
 * work.
 *
 * A list of what is waiting on the left, the submission open on the right.
 * Saving a grade drops it out of the queue, resets the form and moves to the
 * top of whatever is left; the toast carries an Undo, because a mis-typed
 * score should not need a support ticket.
 *
 * `gqDone` is the only thing this screen writes to shared state, and the Teach
 * dashboard's "Awaiting a grade" tile counts the same map — the two are never
 * out of step because neither stores a total.
 */

import {
  AttachmentChip,
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  EmptyState,
  Field,
  PageHead,
  Pill,
  TextArea,
  TextInput,
} from "../components";
import { QUICK_SCORE_OFFSETS, SEEDED_GRADED } from "../data/screens/grading";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-grading.css";

export default function Grading() {
  const { t, number } = useI18n();
  const gqI = useAppStore((s) => s.gqI);
  const gqPts = useAppStore((s) => s.gqPts);
  const gqFb = useAppStore((s) => s.gqFb);
  const gqDone = useAppStore((s) => s.gqDone);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const all = dataSource.submissions();
  const pending = all.filter((s) => !gqDone[s.id]);
  const graded = SEEDED_GRADED + Object.keys(gqDone).length;

  if (pending.length === 0) {
    const capacity = dataSource.cohortCapacity();
    return (
      <div className="lp-page scr-grading">
        <PageHead
          title={t("screensA.grading.title")}
          lede={t("screensA.grading.ledeClear", { count: number(graded) }, graded)}
        />
        <EmptyState
          className="gq-clear"
          icon="check-check"
          title={t("screensA.grading.emptyTitle")}
          body={t("screensA.grading.emptyBody", { count: number(capacity) }, capacity)}
        />
      </div>
    );
  }

  /* Grading the last item in the queue leaves `gqI` past the end. */
  const i = Math.min(gqI, pending.length - 1);
  const cur = pending[i];

  const openAt = (ix: number) => set({ gqI: ix, gqPts: "", gqFb: "" });

  const save = () => {
    if (!gqPts) {
      showToast(t("screensA.grading.needScore"), "info");
      return;
    }
    const scored = gqPts;
    set({ gqDone: { ...gqDone, [cur.id]: 1 }, gqPts: "", gqFb: "", gqI: 0 });
    showToast(
      t("screensA.grading.savedToast", { who: cur.who, score: scored, max: number(cur.max) }),
      "check",
      t("screensA.grading.undo"),
      () => {
        /* Read the map fresh: another submission may have been graded while the
           toast was up, and this must only take back its own row. */
        const next = { ...useAppStore.getState().gqDone };
        delete next[cur.id];
        set({ gqDone: next });
      },
    );
  };

  return (
    <div className="lp-page scr-grading">
      <PageHead
        title={t("screensA.grading.title")}
        lede={t("screensA.grading.lede", {
          waiting: number(pending.length),
          graded: number(graded),
        })}
      />

      <div className="gq-grid">
        <section className="lp-list gq-queue">
          <header className="gq-queue__head">
            {t("screensA.grading.pending", { count: number(pending.length) })}
          </header>

          {pending.map((s, ix) => (
            <button
              key={s.id}
              type="button"
              className={`lp-row gq-row${ix === i ? " is-on" : ""}`}
              onClick={() => openAt(ix)}
              aria-current={ix === i}
            >
              <Avatar initials={s.ini} size="sm" accent={ix === i} />
              <span className="gq-row__text">
                <span className="gq-row__who">{s.who}</span>
                <span className="gq-row__item">
                  {t("screensA.grading.rowMeta", { item: s.item, at: s.at })}
                </span>
              </span>
              {/* Tone switches on the machine token; the badge draws the label. */}
              <Pill tone={s.tag === "late" ? "warn" : "neutral"}>{s.tagLabel}</Pill>
            </button>
          ))}
        </section>

        <section className="gq-detail">
          <header className="gq-detail__head">
            <Avatar initials={cur.ini} size="lg" />
            <div className="gq-detail__who">
              <h2 className="gq-detail__name">{cur.who}</h2>
              <p className="gq-detail__meta">
                {t("screensA.grading.submittedMeta", { item: cur.item, at: cur.at })}
              </p>
            </div>
            <Pill className="gq-detail__tag" tone={cur.tag === "late" ? "warn" : "neutral"}>
              {cur.kind}
            </Pill>
          </header>

          <div className="lp-scroll gq-detail__body">
            <div className="gq-work">
              <div className="gq-work__label">{t("screensA.grading.theirWork")}</div>
              <p className="gq-work__text">{cur.work}</p>
              {cur.files.length > 0 ? (
                <div className="gq-files">
                  {cur.files.map((f) => (
                    <AttachmentChip key={f.n} name={f.n} />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="gq-score">
              <Field label={t("screensA.grading.points")} htmlFor="gq-pts" className="gq-field">
                <span className="gq-ptsrow">
                  <TextInput
                    id="gq-pts"
                    className="gq-pts"
                    mono
                    inputMode="numeric"
                    placeholder={number(0)}
                    value={gqPts}
                    onChange={(v) => set({ gqPts: v })}
                  />
                  <span className="gq-max lp-mono">
                    {t("screensA.grading.max", { max: number(cur.max) })}
                  </span>
                </span>
              </Field>

              <div className="gq-quick">
                {QUICK_SCORE_OFFSETS.map((off) => {
                  const v = cur.max - off;
                  return (
                    <ButtonSecondary
                      key={v}
                      className="gq-quickbtn lp-mono"
                      onClick={() => set({ gqPts: String(v) })}
                    >
                      {t("screensA.grading.quickScore", {
                        score: number(v),
                        max: number(cur.max),
                      })}
                    </ButtonSecondary>
                  );
                })}
              </div>
            </div>

            <Field label={t("screensA.grading.feedback")} htmlFor="gq-fb">
              <TextArea
                id="gq-fb"
                className="gq-fb"
                value={gqFb}
                onChange={(v) => set({ gqFb: v })}
                placeholder={t("screensA.grading.feedbackPlaceholder")}
              />
            </Field>
          </div>

          <footer className="gq-foot">
            <ButtonSecondary onClick={() => openAt((i + 1) % pending.length)}>
              {t("screensA.grading.skip")}
            </ButtonSecondary>
            <ButtonPrimary className="gq-save" icon="arrow-right" iconEnd onClick={save}>
              {t("screensA.grading.saveAndNext")}
            </ButtonPrimary>
          </footer>
        </section>
      </div>
    </div>
  );
}
