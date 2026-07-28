-- Learning Platform — seed data.
--
-- Mirrors src/data/demo.ts one-for-one: the same four courses, the same five
-- modules and twenty-two lessons, the same cohort in week three, the same
-- thirty students, six questions, four ungraded submissions and one exam. Run
-- the SPA and the generated dashboard side by side and they show the same
-- academy.
--
-- Dates are anchored to the same cohort week one the app uses — Monday
-- 20 July 2026 — so "week 3" means the same thing in both places.
--
-- Everything here is demo fiction: names, prices, order numbers and grades are
-- props for a fictional digital-craft school.

BEGIN;

-- People ---------------------------------------------------------------------

INSERT INTO instructors (name, email, initials, tint, bio) VALUES
  ('Yara Haddad', 'yara@yaras.academy', 'YH', '#7c3aed',
   'Design systems lead turned teacher. Fifteen years of untangling interfaces, eight of them explaining how. Believes a system is mostly a naming problem wearing a colour palette.'),
  ('Nadia Brandt', 'nadia@yaras.academy', 'NB', '#0d9488',
   'Teaching assistant and motion designer. Answers the questions that arrive at midnight.');

INSERT INTO students (name, email, initials) VALUES
  ('Rosa Marchetti',    'rosa@marchetti.studio',  'RM'),
  ('Adaeze Nwosu',      'adaeze@example.com',     'AN'),
  ('Tomás Lindqvist',   'tomas@example.com',      'TL'),
  ('Priya Raman',       'priya@example.com',      'PR'),
  ('Ben Ahlgren',       'ben@example.com',        'BA'),
  ('Chidera Obi',       'chidera@example.com',    'CO'),
  ('Mette Sørensen',    'mette@example.com',      'MS'),
  ('Kwame Mensah',      'kwame@example.com',      'KM'),
  ('Ingrid Halvorsen',  'ingrid@example.com',     'IH'),
  ('Diego Ferreira',    'diego@example.com',      'DF'),
  ('Yuki Tanaka',       'yuki@example.com',       'YT'),
  ('Sofia Kovač',       'sofia@example.com',      'SK'),
  ('Omar Haddadi',      'omar@example.com',       'OH'),
  ('Lena Brandt',       'lena@example.com',       'LB'),
  ('Marcus Feld',       'marcus@example.com',     'MF'),
  ('Aisha Bello',       'aisha@example.com',      'AB'),
  ('Jonas Weber',       'jonas@example.com',      'JW'),
  ('Camila Rojas',      'camila@example.com',     'CR'),
  ('Henry Osei',        'henry@example.com',      'HO'),
  ('Nora Lindgren',     'nora@example.com',       'NL'),
  ('Ravi Kapoor',       'ravi@example.com',       'RK'),
  ('Elif Demir',        'elif@example.com',       'ED'),
  ('Pablo Serra',       'pablo@example.com',      'PS'),
  ('Anna Kowalski',     'anna@example.com',       'AK'),
  ('Thabo Molefe',      'thabo@example.com',      'TM'),
  ('Julia Nowak',       'julia@example.com',      'JN'),
  ('Sami Rahal',        'sami@example.com',       'SR'),
  ('Freya Nilsen',      'freya@example.com',      'FN'),
  ('Louis Girard',      'louis@example.com',      'LG'),
  ('Hana Suzuki',       'hana@example.com',       'HS');

-- Catalogue ------------------------------------------------------------------

INSERT INTO courses
  (code, title, slug, summary, description, tint, icon, price, level, mode, status, category, instructor_id)
VALUES
  ('DS-101', 'Design Systems from Scratch', 'design-systems-from-scratch',
   'Build a real system from an honest audit to a documented, shipped library.',
   'Eight weeks, weekly critique, and one very stubborn button component. We start with an audit you can finish, build a token layer that survives a rebrand, and end with documentation your engineers will actually read.',
   '#7c3aed', 'layout-grid', 180.00, 'intermediate', 'cohort', 'published', 'Design', 1),

  ('TY-140', 'Type & Layout Fundamentals', 'type-and-layout-fundamentals',
   'Scales, measure, rhythm, and the small decisions that make a page feel calm.',
   'Start today and take as long as you like. Eighteen lessons on the type decisions that quietly decide whether an interface feels considered or thrown together.',
   '#2563eb', 'type', 95.00, 'beginner', 'self_paced', 'published', 'Typography', 1),

  ('MO-220', 'Motion for Interfaces', 'motion-for-interfaces',
   'Easing, duration, and choreography for interfaces that explain themselves.',
   'Motion as a sentence, not a firework. Fourteen lessons on making movement carry meaning rather than decoration.',
   '#0d9488', 'orbit', 120.00, 'advanced', 'self_paced', 'published', 'Motion', 2),

  ('PF-310', 'Portfolio Studio', 'portfolio-studio',
   'Six weeks of writing, editing and cutting until three case studies land.',
   'Most portfolios describe what was made. This one is about saying what you did, why it mattered, and what you would change.',
   '#e11d48', 'briefcase', 150.00, 'intermediate', 'cohort', 'published', 'Portfolio', 1);

-- The cohort course's curriculum. `week` drives the drip: a module opens when
-- the cohort reaches its week.
INSERT INTO modules (course_id, title, position, week) VALUES
  (1, 'Foundations',            1, 1),
  (1, 'Colour and tokens',      2, 2),
  (1, 'Type and spacing',       3, 3),
  (1, 'Components in practice', 4, 5),
  (1, 'Ship and document',      5, 7);

-- publish_at is derived from the cohort start (Mon 20 Jul 2026) plus the
-- module's week offset. Weeks 1–3 are open at the seeded "now"; 5 and 7 are not.
INSERT INTO lessons (module_id, title, kind, duration_min, media_url, position, publish_at, preview) VALUES
  (1, 'Why systems win',                  'video',      8,  'lesson_01_why.mp4',        1, '2026-07-20 09:00+00', true),
  (1, 'Inventory your UI',                'video',      12, 'lesson_02_inventory.mp4',  2, '2026-07-20 09:00+00', true),
  (1, 'Naming things',                    'reading',    9,  'naming_things.md',         3, '2026-07-20 09:00+00', false),
  (1, 'Primitives vs components',         'video',      14, 'lesson_04_primitives.mp4', 4, '2026-07-20 09:00+00', false),
  (1, 'Audit walkthrough',                'video',      11, 'lesson_05_audit.mp4',      5, '2026-07-20 09:00+00', false),

  (2, 'Colour that scales',               'video',      15, 'lesson_06_colour.mp4',     1, '2026-07-27 09:00+00', false),
  (2, 'Token layers',                     'video',      13, 'lesson_07_tokens.mp4',     2, '2026-07-27 09:00+00', false),
  (2, 'Contrast in practice',             'reading',    7,  'contrast_notes.md',        3, '2026-07-27 09:00+00', false),
  (2, 'Dark mode without a rewrite',      'video',      16, 'lesson_09_dark.mp4',       4, '2026-07-27 09:00+00', false),
  (2, 'Assignment: build a token sheet',  'assignment', 0,  'brief_tokens.pdf',         5, '2026-07-27 09:00+00', false),

  (3, 'A type scale you can defend',      'video',      12, 'lesson_11_scale.mp4',      1, '2026-08-03 09:00+00', false),
  (3, 'Grids and rhythm',                 'video',      18, 'lesson_03_grids.mp4',      2, '2026-08-03 09:00+00', false),
  (3, 'Spacing tokens',                   'reading',    6,  'spacing_tokens.md',        3, '2026-08-03 09:00+00', false),
  (3, 'Live: critique of your specimens', 'live',       60, 'session_wk3.ics',          4, '2026-08-03 09:00+00', false),
  (3, 'Assignment: type specimen page',   'assignment', 0,  'brief_specimen.pdf',       5, '2026-08-03 09:00+00', false),

  (4, 'Buttons, properly',                'video',      14, 'lesson_16_buttons.mp4',    1, '2026-08-17 09:00+00', false),
  (4, 'Forms and states',                 'video',      19, 'lesson_17_forms.mp4',      2, '2026-08-17 09:00+00', false),
  (4, 'Accessibility notes',              'reading',    8,  'a11y_notes.md',            3, '2026-08-17 09:00+00', false),
  (4, 'Assignment: component spec',       'assignment', 0,  'brief_spec.pdf',           4, '2026-08-17 09:00+00', false),

  (5, 'Docs that get read',               'video',      11, 'lesson_20_docs.mp4',       1, '2026-08-31 09:00+00', false),
  (5, 'Handoff checklist',                'reading',    5,  'handoff.md',               2, '2026-08-31 09:00+00', false),
  (5, 'Final exam',                       'exam',       45, 'exam_final.json',          3, '2026-08-31 09:00+00', false);

INSERT INTO cohorts (course_id, name, starts_on, ends_on, capacity, status) VALUES
  (1, 'Cohort 03 · summer', '2026-07-20', '2026-09-11', 30, 'active'),
  (4, 'Cohort 01 · autumn', '2026-09-07', '2026-10-16', 30, 'upcoming');

-- Enrolment and money --------------------------------------------------------

-- All thirty students are on the cohort. Rosa (student 1) is the demo account.
INSERT INTO enrollments (student_id, course_id, cohort_id, status, progress_pct, enrolled_at)
SELECT s.id, 1, 1, 'active',
       (ARRAY[50,86,73,68,55,91,50,45,77,41,82,64,36,59,27,73,50,68,45,86,32,59,55,77,41,64,50,91,36,68])[s.id],
       '2026-07-18 12:00+00'
FROM students s;

-- Rosa also owns the self-paced typography course.
INSERT INTO enrollments (student_id, course_id, cohort_id, status, progress_pct, enrolled_at)
VALUES (1, 2, NULL, 'active', 33, '2026-03-14 10:00+00');

INSERT INTO orders (number, student_id, course_id, amount, status, placed_at) VALUES
  ('YA-2041', 1, 1, 180.00, 'paid', '2026-07-20 09:14+00'),
  ('YA-1904', 1, 2,  95.00, 'paid', '2026-03-14 10:02+00'),
  ('YA-2038', 2, 1, 180.00, 'paid', '2026-07-19 16:40+00'),
  ('YA-2039', 3, 1, 180.00, 'paid', '2026-07-19 18:05+00'),
  ('YA-2040', 4, 1, 180.00, 'paid', '2026-07-20 08:51+00');

-- Rosa is eleven of twenty-two lessons in — halfway, mid-cohort.
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, seconds, completed_at)
SELECT 1, l.id, true, l.duration_min * 60, '2026-08-02 20:00+00'
FROM lessons l WHERE l.id <= 11;

-- Graded work ----------------------------------------------------------------

INSERT INTO assignments (lesson_id, title, instructions, due_at, points) VALUES
  (10, 'Build a token sheet',
   'Take the greys from your audit and reduce them to a set you can name. Three layers: primitive, semantic, component. Hand in the sheet and a one-paragraph note on what you cut and why.',
   '2026-08-02 23:59+00', 20),
  (15, 'Type specimen page',
   'Build a specimen page from the scale we set in week 2. Every size needs a written job — if you cannot say what it is for, it does not belong on the page.',
   '2026-08-07 23:59+00', 20),
  (19, 'Component spec',
   'Pick one component and specify it properly: every state, the content rules, the edge cases, and the accessibility behaviour.',
   '2026-08-23 23:59+00', 25);

-- Three graded, four waiting. The ungraded rows are the demo's grading queue.
INSERT INTO submissions (assignment_id, enrollment_id, body, attachment, submitted_at, score, feedback, graded_at, graded_by) VALUES
  (1, 1,
   'Three layers as asked. I stripped 27 greys down to 6 and named each one after the job it does rather than the value.',
   'tokens_marchetti.json', '2026-08-01 19:22+00', 17.00,
   'Good reduction and the naming is honest. The two mid-greys still overlap in practice — pick one and delete the other before week 4.',
   '2026-08-02 11:05+00', 1),
  (1, 5,
   'Late, sorry — work got loud. Primitive, semantic and component layers, with the dark mode aliases mapped in the semantic layer as you suggested.

I stripped 27 greys down to 6. It hurt and then it didn''t.',
   'tokens_ahlgren.json', '2026-08-04 22:41+00', NULL, '', NULL, NULL),
  (2, 3,
   'Five sizes, all from the 1.25 scale. I wrote the job of each one underneath, which was harder than setting the type.

The caption is the one I''m least sure about — it only exists for table rows, and I can''t tell if that''s a real need or me protecting a decision I already made.',
   'specimen_lindqvist.pdf', '2026-08-05 08:10+00', NULL, '', NULL, NULL),
  (2, 4,
   'I built the scale twice: once on 1.2 and once on 1.333, then set the same paragraph in both. The 1.2 version is calmer and I think that suits a dashboard.

What I couldn''t solve is the display size on mobile — it wraps to three lines and looks silly.',
   'specimen_raman.pdf', '2026-08-05 05:30+00', NULL, '', NULL, NULL),
  (2, 2,
   'Six sizes. I killed the display size entirely — nothing on a dashboard needs 48px.',
   'specimen_nwosu.pdf', '2026-08-04 17:12+00', 19.00,
   'Bold call on the display size and I agree with it. Your caption rule is the clearest in the cohort.',
   '2026-08-05 09:40+00', 1),
  (2, 6,
   'Scale on 1.25, with a written rule per size and a phone override at 600px.',
   'specimen_obi.pdf', '2026-08-04 12:03+00', 18.00,
   'The phone override is exactly the move most people skip. Tighten the two largest steps — they collide.',
   '2026-08-05 10:15+00', 1);

-- Exams ----------------------------------------------------------------------

INSERT INTO exams (course_id, cohort_id, title, opens_at, closes_at, duration_min, attempts_allowed, pass_score)
VALUES (1, 1, 'Final exam', '2026-08-31 09:00+00', '2026-09-11 23:59+00', 45, 2, 70);

INSERT INTO exam_questions (exam_id, prompt, kind, section, options, answer, points, position) VALUES
  (1, 'A design token is best described as…', 'single', 'Foundations',
   '["A hex value stored in a variable","A named decision that can change in one place","A component with no logic","A Figma style, exported"]'::jsonb,
   '1'::jsonb, 1, 1),
  (1, 'Which of these belong in a component spec? Choose all that apply.', 'multi', 'Components',
   '["Every state, including empty and error","The exact pixel width","Content rules and edge cases","Accessibility behaviour","A list of who has used it"]'::jsonb,
   '[0,2,3]'::jsonb, 1, 2),
  (1, 'What contrast ratio does WCAG AA ask for on body text?', 'short', 'Type and spacing',
   NULL, '["4.5:1","4.5","4.5 : 1"]'::jsonb, 1, 3),
  (1, 'Your audit turns up 27 shades of grey. What is the first move?', 'single', 'Foundations',
   '["Delete 26 of them and see who shouts","Group them by the job they do, then name the jobs","Pick the most used one as the new default","Ask engineering which ones ship today"]'::jsonb,
   '1'::jsonb, 1, 4),
  (1, 'Which changes are safe to make inside the token layer alone?', 'multi', 'Colour and tokens',
   '["Swapping the value behind surface-2","Re-mapping the dark mode aliases","Changing a button''s padding","Adding a new semantic role","Renaming a component prop"]'::jsonb,
   '[0,1,3]'::jsonb, 1, 5),
  (1, 'Name the token layer that maps raw values to roles.', 'short', 'Colour and tokens',
   NULL, '["semantic","semantic layer","semantic tokens"]'::jsonb, 1, 6),
  (1, 'Which button state gets forgotten most often?', 'single', 'Components',
   '["Hover","Focus-visible","Disabled","Loading"]'::jsonb, '1'::jsonb, 1, 7),
  -- No answer key: an essay is always graded by a human.
  (1, 'A team wants to skip the documentation to ship faster. Write the case you would make to them.',
   'essay', 'Essay', NULL, NULL, 10, 8);

-- One submitted attempt whose essay is still with the instructor.
INSERT INTO exam_attempts (exam_id, enrollment_id, started_at, submitted_at, answers, score, status) VALUES
  (1, 6, '2026-08-05 09:00+00', '2026-08-05 09:38+00',
   '{"1":1,"2":[0,2,3],"3":"4.5:1","4":1,"5":[0,1,3],"6":"semantic","7":1,"8":"Skipping documentation is borrowing time at a terrible rate."}'::jsonb,
   NULL, 'submitted');

-- Class communication --------------------------------------------------------

INSERT INTO announcements (cohort_id, instructor_id, title, body, pinned, created_at) VALUES
  (1, 1, 'Week 3 is open',
   'Grids and rhythm is up, and the specimen brief is attached to lesson 15. Bring something rough on Thursday — rough is the point. If you are behind on week 2, do the token sheet first; everything this week leans on it.',
   true, '2026-08-03 09:12+00'),
  (1, 1, 'Office hours move to Thursday',
   'From this week our live session sits at 18:00 CET on Thursdays so the folks in Lagos and São Paulo can make it. Recordings still go up the same evening.',
   false, '2026-07-31 17:40+00');

-- Six lesson questions; two are still unanswered, which is the Q&A inbox.
INSERT INTO comments (lesson_id, enrollment_id, instructor_id, author_kind, body, parent_id, answered, created_at) VALUES
  (12, 3,  NULL, 'student',
   'When you say the baseline grid is a suggestion — at what point does breaking it stop being a choice and start being a mess?',
   NULL, false, '2026-08-05 08:20+00'),
  (13, 4,  NULL, 'student',
   'Our engineers want spacing in a 4px scale, but the design file is on 8. Do I hand over both, or pick a fight?',
   NULL, false, '2026-08-05 05:10+00'),
  (11, 1,  NULL, 'student',
   'I have a 13px caption that only exists because a table needed it. Is that a real size or am I fooling myself?',
   NULL, true, '2026-08-04 21:04+00'),
  (9,  5,  NULL, 'student',
   'Do you keep the same accent hue in dark mode, or lighten it? Mine looks muddy on the dark surface.',
   NULL, true, '2026-08-03 14:30+00'),
  (7,  6,  NULL, 'student',
   'How many token layers is too many? I''ve got primitive, semantic and component and it already feels like a lot.',
   NULL, true, '2026-08-01 11:15+00'),
  (2,  7,  NULL, 'student',
   'My audit spreadsheet has 340 rows and I''ve lost the will to live. How do you know when the audit is done?',
   NULL, true, '2026-07-29 16:45+00');

INSERT INTO comments (lesson_id, enrollment_id, instructor_id, author_kind, body, parent_id, answered, created_at) VALUES
  (11, NULL, 1, 'instructor',
   'It''s real if the table is real. Give it a name that says the job — caption, or table-dense — and write down where it''s allowed. A size with a job is a decision; a size without one is debris.',
   3, true, '2026-08-05 08:12+00'),
  (9,  NULL, 1, 'instructor',
   'Lighten it, always. Same hue, more light. Then check contrast against the text sitting on top, not against the background.',
   4, true, '2026-08-03 18:02+00'),
  (7,  NULL, 2, 'instructor',
   'Three is the sweet spot and you have exactly three. Add a fourth only when you can name the thing it protects you from.',
   5, true, '2026-08-01 19:20+00'),
  (2,  NULL, 1, 'instructor',
   'When new screens stop producing new rows. That usually happens far earlier than people expect — around screen fifteen. Stop there and start grouping.',
   6, true, '2026-07-29 20:11+00');

INSERT INTO live_sessions (cohort_id, title, starts_at, duration_min, join_url, recording_url, status) VALUES
  (1, 'Critique: your type specimens', '2026-08-06 18:00+00', 60, 'https://example.invalid/session/wk3', '', 'scheduled'),
  (1, 'Colour and tokens: open questions', '2026-07-30 18:00+00', 60, '', 'recording_wk2.mp4', 'ended'),
  (1, 'Welcome and the audit',            '2026-07-23 18:00+00', 60, '', 'recording_wk1.mp4', 'ended');

COMMIT;
