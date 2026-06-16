-- Migration 008: AI Reporting
-- briefings, status_drafts, content_drafts
-- Source: docs/migrations/add-briefings-table.sql,
--         docs/migrations/add-status-drafts-and-content-drafts.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- briefings  (daily AI-generated narrative + deterministic stats)
-- ─────────────────────────────────────────────────────────────────────────────
-- One row per PHT date. Regenerating upserts in place (date UNIQUE).
CREATE TABLE IF NOT EXISTS briefings (
  id           SERIAL PRIMARY KEY,
  date         TEXT NOT NULL UNIQUE,    -- YYYY-MM-DD (PHT)
  stats        JSONB NOT NULL,          -- deterministic aggregations snapshot
  narrative    TEXT,                    -- LLM-generated text (NULL if generation failed)
  model        TEXT,                    -- e.g. 'llama-3.3-70b-versatile'
  tokens_in    INTEGER,
  tokens_out   INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS briefings_date_idx ON briefings(date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- status_drafts  (weekly PM status update drafts for social / async updates)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS status_drafts (
  id           SERIAL PRIMARY KEY,
  week_start   TEXT NOT NULL UNIQUE,    -- Monday YYYY-MM-DD (PHT)
  stats        JSONB NOT NULL,
  draft        TEXT,                    -- AI-generated PM summary
  model        TEXT,
  tokens_in    INTEGER,
  tokens_out   INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS status_drafts_week_start_idx ON status_drafts(week_start DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- content_drafts  (repurposed content outputs for marketing channels)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_drafts (
  id             SERIAL PRIMARY KEY,
  source_title   TEXT NOT NULL,
  source_type    TEXT NOT NULL,           -- blog | transcript | case-study | other
  source_content TEXT NOT NULL,
  outputs        JSONB NOT NULL,          -- { linkedin, x, newsletter, instagram }
  model          TEXT,
  tokens_in      INTEGER,
  tokens_out     INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS content_drafts_created_at_idx ON content_drafts(created_at DESC);
