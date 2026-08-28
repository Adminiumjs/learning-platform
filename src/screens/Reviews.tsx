/*
 * Reviews — what thirty people said after eight weeks.
 *
 * Three blocks: the score, the box you write in, and the reviews themselves.
 * The write box sits above the list on purpose — the screen is not a rating
 * widget bolted to a sales page, it is the place a student who just finished
 * says something, and the instructor answers in public underneath.
 *
 * Everything you post lands in the list immediately and moves the average,
 * because a demo that quietly drops your input is not demonstrating anything.
 */

import { Avatar, ButtonPrimary, Chip, ChipRow, Icon, PageHead, Pill, ProgressBar, TextArea } from "../components";
import type { Review } from "../data/screens/reviews";
import { REVIEWS, REVIEW_FILTERS, STAR_LABELS } from "../data/screens/reviews";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { doneCount } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-reviews.css";

const RATINGS = [5, 4, 3, 2, 1];
/** The cohort the seeded reviews came out of. */
const COHORT_STUDENTS = 30;

/** Five stars, filled up to `n`. The fill colour lives in the stylesheet. */
function Stars({ n, size, label }: { n: number; size: number; label: string }) {
  return (
    <span className="rv-stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} className={`rv-star${i <= n ? " is-on" : ""}`} />
      ))}
    </span>
  );
}

/** Monogram from a name the student can rename themselves in Profile. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const two = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return two.toUpperCase() || "?";
}

export default function Reviews() {
  const { t, number } = useI18n();
  const filter = useAppStore((s) => s.rvFilter);
  const stars = useAppStore((s) => s.rvStars);
  const text = useAppStore((s) => s.rvText);
  /* The store keeps posted reviews as `unknown[]` so it need not know this
     screen's shape; this is the one place that knows what they are. */
  const added = useAppStore((s) => s.rvAdded) as Review[];
  const helpful = useAppStore((s) => s.rvHelpful);
  const done = useAppStore((s) => s.done);
  const name = useAppStore((s) => s.prName);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const course = dataSource.courses()[0];
  const instructor = dataSource.instructor();

  const all = [...added, ...REVIEWS];
  const avg = all.reduce((a, r) => a + r.stars, 0) / all.length;
  const avgText = number(avg, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const dist = RATINGS.map((n) => ({ n, c: all.filter((r) => r.stars === n).length }));
  const maxc = Math.max(...dist.map((d) => d.c)) || 1;

  const matching = all.filter((r) =>
    filter === "5" ? r.stars === 5 : filter === "4" ? r.stars === 4 : true,
  );
  /* The comp's "Most recent" chip filtered nothing and sorted nothing — a dead
     branch. It now sorts, which is what the label promises; the seed is
     already authored newest-first, so "All" and "Most recent" agree until you
     post one of your own. */
  const list =
    filter === "recent" ? [...matching].sort((a, b) => a.ageDays - b.ageDays) : matching;

  function post() {
    const body = text.trim();
    if (!body) {
      showToast(t("screensB.reviews.tooShort"), "info");
      return;
    }
    const mine: Review = {
      id: `rn${added.length}`,
      who: name,
      /* Derived, not hardcoded "RM" as the comp did — the name is editable in
         Profile, and a fixed monogram would go stale the moment it changes. */
      ini: initials(name),
      stars,
      at: t("screensB.reviews.justNow"),
      ageDays: 0,
      helpful: 0,
      verified: false,
      text: body,
    };
    set({ rvAdded: [mine, ...added], rvText: "" });
    showToast(
      t("screensB.reviews.posted", { name: instructor.name.split(" ")[0] }),
      "star",
    );
  }

  function toggleHelpful(id: string) {
    const next = { ...helpful };
    if (next[id]) delete next[id];
    else next[id] = 1;
    set({ rvHelpful: next });
  }

  return (
    <div className="lp-page scr-reviews">
      <PageHead
        className="rv-head"
        title={t("screensB.reviews.title")}
        lede={t("screensB.reviews.lede", { course: course.title })}
      />

      <div className="rv-top">
        <div className="lp-cardbox rv-score">
          <span className="lp-mono rv-score__num">{avgText}</span>
          <Stars
            n={Math.round(avg)}
            size={16}
            label={t("screensB.reviews.averageAria", { avg: avgText })}
          />
          <span className="rv-score__count">
            {t(
              "screensB.reviews.count",
              { total: number(all.length), students: number(COHORT_STUDENTS) },
              all.length,
            )}
          </span>
        </div>

        <div className="lp-cardbox rv-dist">
          {dist.map((d) => (
            <div className="rv-dist__row" key={d.n}>
              <span className="lp-mono rv-dist__n">{number(d.n)}★</span>
              <ProgressBar
                className="rv-dist__bar"
                pct={Math.round((d.c / maxc) * 100)}
                tone="warn"
                label={t("screensB.reviews.distAria", { n: number(d.n) })}
              />
              <span className="lp-mono rv-dist__c">{number(d.c)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-cardbox rv-form">
        <div className="rv-form__title">
          {doneCount(done) >= dataSource.totalLessons()
            ? t("screensB.reviews.yourReview")
            : t("screensB.reviews.writeReview")}
        </div>

        <div className="rv-pickrow">
          <div className="rv-picker">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                type="button"
                key={i}
                className="lp-btn rv-pick"
                onClick={() => set({ rvStars: i })}
                aria-pressed={i === stars}
                aria-label={t("screensB.reviews.starsAria", { total: number(i) }, i)}
              >
                <Icon name="star" size={18} className={`rv-star${i <= stars ? " is-on" : ""}`} />
              </button>
            ))}
          </div>
          <span className="rv-picklabel">{STAR_LABELS[stars]}</span>
        </div>

        <TextArea
          className="rv-text"
          value={text}
          onChange={(v) => set({ rvText: v })}
          placeholder={t("screensB.reviews.placeholder")}
          ariaLabel={t("screensB.reviews.yourReview")}
        />

        <ButtonPrimary className="rv-post" onClick={post}>
          {t("screensB.reviews.post")}
        </ButtonPrimary>
      </div>

      <ChipRow>
        {REVIEW_FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => set({ rvFilter: f.id })}
            className="rv-filter"
          >
            {f.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="rv-list">
        {list.map((r) => (
          <div className="lp-cardbox lp-card rv-card" key={r.id}>
            <div className="rv-card__body">
              <Avatar initials={r.ini} size="md" />
              <div className="rv-card__main">
                <div className="rv-card__meta">
                  <span className="rv-card__who">{r.who}</span>
                  <Stars
                    n={r.stars}
                    size={14}
                    label={t("screensB.reviews.outOfFive", { n: number(r.stars) })}
                  />
                  <span className="lp-mono rv-card__at">{r.at}</span>
                  {r.verified ? (
                    <Pill tone="pos" icon="badge-check">
                      {t("screensB.reviews.finished")}
                    </Pill>
                  ) : null}
                </div>

                <p className="rv-card__text">{r.text}</p>

                {r.reply ? (
                  <div className="rv-reply">
                    <Avatar
                      initials={instructor.initials}
                      size="sm"
                      accent
                      className="rv-reply__av"
                    />
                    <div>
                      <div className="rv-reply__who">
                        {t("screensB.reviews.replied", { name: instructor.name })}
                      </div>
                      <p className="rv-reply__text">{r.reply}</p>
                    </div>
                  </div>
                ) : null}

                <div className="rv-card__foot">
                  <button
                    type="button"
                    className="lp-nav rv-helpful"
                    onClick={() => toggleHelpful(r.id)}
                    aria-pressed={Boolean(helpful[r.id])}
                  >
                    <Icon name="thumbs-up" size={14} />
                    {t(
                      "screensB.reviews.helpful",
                      { total: number(r.helpful + (helpful[r.id] ? 1 : 0)) },
                      r.helpful + (helpful[r.id] ? 1 : 0),
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
