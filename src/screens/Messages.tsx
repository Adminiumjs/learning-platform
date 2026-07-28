/*
 * Messages — the instructor's private threads.
 *
 * A list on the start side, one conversation on the other, a composer at the
 * bottom. Sent messages land in the store keyed by thread, so switching away
 * and back keeps what you wrote; nothing is ever delivered anywhere.
 *
 * "View progress" opens the student detail screen, which now opens this one
 * back — the two halves of the same conversation.
 */

import { Avatar, ButtonPrimary, PageHead, TextArea } from "../components";
import type { ChatMessage } from "../data/screens/messages";
import { CONVERSATIONS } from "../data/screens/messages";
import { useAppStore } from "../state/store";
import "../styles/screen-messages.css";

export default function Messages() {
  const msI = useAppStore((s) => s.msI);
  const msText = useAppStore((s) => s.msText);
  const msSent = useAppStore((s) => s.msSent);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const showToast = useAppStore((s) => s.showToast);

  /* Clamped, so a stale index from another screen can never break the pane. */
  const i = Math.min(Math.max(0, msI), CONVERSATIONS.length - 1);
  const cur = CONVERSATIONS[i];

  /* The store types its per-thread outbox loosely; this screen owns the shape. */
  const sent = (msSent[cur.id] ?? []) as ChatMessage[];
  const thread = [...cur.msgs, ...sent];
  const unread = CONVERSATIONS.filter((c) => c.unread).length;
  const firstName = cur.who.split(" ")[0];

  function send(): void {
    const text = msText.trim();
    if (!text) {
      showToast("Write something first.", "info");
      return;
    }
    set({
      msSent: { ...msSent, [cur.id]: [...sent, { me: true, text, at: "Just now" }] },
      msText: "",
    });
    showToast(`Sent to ${cur.who}.`, "send");
  }

  return (
    <div className="lp-page scr-messages">
      <PageHead title="Messages" lede={`${unread} unread · private, not the public Q&A`} />

      <div className="ms-grid">
        <div className="lp-list lp-scroll ms-list">
          {CONVERSATIONS.map((c, ix) => {
            const active = ix === i;
            return (
              <button
                type="button"
                key={c.id}
                className={`lp-row ms-conv${active ? " is-active" : ""}`}
                onClick={() => set({ msI: ix })}
                aria-current={active}
              >
                <Avatar
                  initials={c.ini}
                  size="md"
                  accent={active}
                  className="ms-conv__ava"
                />
                <span className="ms-conv__text">
                  <span className="ms-conv__top">
                    <span className="ms-conv__who">{c.who}</span>
                    <span className="lp-mono ms-conv__at">{c.at}</span>
                  </span>
                  {/* An open thread is a read thread — the dot goes as you select it. */}
                  <span className="ms-conv__preview">{c.msgs[c.msgs.length - 1].text}</span>
                </span>
                {c.unread && !active ? <span className="ms-conv__dot" /> : null}
              </button>
            );
          })}
        </div>

        <div className="ms-pane">
          <div className="ms-pane__head">
            <Avatar initials={cur.ini} size="lg" className="ms-pane__ava" />
            <div className="ms-pane__who">
              <div className="ms-pane__name">{cur.who}</div>
              <div className="ms-pane__meta">{`Cohort 03 · ${cur.standing}`}</div>
            </div>
            <button type="button" className="lp-gi ms-progress" onClick={() => go("student")}>
              View progress
            </button>
          </div>

          <div className="lp-scroll ms-thread">
            {thread.map((m, ix) => (
              <div
                key={`${cur.id}-${ix}`}
                className={`ms-msg${m.me ? " ms-msg--me" : " ms-msg--them"}`}
              >
                <div className="ms-bubble">{m.text}</div>
                <span className="lp-mono ms-msg__at">{m.at}</span>
              </div>
            ))}
          </div>

          <div className="ms-compose">
            <TextArea
              value={msText}
              onChange={(v) => set({ msText: v })}
              placeholder={`Write to ${firstName}…`}
              rows={2}
              className="ms-compose__field"
              ariaLabel={`Message ${cur.who}`}
            />
            <ButtonPrimary icon="send" iconSize={15} className="ms-send" onClick={send}>
              Send
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
