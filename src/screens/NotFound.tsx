/*
 * 404 — the retired-link page.
 *
 * Pure markup in the comp: it had no `xxxV()`, which is why its "Back to my
 * lesson" button was bound to a `goClassroom` handler that only ever existed
 * on the My-learning screen. Both buttons are wired here.
 */

import { ButtonPrimary, ButtonSecondary } from "../components";
import { useAppStore } from "../state/store";
import "../styles/screen-404.css";

export default function NotFound() {
  const go = useAppStore((s) => s.go);

  return (
    <div className="lp-page scr-404">
      <div className="scr-404__inner">
        <span className="scr-404__code">404</span>
        <h1 className="scr-404__title">That lesson isn't here.</h1>
        <p className="scr-404__body">
          The link may be from an older cohort, or the page has been retired. Your progress is safe
          — pick up where you left off.
        </p>
        <div className="scr-404__cta">
          <ButtonPrimary className="scr-404__btn" onClick={() => go("classroom")}>
            Back to my lesson
          </ButtonPrimary>
          <ButtonSecondary className="scr-404__btn" onClick={() => go("catalog")}>
            Browse courses
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
