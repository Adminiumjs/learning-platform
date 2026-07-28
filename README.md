# Learning Platform

A complete, production-shaped course platform — built with Vite + React +
TypeScript, no CSS framework, no backend required. It's an example app that
ships with [Adminium](https://adminium.dev): browse a catalogue, enroll, work
through lessons that unlock week by week, ask the instructor a question, hand
in an assignment, and sit an exam — all from built-in demo data.

It is the only app in the catalogue with **two personas in one build**. The
demo dock switches between the student experience and the instructor's
teaching surface, and the loop closes across the switch: grade a submission as
the instructor, switch back, and the grade is on the student's screen.

The demo is dressed as **Yara's Academy**, a fictional digital-craft school
(design systems, typography, motion, portfolio work), so the courses,
questions and submissions read like a class already in motion rather than
lorem ipsum.

**Live demo → [adminium.dev/demo/learning-platform](https://adminium.dev/demo/learning-platform)**

## What it does

- **Two personas, 54 screens, one `view` value.** State-based routing, no
  router. The student half runs catalogue → course → checkout → my learning →
  classroom → Q&A → assignment → exam → grades → certificate, plus study
  rooms, peer review, streaks, alumni, notes, downloads, orders, team seats,
  scholarships and the rest. The instructor half runs the teach dashboard,
  course content and release dates, the grading queue, the Q&A inbox,
  announcements, roster, cohort setup, the exam builder and analytics.

- **Content that unlocks over time.** A cohort course derives every lesson's
  release from the cohort start date plus a per-lesson week offset, so week 3
  is open and weeks 4–8 render locked with the real unlock date. Self-paced
  courses never lock. The rule is one pure module,
  [`src/lib/schedule.ts`](src/lib/schedule.ts).

- **A demo clock you can move.** Nothing user-visible reads `Date.now()`.
  Cohort week 1 is pinned to Monday 20 July 2026 and the dock's **Advance one
  week** button moves the clock, so a locked lesson visibly unlocks inside a
  sixty-second demo — and every machine shows the same thing on any day.

- **An exam engine with four question kinds.**
  [`src/lib/exam.ts`](src/lib/exam.ts) auto-scores single choice, multiple
  choice (exact set match — a partially right answer scores zero) and short
  answer (normalised compare). The essay is never auto-scored: it is always
  pending a human, and that is exactly what routes the attempt into the
  instructor's grading queue.

- **Threaded questions.** Comments hang off a lesson or off the cohort, one
  level of replies deep. An instructor reply flips the card to a green
  "Answered" pill and carries an Instructor badge; a later student reply
  reopens it.

- **Light / dark themes** via CSS custom properties. The app follows your
  operating system on first load and keeps tracking it; the dock's sun/moon
  toggle latches it.

- **No bitmaps, no video, no external requests.** Course covers and the lesson
  player are layered gradients derived from a per-course tint, with an
  oversized icon and a mono filename chip. Fonts are self-hosted woff2. The
  app works offline and behind a firewall.

## Local development

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

Any screen can be opened directly with a hash — `#screen=classroom`,
`#screen=grading` — which is how the demo links deep into either persona.

### Driving the demo

The dock above the app is the demo. Everything below it is the real product.

| Control | What it does |
| --- | --- |
| **Student / Instructor** | Switches persona. The loop closes across it — this is the thing to show. |
| **Self-paced / Cohort** | Turns dated releases, live sessions and locks on and off. |
| **Advance one week** | Moves the demo clock. Locked lessons open; due dates go overdue. |
| **Reset to week 1** | Back to the start of the cohort. |
| Per-screen actions | Context shortcuts: *Fill answers* on the exam, *Simulate an answer* on Q&A, *Simulate grading* on an assignment, *Complete all* in the classroom. |

A sixty-second tour: classroom → note the locked week 5 → **Advance one week**
twice → it opens. Then assignment → Submit → switch to **Instructor** →
grading queue → score it → switch back to **Student** → the grade is there.

## Deploy

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Adminiumjs/learning-platform&project-name=learning-platform&repository-name=learning-platform)
&nbsp;
[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/Adminiumjs/learning-platform/tree/main)

- **Vercel** — click the button above, or import the repo. Build command
  `npm run build`, output `dist`.
- **DigitalOcean App Platform** — click the button above, or use the included
  [`.do/deploy.template.yaml`](.do/deploy.template.yaml).
- **Host anywhere** — `npm run build` produces a fully static `dist/` you can
  drop on any static host (Netlify, Cloudflare Pages, S3, GitHub Pages…). Or
  build the container:

  ```bash
  docker build -t learning-platform .
  docker run -p 8080:80 learning-platform
  ```

### Build scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check + build to `dist/` at base `/` (root deploys). |
| `npm run build:demo` | Build to `dist/` at base `/demo/learning-platform/` (Adminium demo). |
| `npm run preview` | Preview a production build locally. |
| `npm test` | Run the drip, exam and thread engine suites. |

## Full implementation (self-host)

There are two tiers to running this academy.

**Tier 1 — the frontend, one click.** The Vercel / DigitalOcean buttons above
deploy the course platform on its own, running on the bundled demo data. No
database, no dashboard — a fully static preview.

**Tier 2 — the whole stack, one command.**
[`docker-compose.yml`](docker-compose.yml) stands up Postgres (seeded with the
*same* courses, lessons, cohort, students and submissions), an auto-generated
Adminium dashboard that runs that real database, and the course platform:

```bash
cp .env.example .env      # then set ADMINIUM_SECRET — e.g. openssl rand -hex 32
docker compose up
```

- **Course platform** → http://localhost:8080
- **Adminium dashboard** → http://localhost:4600

On first boot, `lms-db` applies [`db/schema.sql`](db/schema.sql) then
[`db/seed.sql`](db/seed.sql), and Adminium imports the academy database as its
first source connection, introspects the schema, and generates the back
office. Finish the ~1-minute first-run wizard at `:4600` — it's pre-pointed at
the seeded academy DB. The install spec Adminium reads to configure itself is
[`manifest.json`](manifest.json).

### The split: the classroom and the back office

The app you deploy is **the classroom**. The dashboard Adminium generates from
[`manifest.json`](manifest.json) is **the back office**. That is the product
story, not a limitation:

| In this app | In the generated dashboard |
| --- | --- |
| The whole student experience, end to end | Every one of the 17 tables as records |
| Structuring content and scheduling when it unlocks | Revenue and engagement analytics |
| Grading a submission with written feedback | Exam authoring (the question builder) |
| Answering a question in the lesson's context | Student and instructor directories |
| Posting an announcement; seeing who is behind | Media library and bulk operations |

The manifest scaffolds 17 tables, 9 dashboard pages, 2 access presets
(`instructor`, `teaching-assistant`) and 7 settings into your connected
database.

## Connecting to Adminium

All data access goes through a thin `DataSource` interface
([`src/data/source.ts`](src/data/source.ts)) with a single `demoDataSource`
implementation backed by the bundled academy. **Today the deployed demo is
demo data only — nothing is persisted, no card is charged and no submission
reaches a person.** Once Adminium's browser-safe **publishable key**
(`adm_pub_…`) ships, the frontend will read and write **live** data — your real
courses, enrollments and submissions from the database above — through the
Adminium records API via a second `DataSource` implementation, without
touching any of the screens or the store. The seam is already in place; the
key is the only missing piece.

### What is deliberately out of scope

- **Video hosting.** `media_url` points at an external host. Adminium never
  transcodes or streams; the player here is a shell by design.
- **Scheduled reminder emails.** They need a job runner this version does not
  have.
- **Per-student time zones.** Due dates and sessions resolve against the
  academy's single `time_zone` setting.
- **Proctoring.** Out of scope on principle, not on schedule.

## Project structure

```
src/
  app/         App shell + the exhaustive 54-view switch
  state/       Zustand store (persona, demo clock, progress, answers, replies)
  data/        demo.ts (the seeded academy), types, DataSource seam,
               screens/ (page-local seed data)
  lib/         schedule.ts (drip/unlock), exam.ts (scoring), thread.ts (Q&A)
  screens/     the 54 views — catalog, classroom, exam, grading queue, …
  components/  header, demo dock, footer, covers, player shell, primitives
  styles/      tokens.css (design tokens + accent), base.css, components.css,
               screen-<view>.css
db/            schema.sql + seed.sql for the full self-host stack
public/fonts/  self-hosted Manrope + JetBrains Mono (woff2)
manifest.json  the Adminium install spec (17 tables, 9 pages, 2 roles)
```

## License

[AGPL-3.0](LICENSE) © 2026 Learning Platform. A demo shipped with Adminium.
