/*
 * 404 — the retired-link page.
 *
 * Pure markup in the comp: it had no `xxxV()`, which is why its "Back to my
 * lesson" button was bound to a `goClassroom` handler that only ever existed
 * on the My-learning screen. Both buttons are wired here.
 */

import { ButtonPrimary, ButtonSecondary } from "../components";
import { useT } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-404.css";

export default function NotFound() {
  const t = useT();
  const go = useAppStore((s) => s.go);

  return (
    <div className="lp-page scr-404">
      <div className="scr-404__inner">
        <span className="scr-404__code">404</span>
        <h1 className="scr-404__title">{t("screensB.notFound.title")}</h1>
        <p className="scr-404__body">{t("screensB.notFound.body")}</p>
        <div className="scr-404__cta">
          <ButtonPrimary className="scr-404__btn" onClick={() => go("classroom")}>
            {t("screensB.notFound.back")}
          </ButtonPrimary>
          <ButtonSecondary className="scr-404__btn" onClick={() => go("catalog")}>
            {t("screensB.notFound.browse")}
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
