-- Learning Platform — PostgreSQL schema (manifest §requiredSchema contract).
--
-- This is the real database that backs the full self-host stack: the course
-- platform reads it (through Adminium's records API) and the auto-generated
-- Adminium dashboard is the back office that runs it. Applied automatically on
-- first boot of the `lms-db` container via
-- /docker-entrypoint-initdb.d/01-schema.sql, then seeded by 02-seed.sql. The
-- seed mirrors src/data/demo.ts one-for-one (same courses, modules, lessons,
-- cohort, students, questions and submissions) so the classroom and the
-- dashboard show the same academy.
--
-- Seventeen tables — the largest contract in the Adminium catalog. The split
-- is deliberate: the platform owns the teaching loop, the generated dashboard
-- owns the records.
--
-- Money is numeric(10, 2); the demo academy trades in USD. Every timestamp is
-- timestamptz — due dates and live sessions resolve against the academy's
-- configured time zone, and there are no per-student zones in v1.

DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;

-- People ---------------------------------------------------------------------

-- Whoever teaches. `initials` and `tint` drive the avatar the platform renders
-- when `avatar` is empty, so both are required.
CREATE TABLE instructors (
  id         serial PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL UNIQUE,
  initials   text        NOT NULL,
  avatar     text        NOT NULL DEFAULT '',
  tint       text        NOT NULL DEFAULT '#7c3aed',
  bio        text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE students (
  id         serial PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL UNIQUE,
  initials   text        NOT NULL,
  avatar     text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Catalogue ------------------------------------------------------------------

-- `mode` is the whole of the drip story: a self_paced course never locks, a
-- cohort course derives every lesson's release from its cohort's start date.
CREATE TABLE courses (
  id          serial PRIMARY KEY,
  code        text        NOT NULL UNIQUE,          -- 'DS-101'
  title       text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  summary     text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  cover       text        NOT NULL DEFAULT '',
  tint        text        NOT NULL DEFAULT '#7c3aed',
  icon        text        NOT NULL DEFAULT 'layout-grid',
  price       numeric(10, 2) NOT NULL DEFAULT 0,
  level       text        NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  mode        text        NOT NULL CHECK (mode IN ('self_paced', 'cohort')),
  status      text        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
  category    text        NOT NULL DEFAULT '',
  instructor_id integer   NOT NULL REFERENCES instructors (id) ON DELETE RESTRICT,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id        serial PRIMARY KEY,
  course_id integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  title     text    NOT NULL,
  position  integer NOT NULL DEFAULT 0,
  -- Which cohort week this module opens in. NULL on a self-paced course.
  week      integer
);

-- `publish_at` NULL means self-paced (always open). A non-NULL value is the
-- moment the lesson unlocks; `preview` overrides it for the sales page.
CREATE TABLE lessons (
  id           serial PRIMARY KEY,
  module_id    integer NOT NULL REFERENCES modules (id) ON DELETE CASCADE,
  title        text    NOT NULL,
  kind         text    NOT NULL CHECK (kind IN ('video', 'reading', 'assignment', 'exam', 'live')),
  duration_min integer NOT NULL DEFAULT 0,
  content      text    NOT NULL DEFAULT '',
  -- Points at an external host. Adminium never transcodes or streams media.
  media_url    text    NOT NULL DEFAULT '',
  position     integer NOT NULL DEFAULT 0,
  publish_at   timestamptz,
  preview      boolean NOT NULL DEFAULT false
);

CREATE TABLE cohorts (
  id        serial PRIMARY KEY,
  course_id integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  name      text    NOT NULL,
  starts_on date    NOT NULL,
  ends_on   date    NOT NULL,
  capacity  integer NOT NULL DEFAULT 30,
  status    text    NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'active', 'completed'))
);

-- Enrolment and money --------------------------------------------------------

CREATE TABLE enrollments (
  id           serial PRIMARY KEY,
  student_id   integer NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  course_id    integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  cohort_id    integer REFERENCES cohorts (id) ON DELETE SET NULL,
  status       text    NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'completed', 'refunded', 'cancelled')),
  progress_pct integer NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  enrolled_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE orders (
  id         serial PRIMARY KEY,
  number     text        NOT NULL UNIQUE,           -- 'YA-2041'
  student_id integer     NOT NULL REFERENCES students (id) ON DELETE RESTRICT,
  course_id  integer     NOT NULL REFERENCES courses (id) ON DELETE RESTRICT,
  amount     numeric(10, 2) NOT NULL,
  status     text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'paid', 'refunded')),
  placed_at  timestamptz NOT NULL DEFAULT now()
);

-- Progress -------------------------------------------------------------------

CREATE TABLE lesson_progress (
  id            serial PRIMARY KEY,
  enrollment_id integer NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  lesson_id     integer NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  completed     boolean NOT NULL DEFAULT false,
  seconds       integer NOT NULL DEFAULT 0,
  completed_at  timestamptz,
  UNIQUE (enrollment_id, lesson_id)
);

-- Graded work ----------------------------------------------------------------

CREATE TABLE assignments (
  id           serial PRIMARY KEY,
  lesson_id    integer NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  title        text    NOT NULL,
  instructions text    NOT NULL DEFAULT '',
  due_at       timestamptz,
  points       integer NOT NULL DEFAULT 20
);

-- `score` NULL means awaiting grade — that is what puts a row in the queue.
CREATE TABLE submissions (
  id            serial PRIMARY KEY,
  assignment_id integer NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  enrollment_id integer NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  body          text    NOT NULL DEFAULT '',
  attachment    text    NOT NULL DEFAULT '',
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  score         numeric(6, 2),
  feedback      text    NOT NULL DEFAULT '',
  graded_at     timestamptz,
  graded_by     integer REFERENCES instructors (id) ON DELETE SET NULL,
  UNIQUE (assignment_id, enrollment_id)
);

-- Exams ----------------------------------------------------------------------

CREATE TABLE exams (
  id               serial PRIMARY KEY,
  course_id        integer NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  cohort_id        integer REFERENCES cohorts (id) ON DELETE SET NULL,
  title            text    NOT NULL,
  opens_at         timestamptz,
  closes_at        timestamptz,
  duration_min     integer NOT NULL DEFAULT 45,
  attempts_allowed integer NOT NULL DEFAULT 1,
  pass_score       integer NOT NULL DEFAULT 70
);

-- `options` and `answer` are JSON so one table carries all four question kinds.
-- An `essay` row has no answer key at all: it is always graded by a human, and
-- that is what routes an attempt into the instructor's queue.
CREATE TABLE exam_questions (
  id       serial PRIMARY KEY,
  exam_id  integer NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  prompt   text    NOT NULL,
  kind     text    NOT NULL CHECK (kind IN ('single', 'multi', 'short', 'essay')),
  section  text    NOT NULL DEFAULT '',
  options  jsonb,
  answer   jsonb,
  points   integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE exam_attempts (
  id            serial PRIMARY KEY,
  exam_id       integer NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  enrollment_id integer NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  submitted_at  timestamptz,
  answers       jsonb   NOT NULL DEFAULT '{}'::jsonb,
  score         numeric(6, 2),
  status        text    NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'submitted', 'graded'))
);

-- Class communication --------------------------------------------------------

CREATE TABLE announcements (
  id            serial PRIMARY KEY,
  cohort_id     integer NOT NULL REFERENCES cohorts (id) ON DELETE CASCADE,
  instructor_id integer NOT NULL REFERENCES instructors (id) ON DELETE RESTRICT,
  title         text    NOT NULL,
  body          text    NOT NULL DEFAULT '',
  pinned        boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One level of replies only: `parent_id` points at a top-level comment and
-- never at another reply. `answered` is maintained by the app when an
-- instructor replies, and cleared when a student replies after them.
CREATE TABLE comments (
  id            serial PRIMARY KEY,
  lesson_id     integer REFERENCES lessons (id) ON DELETE CASCADE,
  cohort_id     integer REFERENCES cohorts (id) ON DELETE CASCADE,
  enrollment_id integer REFERENCES enrollments (id) ON DELETE SET NULL,
  instructor_id integer REFERENCES instructors (id) ON DELETE SET NULL,
  author_kind   text    NOT NULL CHECK (author_kind IN ('student', 'instructor')),
  body          text    NOT NULL,
  parent_id     integer REFERENCES comments (id) ON DELETE CASCADE,
  answered      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  -- A comment hangs off a lesson or a cohort, never neither.
  CONSTRAINT comments_anchored CHECK (lesson_id IS NOT NULL OR cohort_id IS NOT NULL)
);

CREATE TABLE live_sessions (
  id            serial PRIMARY KEY,
  cohort_id     integer NOT NULL REFERENCES cohorts (id) ON DELETE CASCADE,
  title         text    NOT NULL,
  starts_at     timestamptz NOT NULL,
  duration_min  integer NOT NULL DEFAULT 60,
  join_url      text    NOT NULL DEFAULT '',
  recording_url text    NOT NULL DEFAULT '',
  status        text    NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'live', 'ended'))
);

-- Indexes the dashboard's list pages lean on ---------------------------------

CREATE INDEX ON modules (course_id, position);
CREATE INDEX ON lessons (module_id, position);
CREATE INDEX ON cohorts (course_id, starts_on);
CREATE INDEX ON enrollments (course_id, status);
CREATE INDEX ON enrollments (cohort_id);
CREATE INDEX ON orders (student_id, placed_at DESC);
CREATE INDEX ON lesson_progress (enrollment_id);
-- The grading queue: ungraded submissions, oldest first.
CREATE INDEX ON submissions (graded_at, submitted_at) WHERE graded_at IS NULL;
CREATE INDEX ON exam_questions (exam_id, position);
CREATE INDEX ON exam_attempts (enrollment_id, exam_id);
CREATE INDEX ON announcements (cohort_id, pinned, created_at DESC);
-- The Q&A inbox: unanswered lesson questions.
CREATE INDEX ON comments (lesson_id, answered, created_at DESC);
CREATE INDEX ON comments (cohort_id, created_at DESC);
CREATE INDEX ON live_sessions (cohort_id, starts_at);
