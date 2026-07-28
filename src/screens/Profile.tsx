/*
 * Student profile — the account page.
 *
 * Four stacked blocks: the identity card (tinted banner, avatar, four stats),
 * the editable details, the notification switches, and the leave-the-school
 * strip. Everything here writes straight to the store, so a name typed at the
 * top of the page is the name the header shows a moment later.
 *
 * Two numbers the comp hardcoded are derived instead, because the data behind
 * them now exists: "2 courses enrolled" is the count of *active* enrolments
 * (the other two are paused and retired), and the lesson tally reads the live
 * progress map rather than a literal "/ 22".
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Cover,
  Field,
  TextArea,
  TextInput,
  Toggle,
} from "../components";
import {
  CURRENT_STREAK,
  HOURS_WATCHED,
  NOTIFY_ROWS,
  PROFILE_HANDLE,
  PROFILE_SINCE,
} from "../data/screens/profile";
import { dataSource } from "../data/source";
import { demoNow, doneCount, fmtDate } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-profile.css";

/**
 * "Rosa Marchetti" → "RM". The comp printed a fixed "RM" into the template
 * even though the name field right beside it is editable, so the avatar
 * started lying the moment you typed.
 */
function initialsOf(name: string, fallback: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");
  return letters ? letters.toUpperCase() : fallback;
}

export default function Profile() {
  const prName = useAppStore((s) => s.prName);
  const prEmail = useAppStore((s) => s.prEmail);
  const prTz = useAppStore((s) => s.prTz);
  const prLink = useAppStore((s) => s.prLink);
  const prBio = useAppStore((s) => s.prBio);
  const prNotif = useAppStore((s) => s.prNotif);
  const prSavedAt = useAppStore((s) => s.prSavedAt);
  const done = useAppStore((s) => s.done);
  const week = useAppStore((s) => s.week);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const student = dataSource.student();
  /* The banner takes the flagship course's tint — a profile has no tint of its
     own, and this is the course the demo account is mid-way through. */
  const flagship = dataSource.courses()[0];

  const stats = [
    {
      value: String(dataSource.enrolled().filter((e) => e.state === "active").length),
      label: "Courses enrolled",
    },
    { value: `${doneCount(done)} / ${dataSource.totalLessons()}`, label: "Lessons finished" },
    { value: HOURS_WATCHED, label: "Hours watched" },
    { value: CURRENT_STREAK, label: "Current streak" },
  ];

  const fields: {
    id: string;
    label: string;
    value: string;
    ph: string;
    onChange: (v: string) => void;
  }[] = [
    { id: "pr-name", label: "Full name", value: prName, ph: "Your name", onChange: (v) => set({ prName: v }) },
    { id: "pr-email", label: "Email", value: prEmail, ph: "you@example.com", onChange: (v) => set({ prEmail: v }) },
    { id: "pr-tz", label: "Time zone", value: prTz, ph: "Europe/Rome", onChange: (v) => set({ prTz: v }) },
    { id: "pr-link", label: "Website", value: prLink, ph: "yoursite.com", onChange: (v) => set({ prLink: v }) },
  ];

  const save = () => {
    /* Stamped on the demo clock, never the wall clock. `demoNow` is 10:20 on
       the Tuesday of the current week, so both halves of the stamp agree. */
    set({ prSavedAt: `Saved ${fmtDate(demoNow(week))} · 10:20` });
    showToast("Profile saved.", "check");
  };

  const confirmDelete = () =>
    openModal({
      title: "Delete your account?",
      body:
        "This is a demo, so nothing actually goes anywhere. In the real thing your progress, notes and certificates would be gone for good.",
      icon: "trash-2",
      confirmLabel: "Delete it",
      danger: true,
      onConfirm: () => showToast("Nothing was deleted — this is a demo.", "info"),
    });

  return (
    <div className="lp-page scr-profile">
      <section className="pr-id">
        <Cover
          className="pr-id__banner"
          tint={flagship.tint}
          icon={flagship.icon}
          iconSize={40}
          angle="120deg"
        />

        <div className="pr-id__row">
          <Avatar
            className="pr-id__avatar"
            initials={initialsOf(prName, student.initials)}
            size="xl"
          />
          <div className="pr-id__who">
            <p className="pr-id__name">{prName}</p>
            <p className="pr-id__meta">
              <span className="lp-mono pr-id__handle">{PROFILE_HANDLE}</span>
              <span className="pr-id__since">· {PROFILE_SINCE}</span>
            </p>
          </div>
          <ButtonSecondary
            className="pr-id__share"
            icon="share-2"
            iconSize={15}
            onClick={() => showToast("Demo profile link copied.", "share-2")}
          >
            Share profile
          </ButtonSecondary>
        </div>

        <div className="pr-stats">
          {stats.map((s) => (
            <div key={s.label} className="pr-stat">
              <span className="lp-mono pr-stat__value">{s.value}</span>
              <span className="pr-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pr-block">
        <h2 className="pr-block__title">Your details</h2>

        <div className="pr-fields">
          {fields.map((f) => (
            <Field key={f.id} label={f.label} htmlFor={f.id}>
              <TextInput id={f.id} value={f.value} onChange={f.onChange} placeholder={f.ph} />
            </Field>
          ))}
        </div>

        <Field label="About you" htmlFor="pr-bio">
          <TextArea
            id="pr-bio"
            rows={4}
            value={prBio}
            onChange={(v) => set({ prBio: v })}
            placeholder="A sentence is plenty."
          />
        </Field>

        <div className="pr-save">
          <ButtonPrimary className="pr-save__btn" onClick={save}>
            Save changes
          </ButtonPrimary>
          {prSavedAt ? <span className="pr-save__at">{prSavedAt}</span> : null}
        </div>
      </section>

      {/* `lp-list` rather than the comp's hand-rolled card: it drops the border
          under the last row, which the comp left sitting on the card's edge. */}
      <section className="lp-list pr-notify">
        <h2 className="pr-notify__head">Email me about</h2>
        {NOTIFY_ROWS.map((r) => (
          <div key={r.k} className="lp-list__row pr-notify__row">
            <span className="pr-notify__text">
              <span className="pr-notify__label">{r.label}</span>
              <span className="pr-notify__sub">{r.sub}</span>
            </span>
            <Toggle
              checked={Boolean(prNotif[r.k])}
              onChange={(next) => set({ prNotif: { ...prNotif, [r.k]: next } })}
              label={r.label}
              hideLabel
            />
          </div>
        ))}
      </section>

      <section className="pr-leave">
        <div className="pr-leave__text">
          <p className="pr-leave__title">Leave the school</p>
          <p className="pr-leave__sub">Your progress and certificates go with it. We keep nothing.</p>
        </div>
        <ButtonSecondary className="pr-leave__btn" onClick={confirmDelete}>
          Delete account
        </ButtonSecondary>
      </section>
    </div>
  );
}
