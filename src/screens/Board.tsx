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
import { useI18n } from "../i18n";
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
  const t = useI18n().t;
  const dbCat = useAppStore((s) => s.dbCat);
  const dbThread = useAppStore((s) => s.dbThread);
  const dbReply = useAppStore((s) => s.dbReply);
  const dbVotes = useAppStore((s) => s.dbVotes);
  const dbAdded = useAppStore((s) => s.dbAdded);
  const prName = useAppStore((s) => s.prName);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const open = BOARD_THREADS.find((thread) => thread.id === dbThread);

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
      showToast(t("screensA.board.writeFirst"), "info");
      return;
    }
    if (!dbThread) return;
    const mine: BoardPost = {
      who: prName,
      ini: initials(prName),
      role: "",
      staff: false,
      at: t("screensA.board.justNow"),
      votes: 0,
      text,
    };
    set({
      dbAdded: { ...dbAdded, [dbThread]: [...addedPosts(dbAdded, dbThread), mine] },
      dbReply: "",
    });
    showToast(t("screensA.board.posted"), "send");
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
          onNew={() => showToast(t("screensA.board.newThreadDemo"), "pen-line")}
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
  const { t, number } = useI18n();
  const threads = BOARD_THREADS.filter((thread) => cat === "all" || thread.tag === cat)
    .slice()
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <>
      <div className="scr-board__head">
        <div>
          <h1 className="scr-board__title">{t("screensA.board.title")}</h1>
          <p className="scr-board__lede">{t("screensA.board.lede")}</p>
        </div>
        <ButtonPrimary className="scr-board__new" icon="pen-line" iconSize={15} onClick={onNew}>
          {t("screensA.board.newThread")}
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
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={`lp-list__row lp-row scr-board__row${thread.pinned ? " is-pinned" : ""}`}
            onClick={() => onOpen(thread.id)}
          >
            {/*
             * Read-only. The comp added `dbVotes[t.id]` to this number, but no
             * control ever writes that key — votes are cast per post inside a
             * thread ("t1-0") — so the term could never be anything but zero.
             */}
            <span className="scr-board__votes lp-mono">
              <Icon name="arrow-big-up" size={15} />
              {number(thread.votes)}
            </span>

            <span className="scr-board__rowbody">
              <span className="scr-board__rowtop">
                {thread.pinned ? (
                  <Pill tone="accent" icon="pin" iconSize={11}>
                    {t("screensA.board.pinned")}
                  </Pill>
                ) : null}
                <span className="scr-board__rowtitle">{thread.title}</span>
                <Pill>{thread.tag}</Pill>
              </span>
              <span className="scr-board__meta">
                {t("screensA.board.startedBy", { who: thread.by, at: thread.at })}
              </span>
            </span>

            <span className="scr-board__replies lp-mono">
              <Icon name="message-square" size={14} />
              {number(thread.posts.length - 1 + addedPosts(added, thread.id).length)}
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
  const { t, number } = useI18n();
  const posts = thread.posts.concat(extra);

  return (
    <>
      <button type="button" className="lp-nav scr-board__back" onClick={onBack}>
        <Icon name="arrow-left" size={15} />
        {t("screensA.board.allThreads")}
      </button>

      <div>
        <div className="scr-board__threadtop">
          <Pill>{thread.tag}</Pill>
          <span className="scr-board__threadmeta lp-mono">
            {t(
              "screensA.board.threadMeta",
              { count: number(posts.length), at: thread.at },
              posts.length,
            )}
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
                    aria-label={t("screensA.board.upvote")}
                  >
                    <Icon name="arrow-big-up" size={15} />
                    {number(p.votes + (votes[key] ? 1 : 0))}
                  </button>
                  <button
                    type="button"
                    className="lp-nav scr-board__act"
                    onClick={() => onQuote(p.text)}
                  >
                    {t("screensA.board.quote")}
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
            placeholder={t("screensA.board.replyPlaceholder")}
            ariaLabel={t("screensA.board.replyLabel")}
            className="scr-board__replyfld"
          />
          <ButtonPrimary className="scr-board__send" onClick={onPost}>
            {t("screensA.board.reply")}
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
}
