-- Migration 005: Learning Management System (LMS)
-- lms_courses, lms_lessons, lms_lesson_completions,
-- lms_quizzes, lms_quiz_questions, lms_quiz_attempts,
-- lms_certificates, lms_course_assignments, lms_lesson_comments
-- Source: drizzle/0012_lms.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_courses
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_courses (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  scope           TEXT NOT NULL,                    -- foundation | department | intern
  department      TEXT,                             -- required when scope = 'department'
  cover_image_url TEXT,
  is_published    INTEGER NOT NULL DEFAULT 0,
  enforcement     TEXT NOT NULL DEFAULT 'soft',     -- soft | hard
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lms_courses_scope_chk       CHECK (scope IN ('foundation', 'department', 'intern')),
  CONSTRAINT lms_courses_dept_chk        CHECK (scope <> 'department' OR department IS NOT NULL),
  CONSTRAINT lms_courses_enforcement_chk CHECK (enforcement IN ('soft', 'hard'))
);

CREATE INDEX IF NOT EXISTS lms_courses_scope_dept_pub_idx
  ON lms_courses(scope, department, is_published);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_lessons
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_lessons (
  id                     SERIAL PRIMARY KEY,
  course_id              INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  lesson_type            TEXT NOT NULL DEFAULT 'text',   -- text | video | mixed
  body_md                TEXT,
  video_source           TEXT,                           -- youtube | loom | vimeo | upload
  video_url              TEXT,
  video_duration_seconds INTEGER,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lms_lessons_type_chk  CHECK (lesson_type IN ('text', 'video', 'mixed')),
  CONSTRAINT lms_lessons_video_chk CHECK (lesson_type = 'text' OR video_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS lms_lessons_course_order_idx ON lms_lessons(course_id, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_lesson_completions  (Phase 1 — track progress)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_lesson_completions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    INTEGER NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lms_lesson_completions_user_lesson_unique UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lms_lesson_completions_user_idx ON lms_lesson_completions(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_quizzes  (Phase 2 — one quiz per lesson, optional)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_quizzes (
  id           SERIAL PRIMARY KEY,
  lesson_id    INTEGER NOT NULL UNIQUE REFERENCES lms_lessons(id) ON DELETE CASCADE,
  pass_score   INTEGER NOT NULL DEFAULT 70,   -- percentage
  max_attempts INTEGER,                       -- NULL = unlimited
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_quiz_questions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_quiz_questions (
  id            SERIAL PRIMARY KEY,
  quiz_id       INTEGER NOT NULL REFERENCES lms_quizzes(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  question_type TEXT NOT NULL,   -- multiple_choice | true_false
  choices       JSONB NOT NULL,  -- [{ key: string, text: string }]
  correct_keys  JSONB NOT NULL,  -- [string]  (array to support multi-select)
  sort_order    INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT lms_quiz_questions_type_chk CHECK (question_type IN ('multiple_choice', 'true_false'))
);

CREATE INDEX IF NOT EXISTS lms_quiz_questions_quiz_order_idx
  ON lms_quiz_questions(quiz_id, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_quiz_attempts
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_quiz_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id      INTEGER NOT NULL REFERENCES lms_quizzes(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL,  -- { [question_id]: string[] }
  score        INTEGER NOT NULL,
  passed       INTEGER NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lms_quiz_attempts_user_quiz_idx
  ON lms_quiz_attempts(user_id, quiz_id, submitted_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_certificates  (Phase 2 — issued on course completion)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS lms_certificate_serial START 1;

CREATE OR REPLACE FUNCTION nextval_lms_certificate_serial()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT nextval('lms_certificate_serial') $$;

CREATE TABLE IF NOT EXISTS lms_certificates (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_path  TEXT,
  serial    TEXT NOT NULL UNIQUE,
  CONSTRAINT lms_certificates_user_course_unique UNIQUE (user_id, course_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_course_assignments  (Phase 3 — mandatory course assignments)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_course_assignments (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        INTEGER NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  due_at           TIMESTAMPTZ,
  assigned_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reminded_at TIMESTAMPTZ,
  CONSTRAINT lms_course_assignments_user_course_unique UNIQUE (user_id, course_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- lms_lesson_comments  (Phase 3 — threaded discussion per lesson)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lms_lesson_comments (
  id         SERIAL PRIMARY KEY,
  lesson_id  INTEGER NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  parent_id  INTEGER,              -- NULL = top-level, non-NULL = reply
  pinned     INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,          -- soft-delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lms_lesson_comments_lesson_idx
  ON lms_lesson_comments(lesson_id, created_at);
