/*
 * Alumni directory seed — the comp's `people` table and its filter row.
 *
 * Page-local on purpose: no other screen reads an alumnus, so this stays out
 * of the shared `dataSource` contract. Copy is in-fiction and verbatim.
 */

export interface Alum {
  name: string;
  /** Two-letter monogram — the app renders no avatar images. */
  ini: string;
  role: string;
  city: string;
  /** The course code they finished. Doubles as a filter id. */
  course: string;
  /** The one line they agreed to be listed with. */
  line: string;
  hiring: boolean;
  tags: string[];
}

export interface AlumniFilter {
  /** "all" and "hiring" are sentinels; everything else is a course code. */
  id: string;
  label: string;
}

export const ALUMNI_FILTERS: AlumniFilter[] = [
  { id: "all", label: "Everyone" },
  { id: "hiring", label: "Hiring" },
  { id: "DS-101", label: "Design Systems" },
  { id: "TY-140", label: "Type & Layout" },
  { id: "MO-220", label: "Motion" },
];

/** The lede: 184 finished, eight opted in. Both numbers are load-bearing copy. */
export const ALUMNI_LEDE =
  "184 people have finished a course here. These eight said yes to being listed.";

export const ALUMNI: Alum[] = [
  {
    name: "Ingrid Halvorsen",
    ini: "IH",
    role: "Design lead, Nordre",
    city: "Oslo",
    course: "DS-101",
    line: "Runs the system I built here. Happy to talk about convincing engineers.",
    hiring: true,
    tags: ["Design systems", "Mentoring"],
  },
  {
    name: "Chidera Obi",
    ini: "CO",
    role: "Product designer, Kova",
    city: "Lagos",
    course: "DS-101",
    line: "Rebuilt a banking app on tokens. Ask me about dark mode in a regulated product.",
    hiring: false,
    tags: ["Tokens", "Fintech"],
  },
  {
    name: "Freya Nilsen",
    ini: "FN",
    role: "Freelance, self-employed",
    city: "Copenhagen",
    course: "TY-140",
    line: "Type-first branding for small studios. Always up for a specimen swap.",
    hiring: false,
    tags: ["Typography", "Freelance"],
  },
  {
    name: "Adaeze Nwosu",
    ini: "AN",
    role: "Design manager, Farrow",
    city: "Manchester",
    course: "DS-101",
    line: "Hiring a mid-weight systems designer this autumn. Alumni get a first read.",
    hiring: true,
    tags: ["Hiring", "Leadership"],
  },
  {
    name: "Jonas Weber",
    ini: "JW",
    role: "Agency partner, Weber & Co",
    city: "Berlin",
    course: "MO-220",
    line: "We do motion work for museums. Genuinely the best job in the world.",
    hiring: false,
    tags: ["Motion", "Agency"],
  },
  {
    name: "Yuki Tanaka",
    ini: "YT",
    role: "Staff designer, Sora",
    city: "Tokyo",
    course: "DS-101",
    line: "Two years into a system nobody wanted. It is now the default. Ask me how.",
    hiring: false,
    tags: ["Design systems", "Enterprise"],
  },
  {
    name: "Nora Lindgren",
    ini: "NL",
    role: "Design engineer, Tally",
    city: "Stockholm",
    course: "TY-140",
    line: "I live between Figma and the codebase. Token pipelines are my hobby.",
    hiring: false,
    tags: ["Engineering", "Tokens"],
  },
  {
    name: "Camila Rojas",
    ini: "CR",
    role: "Product designer, Vela",
    city: "Bogotá",
    course: "TY-140",
    line: "Finished Type & Layout last spring and came straight back for the cohort.",
    hiring: false,
    tags: ["Portfolio", "Type"],
  },
];
