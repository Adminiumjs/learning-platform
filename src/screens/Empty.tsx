/*
 * Empty states — the specimen sheet.
 *
 * Four states from four different screens, each in a little frame labelled
 * with where it comes from. The buttons are live: they take you to the screen
 * the state belongs to, so the sheet is a table of contents as well as a
 * design argument.
 */

import { ButtonPrimary, Icon, PageHead, Pill } from "../components";
import { EMPTY_CARDS } from "../data/screens/empty";
import { useAppStore } from "../state/store";
import "../styles/screen-empty.css";

export default function Empty() {
  const go = useAppStore((s) => s.go);
  const setPersona = useAppStore((s) => s.setPersona);

  return (
    <div className="lp-page scr-empty">
      <PageHead
        className="es-head"
        title="Empty states"
        lede="The first five minutes, and the quiet weeks. Every one gives you something to do next."
      />

      <div className="es-grid">
        {EMPTY_CARDS.map((c) => (
          <div className="es-card" key={c.title}>
            <div className="es-card__head">
              <span className="lp-mono es-card__where">{c.where}</span>
              <Pill tone={c.tone}>{c.tag}</Pill>
            </div>

            <div className="es-card__body">
              <span className={`es-card__ico es-card__ico--${c.tone}`}>
                <Icon name={c.icon} size={23} />
              </span>
              <div className="es-card__title">{c.title}</div>
              <p className="es-card__text">{c.body}</p>
              <ButtonPrimary
                className="es-card__cta"
                /* The grading queue lives on the other side of the app, so its
                   way out has to switch persona, not just the view. */
                onClick={() => (c.go === "teach" ? setPersona("instructor") : go(c.go))}
              >
                {c.cta}
              </ButtonPrimary>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
