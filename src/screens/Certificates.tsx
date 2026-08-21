/*
 * Certificates — the instructor side.
 *
 * Five awarded, and the one thing an instructor actually wants control over:
 * the sentence printed under the student's name. Editing it re-renders the
 * preview live, which is the entire argument for putting the two side by side.
 *
 * "View" crosses the persona line into the student's certificate screen — the
 * same artefact, seen from the other end.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Field,
  Icon,
  PageHead,
  TextArea,
  Toggle,
} from "../components";
import { AWARDED, VERIFY_URL } from "../data/screens/certificates";
import { useI18n } from "../i18n";
import { useAppStore } from "../state/store";
import "../styles/screen-certificates.css";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function Certificates() {
  const { t, number } = useI18n();
  const ctWording = useAppStore((s) => s.ctWording);
  const ctExam = useAppStore((s) => s.ctExam);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  /* The comp hardcoded the preview name; reading the first award keeps the
     specimen and the list from drifting apart. */
  const specimen = AWARDED[0]?.who ?? "";

  return (
    <div className="lp-page scr-certificates">
      <PageHead
        className="ct-head"
        title={t("screensA.certificates.title")}
        lede={t(
          "screensA.certificates.lede",
          { count: number(AWARDED.length) },
          AWARDED.length,
        )}
      />

      <div className="ct-grid">
        <div className="lp-list ct-awarded">
          <div className="ct-awarded__head">
            <span className="ct-card__title">{t("screensA.certificates.awarded")}</span>
            <span className="lp-mono ct-awarded__count">
              {t("screensA.certificates.total", { count: number(AWARDED.length) })}
            </span>
          </div>

          {AWARDED.map((c) => (
            <div className="lp-list__row ct-row" key={c.id}>
              <Avatar initials={initials(c.who)} size="sm" className="ct-ava" />
              <span className="ct-row__text">
                <span className="ct-row__who">{c.who}</span>
                <span className="lp-mono ct-row__id">{c.id}</span>
              </span>
              <span className="ct-row__at">{c.at}</span>
              <ButtonSecondary className="ct-row__view" onClick={() => go("certificate")}>
                {t("screensA.certificates.view")}
              </ButtonSecondary>
            </div>
          ))}
        </div>

        <div className="ct-side">
          <div className="ct-card">
            <div className="ct-card__title">{t("screensA.certificates.wording")}</div>

            <Field label={t("screensA.certificates.lineUnderName")} htmlFor="ct-wording">
              <TextArea
                id="ct-wording"
                value={ctWording}
                onChange={(v) => set({ ctWording: v })}
                className="ct-wording"
              />
            </Field>

            <div className="ct-preview">
              <span className="ct-preview__eyebrow">{t("screensA.certificates.preview")}</span>
              <span className="ct-preview__name">{specimen}</span>
              <span className="ct-preview__line">{ctWording}</span>
            </div>

            <div className="ct-examrow">
              <span className="ct-examrow__label">
                {t("screensA.certificates.requireExam")}
              </span>
              <Toggle
                checked={ctExam}
                onChange={(next) => set({ ctExam: next })}
                label={t("screensA.certificates.requireExam")}
                hideLabel
              />
            </div>

            <ButtonPrimary
              className="ct-save"
              onClick={() => showToast(t("screensA.certificates.saved"), "check")}
            >
              {t("screensA.certificates.saveTemplate")}
            </ButtonPrimary>
          </div>

          <div className="ct-verify">
            <div className="ct-verify__head">
              <Icon name="shield-check" size={16} className="ct-verify__ico" />
              <span className="ct-verify__title">
                {t("screensA.certificates.verification")}
              </span>
            </div>
            <p className="ct-verify__body">{t("screensA.certificates.verifyBody")}</p>
            <span className="lp-mono ct-verify__url">{VERIFY_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
