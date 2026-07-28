/*
 * Sign in — the split screen.
 *
 * Renders without the header and footer (`BARE_VIEWS`), so it owns the whole
 * viewport: a tinted panel carrying the brand and a past student's line, and
 * the form beside it. Below 900px the panel goes and the form is the page.
 *
 * Nothing authenticates. The button spins for 800ms and lands on My learning,
 * which is what the info strip under it says out loud.
 */

import { useEffect, useRef } from "react";
import {
  BRAND,
  ButtonPrimary,
  ButtonSecondary,
  Callout,
  Cover,
  Field,
  TextInput,
} from "../components";
import { SIGNIN_MS, SIGNIN_PROVIDERS, TESTIMONIAL } from "../data/screens/signin";
import { dataSource } from "../data/source";
import { useAppStore } from "../state/store";
import "../styles/screen-signin.css";

export default function SignIn() {
  const siEmail = useAppStore((s) => s.siEmail);
  const siPass = useAppStore((s) => s.siPass);
  const siBusy = useAppStore((s) => s.siBusy);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Leaving mid-request (the dock can jump anywhere) must not strand the
     button on "Signing in…" for whenever the screen is opened again. */
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      useAppStore.getState().set({ siBusy: false });
    },
    [],
  );

  const submit = () => {
    if (siBusy) return;
    set({ siBusy: true });
    timer.current = setTimeout(() => {
      timer.current = null;
      set({ siBusy: false });
      go("learning");
      showToast("Welcome back, Rosa.", "check");
    }, SIGNIN_MS);
  };

  /* The panel's gradient is the flagship course's tint, reused through
     <Cover> so the tint stays inside the sanctioned custom-property API. */
  const flagship = dataSource.courses()[0];

  return (
    <div className="lp-page lp-page--flush scr-signin">
      <aside className="si-aside">
        <Cover
          className="si-aside__bg"
          tint={flagship.tint}
          icon={flagship.icon}
          iconSize={190}
          angle="150deg"
        />

        <div className="si-aside__inner">
          <div className="si-brand">
            <span className="si-brand__mark">{BRAND.mark}</span>
            <span className="si-brand__name">{BRAND.name}</span>
          </div>

          <figure className="si-quote">
            <blockquote className="si-quote__text">{TESTIMONIAL.quote}</blockquote>
            <figcaption className="si-quote__who">
              <span className="si-quote__ini" aria-hidden="true">
                {TESTIMONIAL.ini}
              </span>
              <span>
                <span className="si-quote__name">{TESTIMONIAL.name}</span>
                <span className="si-quote__cohort">{TESTIMONIAL.cohort}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </aside>

      <div className="si-panel">
        {/* A real form, so Enter submits — the comp wired the button only. */}
        <form
          className="si-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="si-intro">
            <h1 className="si-intro__title">Welcome back</h1>
            <p className="si-intro__lede">Pick up where you left off — week {week} is open.</p>
          </div>

          <Field label="Email" htmlFor="si-email" className="si-field">
            <TextInput
              id="si-email"
              type="email"
              value={siEmail}
              onChange={(v) => set({ siEmail: v })}
              placeholder="you@example.com"
              className="si-input"
            />
          </Field>

          {/* The password label carries the reset link, which `Field` has no
              slot for — so this one row is assembled by hand from the same
              shared classes rather than adding a prop to the primitive. */}
          <div className="lp-field si-field">
            <div className="si-passline">
              <label className="lp-field__label" htmlFor="si-pass">
                Password
              </label>
              <button
                type="button"
                className="lp-nav si-forgot"
                onClick={() => showToast("We would email you a reset link.", "mail")}
              >
                Forgot it?
              </button>
            </div>
            <TextInput
              id="si-pass"
              type="password"
              value={siPass}
              onChange={(v) => set({ siPass: v })}
              placeholder="••••••••"
              className="si-input"
            />
          </div>

          <ButtonPrimary className="si-submit" type="submit" disabled={siBusy}>
            {siBusy ? "Signing in…" : "Sign in"}
          </ButtonPrimary>

          <div className="si-or">
            <span className="si-or__rule" />
            or
            <span className="si-or__rule" />
          </div>

          <div className="si-providers">
            {SIGNIN_PROVIDERS.map((p) => (
              <ButtonSecondary
                key={p.label}
                className="si-provider"
                icon={p.icon}
                onClick={() => showToast(p.toast, p.toastIcon)}
              >
                {p.label}
              </ButtonSecondary>
            ))}
          </div>

          <Callout className="si-note" tone="info" icon="info">
            Any password works. This is a demo.
          </Callout>

          <p className="si-create">
            New here?{" "}
            <button type="button" className="lp-nav si-create__btn" onClick={() => go("onboarding")}>
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
