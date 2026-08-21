/*
 * Mount point.
 *
 * The CSS imports come FIRST on purpose. ES modules evaluate in source order,
 * and Vite emits the stylesheet in that same order — importing App before the
 * token/base sheets would put components.css and every screen-*.css ahead of
 * tokens.css, and the cascade would lose.
 *
 *   tokens.css → base.css → components.css (via the barrel) → screen-*.css
 */

import "./styles/tokens.css";
import "./styles/base.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import { I18nProvider } from "./i18n";

/*
 * The provider sits outside <App> rather than inside it because it is what
 * stamps `lang` and `dir` on <html> — the single switch that turns RTL on for
 * the whole document, chrome and screens alike.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
