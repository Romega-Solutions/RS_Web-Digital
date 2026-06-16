-- Migration 001: Core HR tables
-- users, timesheets, weekly_reports, attendance
-- Consolidated final state from RS-Tool-Ticketing-System drizzle/0000–0006, 0009–0011, 0014

-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                        SERIAL PRIMARY KEY,
  username                  TEXT NOT NULL UNIQUE,
  password_hash             TEXT NOT NULL,
  name                      TEXT NOT NULL,
  email                     TEXT NOT NULL UNIQUE,
  role                      TEXT NOT NULL,           -- ceo | lead | ic
  team                      TEXT,                    -- canonical org-chart dept (see normalize-teams migration)
  job_title                 TEXT,
  member_code               TEXT,                    -- short display code, e.g. "KG"
  hourly_rate_usd           NUMERIC(10,2),
  is_active                 INTEGER NOT NULL DEFAULT 1,
  is_onboarding             INTEGER NOT NULL DEFAULT 0,
  reminder_enabled          INTEGER NOT NULL DEFAULT 1,
  reminder_interval_minutes INTEGER NOT NULL DEFAULT 120,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- timesheets  (clock-in / clock-out with overtime tracking)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timesheets (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clocked_in_at          TIMESTAMPTZ NOT NULL,
  clocked_out_at         TIMESTAMPTZ,
  duration_seconds       INTEGER,
  date                   TEXT NOT NULL,              -- YYYY-MM-DD (PHT date)
  notes                  TEXT,
  is_overtime            INTEGER NOT NULL DEFAULT 0,
  overtime_seconds       INTEGER,
  overtime_consent_until TIMESTAMPTZ,               -- consent expiry for auto-clock-out grace window
  edited_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  edited_at              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS timesheets_user_date_idx ON timesheets(user_id, date);

-- ─────────────────────────────────────────────────────────────────────────────
-- weekly_reports  (PM weekly status updates)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reports (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start         TEXT NOT NULL,                  -- Monday YYYY-MM-DD (PHT)
  client_engagements TEXT,
  risks              TEXT,
  ideas              TEXT,
  submitted_at       TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- attendance  (daily presence check-ins per week)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start       TEXT NOT NULL,                    -- Monday YYYY-MM-DD (PHT)
  monday_status    TEXT,
  tuesday_status   TEXT,
  wednesday_status TEXT,
  thursday_status  TEXT,
  friday_status    TEXT,
  saturday_status  TEXT,
  sunday_status    TEXT,
  notes            TEXT,
  submitted_at     TIMESTAMPTZ,
  edited_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  edited_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);
