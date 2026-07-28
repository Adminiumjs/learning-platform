/*
 * Lesson editor — one lesson's settings, opened from the course content list.
 *
 * The interesting part is that the form changes shape with the lesson's kind:
 * pick "Reading" and the drop zone stops asking for an MP4. That branch is the
 * comp's, kept intact, with the prompt copy moved into `data/screens/lessoned`
 * so the markup states which kind it is rather than what it says.
 *
 * Two strings the comp typed into the template are read from the seam here:
 * the module eyebrow and the attached filename both come from the lesson
 * record (see `SUBJECT_LESSON_ID`), so they cannot drift from the curriculum.
 * The scheduled-release date follows that record's module week instead of the
 * comp's literal `wkStart(3)` — which happened to be the same week.
 */

import { AttachmentChip, ButtonPrimary, ButtonSecondary, Icon, Segmented } from "../components";
import type { SegmentOption } from "../components";
import {
  DROP_COPY,
  NEW_RESOURCE,
  RELEASE_OPTIONS,
  RELEASE_TIME,
  SUBJECT_LESSON_ID,
  VIDEO_SIZE,
} from "../data/screens/lessoned";
import { dataSource } from "../data/source";
import type { LessonKind } from "../data/types";
import { fmtDate, weekStart } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-lessoned.css";

const KIND_OPTIONS: SegmentOption<string>[] = Object.entries(dataSource.lessonKinds()).map(
  ([id, meta]) => ({ id, label: meta.l, icon: meta.i }),
);

export default function LessonEditor() {
  const leTitle = useAppStore((s) => s.leTitle);
  const leKind = useAppStore((s) => s.leKind);
  const leDur = useAppStore((s) => s.leDur);
  const lePoints = useAppStore((s) => s.lePoints);
  const leFileOn = useAppStore((s) => s.leFileOn);
  const leRel = useAppStore((s) => s.leRel);
  const leRes = useAppStore((s) => s.leRes);
  const leDesc = useAppStore((s) => s.leDesc);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);
  const openModal = useAppStore((s) => s.openModal);

  const lesson = dataSource.lesson(SUBJECT_LESSON_ID);
  const mod = lesson?.mod;
  const filename = lesson?.file ?? "lesson.mp4";
  /* Nothing but the segmented control writes `leKind`, but the store types it
     as a plain string, so the lookup is guarded rather than asserted. */
  const drop = DROP_COPY[leKind as LessonKind] ?? DROP_COPY.video;

  const removeResource = (i: number) => {
    const next = leRes.slice();
    next.splice(i, 1);
    set({ leRes: next });
  };

  const save = () => {
    showToast("Lesson saved.", "check");
    go("content");
  };

  const confirmDelete = () =>
    openModal({
      title: "Delete this lesson?",
      body: "Thirty students have it in their sidebar. Their progress on it goes too.",
      icon: "trash-2",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => showToast("Nothing was deleted — this is a demo.", "info"),
    });

  return (
    <>
      <div className="lp-page scr-lessoned">
        <button type="button" className="lp-nav le-back" onClick={() => go("content")}>
          <Icon name="arrow-left" size={15} />
          Course content
        </button>

        <header className="le-head">
          <span className="le-eyebrow">
            <Icon name="film" size={15} />
            {mod ? `Module ${mod.num} · ${mod.title}` : "Course content"}
          </span>
          <h1 className="le-title">Edit lesson</h1>
        </header>

        <section className="le-card">
          <label className="le-field" htmlFor="le-title">
            <span className="le-field__label">Lesson title</span>
            <input
              id="le-title"
              className="lp-fld le-input le-input--title"
              value={leTitle}
              onChange={(e) => set({ leTitle: e.target.value })}
            />
          </label>

          <div className="le-group">
            <span className="le-field__label">Kind</span>
            <Segmented
              className="le-group__seg"
              options={KIND_OPTIONS}
              value={leKind}
              onChange={(k) => set({ leKind: k })}
              label="Lesson kind"
            />
          </div>

          <div className="le-drop">
            <Icon name={drop.icon} size={26} className="le-drop__ico" />
            <p className="le-drop__title">{drop.title}</p>
            <p className="le-drop__sub">{drop.sub}</p>

            {leFileOn ? (
              <AttachmentChip
                className="le-drop__file"
                name={`${filename} · ${VIDEO_SIZE}`}
                onRemove={() => set({ leFileOn: false })}
              />
            ) : (
              <ButtonSecondary
                className="le-drop__pick"
                onClick={() => {
                  set({ leFileOn: true });
                  showToast(`${filename} attached.`, "film");
                }}
              >
                Choose a file
              </ButtonSecondary>
            )}
          </div>

          <div className="le-pair">
            <label className="le-field" htmlFor="le-dur">
              <span className="le-field__label">Duration</span>
              <input
                id="le-dur"
                className="lp-fld lp-mono le-input"
                value={leDur}
                onChange={(e) => set({ leDur: e.target.value })}
              />
            </label>
            <label className="le-field" htmlFor="le-points">
              <span className="le-field__label">Points (assignments only)</span>
              <input
                id="le-points"
                className="lp-fld lp-mono le-input"
                value={lePoints}
                onChange={(e) => set({ lePoints: e.target.value })}
              />
            </label>
          </div>

          <label className="le-field" htmlFor="le-desc">
            <span className="le-field__label">Description</span>
            <textarea
              id="le-desc"
              className="lp-fld le-desc"
              value={leDesc}
              onChange={(e) => set({ leDesc: e.target.value })}
            />
          </label>

          <div className="le-group">
            <span className="le-field__label">Resources</span>
            <div className="le-res">
              {leRes.map((n, i) => (
                /* Index in the key: the list has no ids, and two "Attach"es
                   legitimately produce the same filename twice. */
                <AttachmentChip
                  key={`${n}-${i}`}
                  className="le-res__chip"
                  name={n}
                  onRemove={() => removeResource(i)}
                />
              ))}
              <button
                type="button"
                className="lp-gi le-res__add"
                onClick={() => set({ leRes: [...leRes, NEW_RESOURCE] })}
              >
                <Icon name="plus" size={13} />
                Attach
              </button>
            </div>
          </div>
        </section>

        <section className="le-card">
          <h2 className="le-card__title">Release</h2>
          <Segmented
            className="le-group__seg"
            options={RELEASE_OPTIONS}
            value={leRel}
            onChange={(r) => set({ leRel: r })}
            label="Release"
          />
          <div className="le-note">
            <Icon name="calendar" size={16} className="le-note__ico" />
            <span className="le-note__text">
              {leRel === "pub"
                ? "Students can see this now."
                : `Students see this on ${fmtDate(weekStart(mod?.week ?? 1))} at ${RELEASE_TIME}.`}
            </span>
          </div>
        </section>
      </div>

      <div className="le-bar">
        <div className="le-bar__inner">
          <ButtonSecondary className="le-bar__delete" onClick={confirmDelete}>
            Delete lesson
          </ButtonSecondary>
          <ButtonSecondary className="le-bar__preview" onClick={() => go("classroom")}>
            Preview
          </ButtonSecondary>
          <ButtonPrimary onClick={save}>Save lesson</ButtonPrimary>
        </div>
      </div>
    </>
  );
}
