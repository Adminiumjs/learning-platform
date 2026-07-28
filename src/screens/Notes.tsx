/*
 * Notes — everything the student has written, grouped by module.
 *
 * The one live wire: whatever is currently typed into the classroom's Notes
 * tab appears at the top of this list as an unsaved draft, stamped to the
 * playhead. That is what makes the two screens feel like one app rather than
 * two lists, and it is why the draft's timestamp ticks while a lesson plays.
 *
 * Nothing is really deleted — `ntDeleted` is a tombstone map, so the toast's
 * Undo can put a note straight back.
 */

import { EmptyState, Icon, PageHead } from "../components";
import type { SavedNote } from "../data/screens/notes";
import { DRAFT_NOTE_ID, NOTES } from "../data/screens/notes";
import { lessonById, lessonSeconds, mmss, playheadPos } from "../lib/schedule";
import { useAppStore } from "../state/store";
import "../styles/screen-notes.css";

interface NoteGroup {
  num: string;
  label: string;
  notes: SavedNote[];
}

/** Group by module, keeping the order the notes arrive in (newest first). */
function groupByModule(list: SavedNote[]): NoteGroup[] {
  const groups: NoteGroup[] = [];
  for (const n of list) {
    const found = groups.find((g) => g.num === n.mod);
    if (found) found.notes.push(n);
    else groups.push({ num: n.mod, label: n.module, notes: [n] });
  }
  return groups;
}

export default function Notes() {
  const query = useAppStore((s) => s.ntQuery);
  const deleted = useAppStore((s) => s.ntDeleted);
  const draft = useAppStore((s) => s.notes);
  const lessonId = useAppStore((s) => s.lesson);
  const pos = useAppStore((s) => s.pos);
  const playAnchor = useAppStore((s) => s.playAnchor);
  const playing = useAppStore((s) => s.playing);
  /*
   * The draft note's stamp is the live playhead, so it only needs the tick
   * while the player is actually running. Collapsing the selector to a
   * constant when it is paused keeps this screen off the one-second
   * re-render — `playheadPos` ignores `elapsed` unless `playing`.
   */
  const elapsed = useAppStore((s) => (s.playing ? s.elapsed : 0));

  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  const draftText = draft.trim();
  const lesson = lessonById(lessonId);

  const saved = NOTES.filter((n) => !deleted[n.id]);
  const all: SavedNote[] =
    draftText && !deleted[DRAFT_NOTE_ID]
      ? [
          {
            id: DRAFT_NOTE_ID,
            /* The comp filed every draft under module 03 regardless of which
               lesson was open. Taken from the current lesson instead. */
            mod: lesson?.mod.num ?? "03",
            module: lesson?.mod.title ?? "Type and spacing",
            lesson: lesson?.title ?? "Grids and rhythm",
            stamp: mmss(
              playheadPos({ playing, pos, lessonId, elapsed, playAnchor }) *
                lessonSeconds(lessonId),
            ),
            at: "Just now",
            text: draftText,
          },
          ...saved,
        ]
      : saved;

  const needle = query.trim().toLowerCase();
  const list = needle
    ? all.filter((n) => `${n.text} ${n.lesson}`.toLowerCase().includes(needle))
    : all;

  function jump(note: SavedNote) {
    go("classroom");
    showToast(`Jumped to ${note.stamp} in “${note.lesson}”.`, "play");
  }

  function remove(note: SavedNote) {
    set({ ntDeleted: { ...deleted, [note.id]: 1 } });
    showToast("Note deleted.", "trash-2", "Undo", () => {
      const store = useAppStore.getState();
      const undone = { ...store.ntDeleted };
      delete undone[note.id];
      store.set({ ntDeleted: undone });
    });
  }

  return (
    <div className="lp-page lp-page--narrow scr-notes">
      <PageHead
        title="Notes"
        lede={`${list.length} notes across 2 courses · stamped to the second`}
        action={
          /* No shared search-field primitive yet, so the icon + bare input
             live here; `:focus-within` gives it the same ring as `lp-fld`. */
          <label className="scr-notes__search">
            <Icon name="search" size={15} className="scr-notes__searchico" />
            <input
              className="scr-notes__searchinput"
              value={query}
              placeholder="Search your notes"
              aria-label="Search your notes"
              onChange={(e) => set({ ntQuery: e.target.value })}
            />
          </label>
        }
      />

      <div className="scr-notes__groups">
        {groupByModule(list).map((g) => (
          <section key={g.num} className="scr-notes__group">
            <div className="scr-notes__grouphead">
              <span className="scr-notes__groupnum">{g.num}</span>
              <span className="scr-notes__grouplabel">{g.label}</span>
            </div>

            {g.notes.map((n) => (
              <article key={n.id} className="lp-card scr-notes__note">
                <div className="scr-notes__notehead">
                  <button
                    type="button"
                    className="lp-chip scr-notes__stamp"
                    onClick={() => jump(n)}
                  >
                    <Icon name="play" size={12} />
                    {n.stamp}
                  </button>
                  <span className="scr-notes__lesson">{n.lesson}</span>
                  <span className="scr-notes__at">{n.at}</span>
                </div>

                <p className="scr-notes__text">{n.text}</p>

                <div className="scr-notes__actions">
                  <button
                    type="button"
                    className="lp-nav scr-notes__action"
                    onClick={() => showToast("Note copied.", "copy")}
                  >
                    <Icon name="copy" size={14} />
                    Copy
                  </button>
                  <button
                    type="button"
                    className="lp-nav scr-notes__action"
                    onClick={() => remove(n)}
                  >
                    <Icon name="trash-2" size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="scr-notes__empty"
          icon="notebook-pen"
          title="No notes match that."
          body="Notes you take in a lesson land here, stamped to the second."
        />
      ) : null}
    </div>
  );
}
