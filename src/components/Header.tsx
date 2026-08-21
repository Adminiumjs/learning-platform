/*
 * Header, mobile sheet and footer.
 *
 * The comp branched on `S.w < 1010` to decide between the nav and a hamburger,
 * and on `S.w >= 1340` to show the search field. Both are CSS media queries
 * here — the markup renders everything and the stylesheet decides what shows,
 * so there is no layout flash on first paint and no resize listener.
 */

import { dataSource } from "../data/source";
import { useI18n, useT } from "../i18n";
import { useAppStore } from "../state/store";
import { BARE_VIEWS, BRAND, FOOTER_LINKS, navFor } from "./chrome";
import { Icon } from "./Icon";

/* ----------------------------------------------------------------- header */

export function Header() {
  const t = useT();
  const view = useAppStore((s) => s.view);
  const persona = useAppStore((s) => s.persona);
  const q = useAppStore((s) => s.q);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const openMenu = useAppStore((s) => s.openMenu);
  const showToast = useAppStore((s) => s.showToast);

  if (BARE_VIEWS.has(view)) return null;

  const nav = navFor(persona);
  const student = persona === "student";
  const who = student ? dataSource.student() : dataSource.instructor();
  /* The search field only makes sense where there is a catalogue to search. */
  const searchable = student && (view === "catalog" || view === "course");

  return (
    <header className="lp-header">
      <div className="lp-header__inner">
        <button
          type="button"
          className="lp-gi lp-header__burger"
          onClick={openMenu}
          aria-label={t("chrome.header.openMenu")}
        >
          <Icon name="menu" size={18} />
        </button>

        <button
          type="button"
          className="lp-header__brand"
          onClick={() => go(student ? "catalog" : "teach")}
        >
          <span className="lp-header__mark">{BRAND.mark}</span>
          <span className="lp-header__name">{BRAND.name}</span>
        </button>

        <nav className="lp-header__nav" aria-label={t("chrome.header.mainNav")}>
          {nav.map((n) => (
            <button
              key={n.view}
              type="button"
              className={`lp-row lp-header__navlink${view === n.view ? " is-active" : ""}`}
              onClick={() => go(n.view)}
            >
              {t(n.label)}
            </button>
          ))}
        </nav>

        {searchable ? (
          <label className="lp-fld lp-header__search">
            <Icon name="search" size={16} className="lp-header__searchico" />
            <input
              value={q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder={t("chrome.header.searchCourses")}
              aria-label={t("chrome.header.searchCourses")}
            />
          </label>
        ) : null}

        <div className={`lp-header__right${searchable ? "" : " lp-header__right--push"}`}>
          {student ? (
            <button
              type="button"
              className="lp-btn lp-header__cta"
              onClick={() => go("catalog")}
            >
              {t("chrome.header.browseCourses")}
            </button>
          ) : null}

          <button
            type="button"
            className="lp-gi lp-header__who"
            onClick={() =>
              student
                ? go("profile")
                : showToast(
                    t("chrome.header.teachingToast", { name: who.name }),
                    "user-round",
                  )
            }
          >
            <span className={`lp-header__avatar${student ? "" : " lp-header__avatar--accent"}`}>
              {who.initials}
            </span>
            <span className="lp-header__whotext">
              <span className="lp-header__whoname">{who.name}</span>
              <span className="lp-header__whorole">{who.role}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------- mobile sheet */

export function MobileSheet() {
  const t = useT();
  const menu = useAppStore((s) => s.menu);
  const view = useAppStore((s) => s.view);
  const persona = useAppStore((s) => s.persona);
  const closeMenu = useAppStore((s) => s.closeMenu);
  const go = useAppStore((s) => s.go);

  if (!menu) return null;

  return (
    <div className="lp-scrim" onClick={closeMenu} role="presentation">
      <div
        className="lp-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("chrome.header.menu")}
      >
        <div className="lp-sheet__head">
          <span className="lp-sheet__brand">
            <span className="lp-sheet__mark">{BRAND.mark}</span>
            {BRAND.name}
          </span>
          <button
            type="button"
            className="lp-gi lp-iconbtn"
            onClick={closeMenu}
            aria-label={t("chrome.header.closeMenu")}
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        {navFor(persona).map((n) => (
          <button
            key={n.view}
            type="button"
            className={`lp-row lp-sheet__link${view === n.view ? " is-active" : ""}`}
            onClick={() => go(n.view)}
          >
            <Icon name={n.icon} size={17} />
            {t(n.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- footer */

export function Footer() {
  /*
   * The copyright year goes through `Intl` like every other number in the app,
   * so an Arabic reader gets ٢٠٢٦ — and never grouped as "2,026".
   */
  const { t, number } = useI18n();
  const view = useAppStore((s) => s.view);
  const go = useAppStore((s) => s.go);
  const setPersona = useAppStore((s) => s.setPersona);

  if (BARE_VIEWS.has(view)) return null;

  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__brandcol">
          <span className="lp-footer__brand">
            <span className="lp-footer__mark">{BRAND.mark}</span>
            {BRAND.name}
          </span>
          <p className="lp-footer__legal">
            {t(BRAND.legalKey, { year: number(BRAND.year, { useGrouping: false }) })}
          </p>
          <span className="lp-footer__domain">{BRAND.domain}</span>
        </div>

        <div className="lp-footer__links">
          {FOOTER_LINKS.map((f) => (
            <button
              key={f.label}
              type="button"
              className="lp-nav lp-footer__link"
              onClick={() => (f.view === "teach" ? setPersona("instructor") : go(f.view))}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
