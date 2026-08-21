/*
 * Discussion-board seed — the comp's `THREADS` table.
 *
 * Page-local on purpose: no other screen reads a thread, so this stays out of
 * the shared `dataSource` contract. Copy is in-fiction and verbatim — the
 * threads are what thirty fictional students wrote to each other.
 *
 * The category row above them is not: those are the board's own buckets, so
 * their labels are translated. Each category's `id` stays as written, because
 * it is matched against a thread's `tag`.
 */

import { number, t } from "../../i18n/ambient";

export interface BoardPost {
  who: string;
  /** Two-letter monogram — the app renders no avatar images. */
  ini: string;
  /** Empty for students; only staff carry a role pill. */
  role: string;
  staff: boolean;
  at: string;
  votes: number;
  text: string;
}

export interface BoardThread {
  id: string;
  title: string;
  /** Doubles as the category filter value. */
  tag: string;
  pinned: boolean;
  votes: number;
  at: string;
  by: string;
  /** Post 0 is the opening post; everything after it is a reply. */
  posts: BoardPost[];
}

export interface BoardCategory {
  id: string;
  label: string;
}

/** "all" is the sentinel; every other id is a thread `tag`. */
export const BOARD_CATS: BoardCategory[] = [
  {
    id: "all",
    get label() {
      return t("data.board.cat.all");
    },
  },
  {
    id: "Introductions",
    get label() {
      return t("data.board.cat.introductions");
    },
  },
  {
    id: "Week 3",
    get label() {
      return t("data.board.cat.week", { n: number(3) });
    },
  },
  {
    id: "Week 2",
    get label() {
      return t("data.board.cat.week", { n: number(2) });
    },
  },
  {
    id: "Resources",
    get label() {
      return t("data.board.cat.resources");
    },
  },
  {
    id: "Off-topic",
    get label() {
      return t("data.board.cat.offTopic");
    },
  },
];

export const BOARD_THREADS: BoardThread[] = [
  {
    id: "t1",
    title: "Say hello — who are you and what are you untangling?",
    tag: "Introductions",
    pinned: true,
    votes: 24,
    at: "Week 1 · 20 Jul",
    by: "Yara Haddad",
    posts: [
      {
        who: "Yara Haddad",
        ini: "YH",
        role: "Instructor",
        staff: true,
        at: "20 Jul · 09:00",
        votes: 18,
        text: "Welcome, all thirty of you. Tell us three things: where you work, the interface that keeps you up at night, and one thing you want to have shipped by week 8.\n\nI'll go first. Bologna by way of Beirut, fourteen years in, and the thing that keeps me up is a bank dashboard I audited in 2019 that is somehow still live.",
      },
      {
        who: "Priya Raman",
        ini: "PR",
        role: "",
        staff: false,
        at: "20 Jul · 11:42",
        votes: 7,
        text: "Bengaluru, fintech, and our checkout flow has four button components that all look like the same button. By week 8 I want one.",
      },
      {
        who: "Marcus Feld",
        ini: "MF",
        role: "",
        staff: false,
        at: "21 Jul · 08:15",
        votes: 4,
        text: "Berlin, agency side. Every client asks for a design system and means a colour palette. I want language to explain the difference.",
      },
    ],
  },
  {
    id: "t2",
    title: "Anyone else stuck between a 4px and an 8px spacing scale?",
    tag: "Week 3",
    pinned: false,
    votes: 17,
    at: "2 days ago",
    by: "Priya Raman",
    posts: [
      {
        who: "Priya Raman",
        ini: "PR",
        role: "",
        staff: false,
        at: "2 days ago",
        votes: 11,
        text: "Engineering wants 4, the design file is on 8, and I cannot tell whether this is a real disagreement or a naming problem.",
      },
      {
        who: "Tomás Lindqvist",
        ini: "TL",
        role: "",
        staff: false,
        at: "2 days ago",
        votes: 6,
        text: "We landed on an 8 base with 4 as a half-step, named space-half. It reads as an exception in the code, which is exactly what it is.",
      },
      {
        who: "Nadia Brandt",
        ini: "NB",
        role: "Teaching assistant",
        staff: true,
        at: "Yesterday",
        votes: 9,
        text: "Tomás has it. Pick the base your layout actually uses and let the half-step be a documented exception. If the half-step shows up more than a fifth of the time, your base is wrong.",
      },
    ],
  },
  {
    id: "t3",
    title: "Resource: the audit spreadsheet I actually finished",
    tag: "Resources",
    pinned: false,
    votes: 31,
    at: "4 days ago",
    by: "Adaeze Nwosu",
    posts: [
      {
        who: "Adaeze Nwosu",
        ini: "AN",
        role: "",
        staff: false,
        at: "4 days ago",
        votes: 22,
        text: "Stripped Yara's template down to five columns: element, screen, variant, owner, keep-or-kill. Three hundred rows became forty in an afternoon.\n\nTake it, change it, do not thank me.",
      },
      {
        who: "Freya Nilsen",
        ini: "FN",
        role: "",
        staff: false,
        at: "3 days ago",
        votes: 8,
        text: "The keep-or-kill column is the whole thing. I stopped hedging and made decisions.",
      },
    ],
  },
  {
    id: "t4",
    title: "Dark mode: do you keep the same hue or shift it?",
    tag: "Week 2",
    pinned: false,
    votes: 12,
    at: "5 days ago",
    by: "Ben Ahlgren",
    posts: [
      {
        who: "Ben Ahlgren",
        ini: "BA",
        role: "",
        staff: false,
        at: "5 days ago",
        votes: 5,
        text: "Our indigo goes muddy on the dark surface and I have been nudging it by eye for two evenings.",
      },
      {
        who: "Yara Haddad",
        ini: "YH",
        role: "Instructor",
        staff: true,
        at: "5 days ago",
        votes: 14,
        text: "Same hue, more light. Then check contrast against the text on top of it, not the background behind it. Do it once in the semantic layer and every component inherits the fix.",
      },
    ],
  },
  {
    id: "t5",
    title: "Thursday critique: the running order",
    tag: "Week 3",
    pinned: false,
    votes: 8,
    at: "Yesterday",
    by: "Nadia Brandt",
    posts: [
      {
        who: "Nadia Brandt",
        ini: "NB",
        role: "Teaching assistant",
        staff: true,
        at: "Yesterday",
        votes: 8,
        text: "Six specimens this week: Rosa, Tomás, Priya, Aisha, Jonas, Camila. Ten minutes each, cameras on if you can. If you are not on the list, come anyway — watching is most of the value.",
      },
    ],
  },
  {
    id: "t6",
    title: "Off-topic: what are you all listening to while you work?",
    tag: "Off-topic",
    pinned: false,
    votes: 19,
    at: "1 week ago",
    by: "Camila Rojas",
    posts: [
      {
        who: "Camila Rojas",
        ini: "CR",
        role: "",
        staff: false,
        at: "1 week ago",
        votes: 9,
        text: "I need something without words for audit days. Currently on a loop of rain sounds and mild despair.",
      },
      {
        who: "Kwame Mensah",
        ini: "KM",
        role: "",
        staff: false,
        at: "6 days ago",
        votes: 6,
        text: "Highlife instrumentals. Makes spreadsheets feel like a party. It is a lie, but it works.",
      },
    ],
  },
];
