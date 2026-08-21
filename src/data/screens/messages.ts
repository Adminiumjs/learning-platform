/*
 * Messages — page-local seed.
 *
 * Four private threads between Yara and four of her students. This is not the
 * public Q&A (`dataSource.seedQuestions()`): nobody but the two people in a
 * thread ever sees it, so it stays out of the shared contract data.
 *
 * The names are roster names on purpose. Tomás and Marcus both appear in
 * `dataSource.students()`, and Marcus is the one sitting at 27% that the
 * roster flags as behind — the two screens are describing the same person.
 *
 * Translation. What the four of them wrote is fiction and stays English. The
 * thread list's own two columns are not: `at` is an age, now formatted by
 * `Intl` from a number of hours or days, and `standing` is the roster's verdict
 * on the student, which is vocabulary this app owns.
 */

import { number, t } from "../../i18n/ambient";
import { shortUnit } from "../format";

export interface ChatMessage {
  /** True when Yara wrote it — her bubbles sit on the end side, in accent. */
  me: boolean;
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  who: string;
  /** Two-letter monogram. The app renders no avatar images. */
  ini: string;
  /** Age of the last message, for the list column. */
  at: string;
  unread: boolean;
  /**
   * The standing line under the name in the thread header.
   *
   * The comp built this with an inline `id === 'm2'` test; carrying it as a
   * field keeps the special case out of the render and lets a fifth thread say
   * something else without touching the screen.
   */
  standing: string;
  msgs: ChatMessage[];
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "m1",
    who: "Tomás Lindqvist",
    ini: "TL",
    get at() {
      return shortUnit(2, "hour");
    },
    unread: true,
    get standing() {
      return t("data.messages.standing.onTrack");
    },
    msgs: [
      {
        me: false,
        text: "Quick one — I'm going to miss Thursday, my daughter has a school thing. Is the recording up the same night?",
        at: "Today 08:14",
      },
      {
        me: true,
        text: "It is, usually by 21:00. Watch it and send me your specimen anyway — I'll write notes on it so you're not behind.",
        at: "Today 08:31",
      },
      {
        me: false,
        text: "That's very kind. I'll have it with you Friday morning.",
        at: "Today 09:02",
      },
    ],
  },
  {
    id: "m2",
    who: "Marcus Feld",
    ini: "MF",
    get at() {
      return shortUnit(3, "day");
    },
    unread: true,
    get standing() {
      return t("data.messages.standing.behind", { pct: number(27) });
    },
    msgs: [
      {
        me: true,
        text: "Marcus — you've been quiet since week 1 and I'd rather ask than assume. Anything I can do?",
        at: "Fri 17:20",
      },
      {
        me: false,
        text: "Work exploded. I want to keep going, I just can't do three hours right now.",
        at: "Sat 10:05",
      },
    ],
  },
  {
    id: "m3",
    who: "Priya Raman",
    ini: "PR",
    get at() {
      return shortUnit(1, "week");
    },
    unread: false,
    get standing() {
      return t("data.messages.standing.onTrack");
    },
    msgs: [
      {
        me: false,
        text: "Thank you for the note on my token sheet. The bit about naming by job finally clicked.",
        at: "Mon 12:40",
      },
      {
        me: true,
        text: "That's the whole course in one sentence. Nicely done.",
        at: "Mon 13:02",
      },
    ],
  },
  {
    id: "m4",
    who: "Freya Nilsen",
    ini: "FN",
    get at() {
      return shortUnit(2, "week");
    },
    unread: false,
    get standing() {
      return t("data.messages.standing.onTrack");
    },
    msgs: [
      {
        me: false,
        text: "Is it alright if I share the audit template with my team? They are not enrolled.",
        at: "14 Jul",
      },
      {
        me: true,
        text: "Please do. It only works if people use it.",
        at: "14 Jul",
      },
    ],
  },
];

/**
 * Which thread belongs to a student, or -1 when there is none.
 *
 * The student-detail screen uses it to open the right conversation instead of
 * guessing an index — see the note on its "Message" button.
 */
export function conversationIndexFor(name: string): number {
  return CONVERSATIONS.findIndex((c) => c.who === name);
}
