-- Migration 003: ATS / Recruiting
-- candidates, candidate_history, positions
-- Consolidated from: docs/migrations/add-candidates-table.sql,
--   add-ats-history-and-positions.sql, add-resume-fields-to-candidates.sql,
--   add-candidates-public-talent.sql, add-candidates-talent-consent.sql,
--   add-recruitment-agent-fields.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- Sequence + function for minting APP-YYYY-NNNN codes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS application_code_seq START WITH 1;

CREATE OR REPLACE FUNCTION mint_application_code() RETURNS TEXT AS $$
DECLARE
  yr INTEGER;
  n  BIGINT;
BEGIN
  yr := EXTRACT(YEAR FROM NOW())::INTEGER;
  n  := nextval('application_code_seq');
  RETURN 'APP-' || yr || '-' || LPAD(n::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- candidates  (lightweight ATS — single-table model)
-- ─────────────────────────────────────────────────────────────────────────────
-- SOP status stages (11-stage model):
--   pending_response | screened | practical_exam | interview_client |
--   interview_romega | bg_check | reference_check | offered | hired |
--   failed | withdrew
CREATE TABLE IF NOT EXISTS candidates (
  id           SERIAL PRIMARY KEY,
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  position     TEXT,        -- role applied for, e.g. "Frontend Developer"
  source       TEXT,        -- referral | linkedin | job_board | direct | manual
  status       TEXT NOT NULL DEFAULT 'pending_response',
  rating       INTEGER,     -- 1–5, nullable
  notes        TEXT,
  linkedin_url TEXT,
  resume_url   TEXT,
  assigned_to  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- n8n Resume Extractor fields
  location         TEXT,
  website          TEXT,
  summary          TEXT,
  skills           JSONB,   -- string[]
  experience       JSONB,   -- {company, title, start_date, end_date, description}[]
  education        JSONB,   -- {institution, degree, field, graduation_year}[]
  certifications   JSONB,   -- string[]
  languages        JSONB,   -- string[]
  parsed_at        TIMESTAMPTZ,

  -- AI Recruitment Agent fields
  application_code    TEXT UNIQUE,
  last_email_template TEXT,
  last_email_sent_at  TIMESTAMPTZ,

  -- Public Talent Pool
  is_public_talent BOOLEAN NOT NULL DEFAULT FALSE,

  -- GDPR consent gate for talent pool publishing
  consent_status       TEXT NOT NULL DEFAULT 'none',  -- none | requested | agreed | revoked
  consent_token        TEXT,          -- unguessable lookup key for confirm/revoke links
  consent_requested_at TIMESTAMPTZ,
  consent_agreed_at    TIMESTAMPTZ,
  consent_agreed_ip    TEXT,
  consent_method       TEXT,          -- link | manual

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT candidates_rating_chk CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
);

CREATE INDEX IF NOT EXISTS candidates_status_idx        ON candidates(status);
CREATE INDEX IF NOT EXISTS candidates_position_idx      ON candidates(position);
CREATE INDEX IF NOT EXISTS candidates_assigned_to_idx   ON candidates(assigned_to);
CREATE INDEX IF NOT EXISTS candidates_created_by_idx    ON candidates(created_by);
CREATE INDEX IF NOT EXISTS candidates_public_talent_idx ON candidates(is_public_talent) WHERE is_public_talent = TRUE;
CREATE INDEX IF NOT EXISTS candidates_status_email_idx  ON candidates(status, last_email_template);
CREATE UNIQUE INDEX IF NOT EXISTS candidates_consent_token_idx ON candidates(consent_token) WHERE consent_token IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- candidate_history  (append-only audit log)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_history (
  id           SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name    TEXT,        -- snapshot at write time (survives renames / deletes)
  field        TEXT NOT NULL,
  old_value    TEXT,
  new_value    TEXT,
  summary      TEXT NOT NULL,   -- e.g. "Status changed from 'pending_response' to 'screened'"
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS candidate_history_candidate_idx
  ON candidate_history(candidate_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- positions  (open roles tracked in ATS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions (
  id              SERIAL PRIMARY KEY,
  job_title       TEXT NOT NULL,
  client          TEXT,
  location        TEXT,
  job_description TEXT,
  is_open         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS positions_open_idx       ON positions(is_open);
CREATE INDEX IF NOT EXISTS positions_created_by_idx ON positions(created_by);
