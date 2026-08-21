/*
 * Onboarding quiz — three questions, then a plan.
 *
 * Renders bare (no header, no footer), like sign in. `obStep` is 0–2 for the
 * questions and 3 for the plan; `obA` holds one answer per question key.
 *
 * The answers are not thrown away at the end — the plan reads them back, and
 * "Answer again" clears both so the whole flow can be demoed twice in a row.
 */

import { BRAND, ButtonPrimary, ButtonSecondary, Icon } from "../components";
import {
  GOAL_COURSE,
  MILESTONE_DAYS,
  NUDGE_LABEL,
  PACE_LABEL,
  PLAN_FALLBACK,
  QUIZ,
} from "../data/screens/onboarding";
import { dataSource } from "../data/source";
import { useI18n } from "../i18n";
import { addDays, demoNow, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-onboarding.css";

const LAST_QUESTION = QUIZ.length - 1;

/** The store's `go` scrolls for us; stepping inside the quiz has to do it. */
function scrollTop(): void {
  try {
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch {
    /* non-browser hosts */
  }
}

export default function Onboarding() {
  const { t, number } = useI18n();
  const obStep = useAppStore((s) => s.obStep);
  const obA = useAppStore((s) => s.obA);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const onPlan = obStep > LAST_QUESTION;
  const q = QUIZ[Math.min(obStep, LAST_QUESTION)];
  const firstName = dataSource.student().name.split(" ")[0];

  const next = () => {
    if (!obA[q.key]) {
      showToast(t("screensB.onboarding.pickOne"), "info");
      return;
    }
    set({ obStep: obStep + 1 });
    scrollTop();
  };

  /* Back from the first question leaves the quiz entirely. */
  const back = () => {
    if (obStep === 0) {
      go("signin");
      return;
    }
    set({ obStep: obStep - 1 });
  };

  const plan = [
    {
      i: "book-open",
      k: t("screensB.onboarding.planStart"),
      v: GOAL_COURSE[obA.goal] ?? PLAN_FALLBACK.goal,
    },
    {
      i: "clock",
      k: t("screensB.onboarding.planPace"),
      v: PACE_LABEL[obA.hours] ?? PLAN_FALLBACK.pace,
    },
    {
      i: "bell",
      k: t("screensB.onboarding.planNudges"),
      v: NUDGE_LABEL[obA.remind] ?? PLAN_FALLBACK.nudge,
    },
    {
      i: "flag",
      k: t("screensB.onboarding.planMilestone"),
      v: t("screensB.onboarding.milestoneValue", {
        date: fmtDate(addDays(demoNow(week), MILESTONE_DAYS)),
      }),
    },
  ];

  return (
    <div className="lp-page scr-onboarding">
      <div className="ob-top">
        <span className="ob-top__mark">{BRAND.mark}</span>
        <span className="ob-top__name">{BRAND.name}</span>
        <span className="lp-mono ob-top__step">
          {onPlan
            ? t("screensB.onboarding.yourPlan")
            : t("screensB.onboarding.step", {
                n: number(obStep + 1),
                total: number(QUIZ.length),
              })}
        </span>
      </div>

      {/* The comp built each dot's fill from two identical ternary branches and
          a duplicated condition; a dot is simply filled once you have reached
          it, and the plan step fills all three. */}
      <div className="ob-dots" aria-hidden="true">
        {QUIZ.map((step, i) => (
          <span
            key={step.key}
            className={`ob-dot${i <= Math.min(obStep, LAST_QUESTION) ? " is-on" : ""}`}
          />
        ))}
      </div>

      {onPlan ? (
        <div className="ob-plan">
          <div>
            <h1 className="ob-title">
              {t("screensB.onboarding.planTitle", { name: firstName })}
            </h1>
            <p className="ob-sub">{t("screensB.onboarding.planSub")}</p>
          </div>

          <div className="lp-list ob-plan__list">
            {plan.map((p) => (
              <div key={p.k} className="lp-list__row ob-plan__row">
                <Icon name={p.i} size={17} className="ob-plan__ico" />
                <span className="ob-plan__k">{p.k}</span>
                <span className="ob-plan__v">{p.v}</span>
              </div>
            ))}
          </div>

          <div className="ob-acts">
            <ButtonPrimary
              className="ob-start"
              onClick={() => {
                go("classroom");
                showToast(t("screensB.onboarding.planSaved"), "check");
              }}
            >
              {t("screensB.onboarding.startLearning")}
            </ButtonPrimary>
            <ButtonSecondary className="ob-redo" onClick={() => set({ obStep: 0, obA: {} })}>
              {t("screensB.onboarding.answerAgain")}
            </ButtonSecondary>
          </div>
        </div>
      ) : (
        <div className="ob-step">
          <div>
            <h1 className="ob-title">{q.title}</h1>
            <p className="ob-sub">{q.sub}</p>
          </div>

          <div className="ob-opts" role="radiogroup" aria-label={q.title}>
            {q.opts.map((o) => {
              const on = obA[q.key] === o.k;
              return (
                <button
                  key={o.k}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`lp-btn ob-opt${on ? " is-on" : ""}`}
                  onClick={() => set({ obA: { ...obA, [q.key]: o.k } })}
                >
                  <span className="ob-opt__ico">
                    <Icon name={o.icon} size={18} />
                  </span>
                  <span className="ob-opt__text">
                    <span className="ob-opt__label">{o.label}</span>
                    <span className="ob-opt__sub">{o.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ob-nav">
            <ButtonSecondary className="ob-back" onClick={back}>
              {t("screensB.onboarding.back")}
            </ButtonSecondary>
            <ButtonPrimary className="ob-next" icon="arrow-right" iconEnd onClick={next}>
              {obStep === LAST_QUESTION
                ? t("screensB.onboarding.seePlan")
                : t("screensB.onboarding.next")}
            </ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  );
}
