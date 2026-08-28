// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Connected mode (28-public-surface.md §5.2, 28-T28 wave 3).
 *
 * ── WHY THIS DRIVES A REAL CLIENT ──────────────────────────────────────────
 * `createPublicClient` takes an injectable `fetch`, so these run the SHIPPED
 * client against canned wire responses rather than a hand-written stub of it.
 * `assertRefs`, the config fetch, the paging and the URL building are therefore
 * under test too.
 *
 * ── THE THREE THAT MATTER MOST HERE ────────────────────────────────────────
 *  1. A CUSTOMER-side key reads the catalogue and nothing about a person. This
 *     is §4's staff/customer split as a branch rather than as documentation,
 *     and getting it backwards puts a cohort's names and grades on a public
 *     course page.
 *  2. The exam's ANSWER KEY never travels, on either side. The demo ships it
 *     and grades in the browser, which is fine for fiction and indefensible
 *     against a real cohort.
 *  3. The signed-in student's own things are EMPTY. Nothing here knows who is
 *     reading, and showing somebody else's purchases is worse than showing none.
 */

import { describe, expect, it } from "vitest";

import { createPublicClient } from "@adminiumjs/public-client";

import { loadSnapshot, snapshotSource } from "./adminiumSource";
import { dataSource, demoDataSource, isConnected, setDataSource } from "./source";

const PUBLIC = [
  "instructors", "courses", "modules", "lessons", "cohorts",
  "exams", "examQuestions", "announcements", "liveSessions",
];
const STAFF = ["students", "enrollments", "assignments", "submissions", "comments"];

const ROWS: Record<string, unknown[]> = {
  instructors: [
    { id: 1, name: "Yara Haddad", initials: "YH" },
    { id: 2, name: "Nadia Brandt", initials: "NB" },
  ],
  students: [
    { id: 10, name: "Rosa Marchetti", initials: "RM" },
    { id: 11, name: "Kwame Mensah", initials: "KM" },
  ],
  courses: [
    {
      id: 100, code: "DS-101", title: "Design systems", slug: "design-systems",
      summary: "From tokens to a shipped kit.", tint: "#7c3aed", icon: "layout-grid",
      price: "240.00", level: "intermediate", mode: "cohort", status: "published",
      category: "design", instructor_id: 1,
    },
    {
      id: 101, code: "DR-900", title: "Unfinished", slug: "unfinished",
      summary: "", tint: "#000", icon: "x", price: "0.00", level: "beginner",
      mode: "self_paced", status: "draft", category: "design", instructor_id: 1,
    },
  ],
  modules: [
    { id: 200, course_id: 100, title: "Foundations", position: 0, week: 1 },
    { id: 201, course_id: 100, title: "Type", position: 1, week: 2 },
  ],
  lessons: [
    { id: 300, module_id: 200, title: "Why systems", kind: "video", duration_min: 18, position: 0 },
    { id: 301, module_id: 200, title: "Type specimen", kind: "assignment", duration_min: 0, position: 1 },
    { id: 302, module_id: 201, title: "Scales", kind: "reading", duration_min: 9, position: 0 },
  ],
  cohorts: [
    { id: 400, course_id: 100, starts_on: "2026-06-01", ends_on: "2026-07-27", capacity: 30, status: "active" },
  ],
  enrollments: [
    { id: 500, student_id: 10, course_id: 100, status: "active", progress_pct: 50 },
    { id: 501, student_id: 11, course_id: 100, status: "active", progress_pct: 45 },
  ],
  assignments: [
    { id: 600, lesson_id: 301, title: "Type specimen page", due_at: "2026-07-01T22:00:00Z", points: 20 },
  ],
  submissions: [
    {
      id: 700, assignment_id: 600, enrollment_id: 500, body: "Here it is.",
      attachment: "type_specimen.pdf", submitted_at: "2026-06-30T10:00:00Z", score: "18.00",
    },
    {
      id: 701, assignment_id: 600, enrollment_id: 501, body: "Late, sorry.",
      attachment: "", submitted_at: "2026-07-03T10:00:00Z", score: null,
    },
  ],
  exams: [
    { id: 800, course_id: 100, duration_min: 45, attempts_allowed: 2, pass_score: 70 },
  ],
  examQuestions: [
    { id: 900, exam_id: 800, prompt: "Which is a token?", kind: "single", section: "Tokens", options: ["A", "B"], position: 0 },
    { id: 901, exam_id: 800, prompt: "Explain a scale.", kind: "essay", section: "Type", options: null, position: 1 },
  ],
  announcements: [
    { id: 1000, cohort_id: 400, instructor_id: 1, title: "Week 3", body: "Read ahead.", pinned: true, created_at: "2026-06-15T09:00:00Z" },
  ],
  comments: [
    { id: 1100, lesson_id: 300, enrollment_id: 500, instructor_id: null, author_kind: "student", body: "Is this recorded?", parent_id: null, created_at: "2026-06-16T09:00:00Z" },
    { id: 1101, lesson_id: 300, enrollment_id: null, instructor_id: 1, author_kind: "instructor", body: "Yes, always.", parent_id: 1100, created_at: "2026-06-16T10:00:00Z" },
  ],
  liveSessions: [
    { id: 1200, cohort_id: 400, title: "Critique", starts_at: "2026-06-17T16:00:00Z", duration_min: 60 },
  ],
};

interface FakeOptions {
  rows?: Record<string, unknown[]>;
  expose?: (ref: string) => string[];
  limit?: number;
  side?: string;
}

/** A server that answers exactly what the scope would, paging included. */
function fakeFetch(overrides: FakeOptions = {}) {
  const rows = overrides.rows ?? ROWS;
  const limit = overrides.limit ?? 500;
  const side = overrides.side ?? "staff";
  return async (input: RequestInfo | URL): Promise<Response> => {
    const url = new URL(String(input));
    const json = (body: unknown) =>
      new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

    if (url.pathname.endsWith("/public/config")) {
      const refs: Record<string, unknown> = {};
      // A customer-side scope carries the catalogue refs and no more, which is
      // what an operator would actually mint.
      for (const ref of side === "staff" ? [...PUBLIC, ...STAFF] : PUBLIC) {
        refs[ref] = {
          actions: ["list"],
          expose: overrides.expose?.(ref) ?? Object.keys((rows[ref]?.[0] ?? {}) as object),
          filterable: [], searchable: [], orderable: [], writable: [], limit,
        };
      }
      // `/public/config` is the one route the client unwraps: it reads
      // `body.data`, while `list` reads the body itself.
      return json({
        data: { version: 1, side, timezone: "Europe/Berlin", currency: "EUR", claim: null, refs },
      });
    }

    const ref = url.pathname.split("/").pop() ?? "";
    const all = rows[ref] ?? [];
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const size = Number(url.searchParams.get("limit") ?? String(all.length));
    return json({ data: all.slice(offset, offset + size) });
  };
}

const clientWith = (fetch: ReturnType<typeof fakeFetch>) =>
  createPublicClient({ baseUrl: "https://api.example.test", publishableKey: "adm_pub_test", fetch });

const snapshot = async (overrides: FakeOptions = {}) =>
  loadSnapshot(clientWith(fakeFetch(overrides))!);

describe("demo mode is the structural default", () => {
  it("builds no client when either variable is absent", () => {
    expect(createPublicClient({ baseUrl: "https://x.test", publishableKey: "" })).toBeNull();
    expect(createPublicClient({ baseUrl: "", publishableKey: "adm_pub_x" })).toBeNull();
    expect(createPublicClient(undefined)).toBeNull();
  });

  it("falls back rather than throwing when the server is unreachable", async () => {
    const client = clientWith(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect(await loadSnapshot(client!)).toBeNull();
  });

  it("falls back when the scope does not expose a column the app reads", async () => {
    expect(await snapshot({ expose: () => ["id"] })).toBeNull();
  });
});

describe("the side of the key decides what is read", () => {
  it("reads no person at all through a customer-side scope", async () => {
    const snap = await snapshot({ side: "customer" });
    expect(snap).not.toBeNull();
    // The catalogue is there…
    expect(snap!.courses.map((c) => c.id)).toEqual(["DS-101"]);
    expect(snap!.modules).toHaveLength(2);
    // …and nobody's name, grade, submission or question is.
    expect(snap!.students).toEqual([]);
    expect(snap!.submissions).toEqual([]);
    expect(snap!.questions).toEqual([]);
  });

  it("reads the people half through a staff-side scope", async () => {
    const snap = await snapshot({ side: "staff" });
    expect(snap!.students.map((s) => s[0])).toEqual(["Rosa Marchetti", "Kwame Mensah"]);
    expect(snap!.submissions.map((s) => s.who)).toEqual(["Kwame Mensah"]);
    expect(snap!.questions.map((q) => q.text)).toEqual(["Is this recorded?"]);
  });
});

describe("the exam", () => {
  it("never carries the answer key, on either side", async () => {
    for (const side of ["staff", "customer"]) {
      const snap = await snapshot({ side });
      expect(snap!.exam).toHaveLength(2);
      // THE FAILURE THIS PINS. A staff-side build is still a browser, and a
      // student who can open the page can read whatever is in it.
      expect(snap!.exam.every((q) => q.a === undefined)).toBe(true);
      // The options still travel — a question with no options cannot be asked.
      expect(snap!.exam[0]!.opts).toEqual(["A", "B"]);
      expect(snap!.exam[1]!.opts).toBeUndefined();
    }
  });

  it("reads its rules from the exam row rather than from the seed", async () => {
    const snap = await snapshot();
    expect(snap!.examRules).toEqual({
      durationMin: 45, durationSec: 2700, questions: 2, attemptsAllowed: 2, passScore: 70,
    });
  });
});

describe("the catalogue", () => {
  it("keys a course by its code and keeps drafts off the shelf", async () => {
    const snap = await snapshot();
    // `courses.code` is TEXT and is the app's own id — the good pattern.
    expect(snap!.courses.map((c) => c.id)).toEqual(["DS-101"]);
    const course = snap!.courses[0]!;
    expect(course.level).toBe("Intermediate");
    expect(course.kind).toBe("cohort");
    // `numeric` arrives as a string and must not reach arithmetic as one.
    expect(course.price).toBe(240);
    expect(course.lessons).toBe(3);
    expect(course.teacher).toBe("Yara Haddad");
    // WS-I G-2: no cover-file column, so the mono chip is derived.
    expect(course.file).toBe("design-systems.webp");
  });

  it("orders modules and lessons by position and measures each in its own unit", async () => {
    const snap = await snapshot();
    expect(snap!.modules.map((m) => m.num)).toEqual(["01", "02"]);
    expect(snap!.modules[0]!.week).toBe(1);
    const [why, specimen] = snap!.modules[0]!.lessons;
    // Time for a video, points for graded work — the schema has one duration
    // column, so an assignment's points come from its assignment row.
    expect(why!.secs).toBe(18 * 60);
    expect(why!.pts).toBeUndefined();
    expect(specimen!.pts).toBe(20);
    expect(specimen!.secs).toBeUndefined();
    // Every lesson carries its owning module, which is what `lessons()` means.
    expect(snap!.lessons).toHaveLength(3);
    expect(snap!.lessons[0]!.mod.title).toBe("Foundations");
    expect(snap!.totalLessons).toBe(3);
  });

  it("derives the cohort's length and pins its noticeboard, newest first", async () => {
    const snap = await snapshot();
    // 1 June to 27 July is eight weeks.
    expect(snap!.cohortWeeks).toBe(8);
    expect(snap!.cohortCapacity).toBe(30);
    expect(snap!.announcements[0]).toMatchObject({ title: "Week 3", pinned: true, sent: "Yara Haddad" });
    // 09:00Z is 11:00 in Berlin in June — the day is the TENANT's, and reading
    // an instant in the reader's zone can move it across midnight.
    expect(snap!.announcements[0]!.at).toBe("2026-06-15");
  });
});

describe("the grading queue and the cohort list", () => {
  it("queues only ungraded work and flags what arrived late", async () => {
    const snap = await snapshot();
    const late = snap!.submissions[0]!;
    expect(late.who).toBe("Kwame Mensah");
    expect(late.item).toBe("Type specimen page");
    expect(late.max).toBe(20);
    // `tag` is the machine token grading switches tone on, so it must not move
    // with the language.
    expect(late.tag).toBe("late");
    expect(late.files).toEqual([]);
  });

  it("derives last-active and a grade average from what was submitted", async () => {
    const snap = await snapshot();
    const [rosa, kwame] = snap!.students;
    // WS-I G-4: there is no "last active" column.
    expect(rosa).toEqual(["Rosa Marchetti", 50, "2026-06-30", 90]);
    // Nothing graded yet, and nothing submitted before the ungraded one.
    expect(kwame![3]).toBe(0);
  });

  it("reads every page, not just the first the scope allows", async () => {
    const snap = await snapshot({ limit: 1 });
    expect(snap!.lessons).toHaveLength(3);
    expect(snap!.students).toHaveLength(2);
    expect(snap!.exam).toHaveLength(2);
  });
});

describe("what a connected build refuses to carry over", () => {
  it("shows no signed-in student, no purchases and no lesson transcript", async () => {
    const connected = snapshotSource((await snapshot())!);
    // Identity is not solved: nothing here knows who is reading.
    expect(connected.student().name).toBe("");
    expect(connected.enrolled()).toEqual([]);
    expect(connected.enrolledByDate()).toEqual([]);
    expect(connected.enrolledCourse("DS-101")).toBeUndefined();
    expect(connected.nextOrderNo()).toBe("");
    expect(connected.myAssignment().title).toBe("");
    // WS-I G-3: `LESSON_META` is keyed by the SEED's lesson ids, which no
    // connected lesson has. Empty beats another lesson's transcript.
    expect(connected.lessonMeta("300")).toEqual({
      overview: "", points: [], files: [], transcript: [],
    });
  });

  it("keeps the app's own copy, which no database has anything to say about", async () => {
    const connected = snapshotSource((await snapshot())!);
    // Icons and labels for the five lesson kinds, and the landing page's
    // outcomes: code and copy, not rows. WS-I G-5.
    expect(Object.keys(connected.lessonKinds())).toContain("video");
    expect(connected.learningOutcomes().length).toBeGreaterThan(0);
  });

  it("hands back the same shapes demoDataSource does", async () => {
    const connected = snapshotSource((await snapshot())!);
    for (const key of Object.keys(demoDataSource) as (keyof typeof demoDataSource)[]) {
      expect(typeof connected[key]).toBe("function");
    }
  });
});

describe("the seam", () => {
  it("reports demo mode until a real source is installed, and connected after", async () => {
    expect(isConnected()).toBe(false);
    const connected = snapshotSource((await snapshot())!);
    setDataSource(connected);
    expect(isConnected()).toBe(true);
    // The Proxy means a screen reading `dataSource` sees the swap immediately —
    // which is why the store, and only the store, forces the dynamic import.
    expect(dataSource.courses().map((c) => c.id)).toEqual(["DS-101"]);
    setDataSource(demoDataSource);
    expect(isConnected()).toBe(false);
  });
});
