/*
 * Discussion board — the cohort's room between sessions.
 *
 * One view key, two states. `dbThread` is the switch: null shows the filtered
 * thread list, an id shows that thread with its posts and a reply box — the
 * comp's `dbIsList` / `dbIsThread` pair.
 */

import { ButtonPrimary, Chip, ChipRow, Icon, Pill, TextArea } from "../components";
import type { BoardPost, BoardThread } from "../data/screens/board";
import { BOARD_CATS, BOARD_THREADS } from "../data/screens/board";
import { useAppStore } from "../state/store";
import "../styles/screen-board.css";

/**
 * "Rosa Marchetti" → "RM".
 *
 * The comp hard-codes "RM" in the compose avatar and in every post it writes,
 * which goes stale the moment the profile screen renames the student. Derived
 * here instead; it still reads "RM" for the seeded name.
 */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/** Replies the visitor has added. The store holds them loosely typed. */
function addedPosts(bag: Record<string, unknown[]>, threadId: string): BoardPost[] {
  return (bag[threadId] ?? []) as BoardPost[];
}

/** Both states start at the top of the page when you move between them. */
function toTop(): void {
  try {
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch {
    /* non-browser hosts */
  }
}

export default function Board() {
  const dbCat = useAppStore((s) => s.dbCat);
  const dbThread = useAppStore((s) => s.dbThread);
  const dbReply = useAppStore((s) => s.dbReply);
  const dbVotes = useAppStore((s) => s.dbVotes);
  const dbAdded = useAppStore((s) => s.dbAdded);
  const prName = useAppStore((s) => s.prName);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const open = BOARD_THREADS.find((t) => t.id === dbThread);

  /* A vote is set membership; the store types the bag as counts, so 1 or gone. */
  const toggleVote = (key: string) => {
    const next = { ...dbVotes };
    if (next[key]) delete next[key];
    else next[key] = 1;
    set({ dbVotes: next });
  };

  const postReply = () => {
    const text = dbReply.trim();
    if (!text) {
      showToast("Write something first.", "info");
      return;
    }
    if (!dbThread) return;
    const mine: BoardPost = {
      who: prName,
      ini: initials(prName),
      role: "",
      staff: false,
      at: "Just now",
      votes: 0,
      text,
    };
    set({
      dbAdded: { ...dbAdded, [dbThread]: [...addedPosts(dbAdded, dbThread), mine] },
      dbReply: "",
    });
    showToast("Posted to the thread.", "send");
  };

  return (
    <div className="lp-page scr-board">
      {open ? (
        <ThreadView
          thread={open}
          extra={addedPosts(dbAdded, open.id)}
          votes={dbVotes}
          reply={dbReply}
          myInitials={initials(prName)}
          onVote={toggleVote}
          onQuote={(text) => set({ dbReply: `> ${text.split("\n")[0]}\n\n` })}
          onReplyChange={(v) => set({ dbReply: v })}
          onBack={() => {
            set({ dbThread: null, dbReply: "" });
            toTop();
          }}
          onPost={postReply}
        />
      ) : (
        <ListView
          cat={dbCat}
          added={dbAdded}
          onCat={(id) => set({ dbCat: id })}
          onOpen={(id) => {
            set({ dbThread: id });
            toTop();
          }}
          onNew={() => showToast("Demo — new threads are not saved here.", "pen-line")}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------ thread list */

function ListView({
  cat,
  added,
  onCat,
  onOpen,
  onNew,
}: {
  cat: string;
  added: Record<string, unknown[]>;
  onCat: (id: string) => void;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const threads = BOARD_THREADS.filter((t) => cat === "all" || t.tag === cat)
    .slice()
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <>
      <div className="scr-board__head">
        <div>
          <h1 className="scr-board__title">Discussion</h1>
          <p className="scr-board__lede">
            Cohort 03 · the room between sessions. Half of it is people thinking out loud.
          </p>
        </div>
        <ButtonPrimary className="scr-board__new" icon="pen-line" iconSize={15} onClick={onNew}>
          New thread
        </ButtonPrimary>
      </div>

      <ChipRow>
        {BOARD_CATS.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => onCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="lp-list">
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`lp-list__row lp-row scr-board__row${t.pinned ? " is-pinned" : ""}`}
            onClick={() => onOpen(t.id)}
          >
            {/*
             * Read-only. The comp added `dbVotes[t.id]` to this number, but no
             * control ever writes that key — votes are cast per post inside a
             * thread ("t1-0") — so the term could never be anything but zero.
             */}
            <span className="scr-board__votes lp-mono">
              <Icon name="arrow-big-up" size={15} />
              {t.votes}
            </span>

            <span className="scr-board__rowbody">
              <span className="scr-board__rowtop">
                {t.pinned ? (
                  <Pill tone="accent" icon="pin" iconSize={11}>
                    Pinned
                  </Pill>
                ) : null}
                <span className="scr-board__rowtitle">{t.title}</span>
                <Pill>{t.tag}</Pill>
              </span>
              <span className="scr-board__meta">
                Started by {t.by} · {t.at}
              </span>
            </span>

            <span className="scr-board__replies lp-mono">
              <Icon name="message-square" size={14} />
              {t.posts.length - 1 + addedPosts(added, t.id).length}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------- single thread */

function ThreadView({
  thread,
  extra,
  votes,
  reply,
  myInitials,
  onVote,
  onQuote,
  onReplyChange,
  onBack,
  onPost,
}: {
  thread: BoardThread;
  extra: BoardPost[];
  votes: Record<string, number>;
  reply: string;
  myInitials: string;
  onVote: (key: string) => void;
  onQuote: (text: string) => void;
  onReplyChange: (v: string) => void;
  onBack: () => void;
  onPost: () => void;
}) {
  const posts = thread.posts.concat(extra);

  return (
    <>
      <button type="button" className="lp-nav scr-board__back" onClick={onBack}>
        <Icon name="arrow-left" size={15} />
        All threads
      </button>

      <div>
        <div className="scr-board__threadtop">
          <Pill>{thread.tag}</Pill>
          <span className="scr-board__threadmeta lp-mono">
            {posts.length} posts · started {thread.at}
          </span>
        </div>
        <h1 className="scr-board__threadtitle">{thread.title}</h1>
      </div>

      <div className="scr-board__posts">
        {posts.map((p, i) => {
          const key = `${thread.id}-${i}`;
          return (
            <article key={key} className={`scr-board__post${p.staff ? " is-staff" : ""}`}>
              <span className={`scr-board__avatar${p.staff ? " is-staff" : ""}`} aria-hidden="true">
                {p.ini}
              </span>
              <div className="scr-board__postbody">
                <div className="scr-board__postmeta">
                  <span className="scr-board__who">{p.who}</span>
                  {p.staff ? <span className="scr-board__role">{p.role}</span> : null}
                  <span className="scr-board__at lp-mono">{p.at}</span>
                </div>
                <p className="scr-board__text">{p.text}</p>
                <div className="scr-board__actions">
                  <button
                    type="button"
                    className="lp-nav scr-board__act"
                    onClick={() => onVote(key)}
                    aria-pressed={Boolean(votes[key])}
                  >
                    <Icon name="arrow-big-up" size={15} />
                    {p.votes + (votes[key] ? 1 : 0)}
                  </button>
                  <button
                    type="button"
                    className="lp-nav scr-board__act"
                    onClick={() => onQuote(p.text)}
                  >
                    Quote
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="scr-board__compose">
        <span className="scr-board__avatar" aria-hidden="true">
          {myInitials}
        </span>
        <div className="scr-board__composebody">
          <TextArea
            value={reply}
            onChange={onReplyChange}
            placeholder="Add to the thread…"
            ariaLabel="Add to the thread"
            className="scr-board__replyfld"
          />
          <ButtonPrimary className="scr-board__send" onClick={onPost}>
            Reply
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
}
