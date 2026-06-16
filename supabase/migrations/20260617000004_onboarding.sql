-- Migration 004: Internal Onboarding
-- onboarders, onboarder_references, onboarder_employment_verifications,
-- onboarder_documents, onboarder_history
-- Source: docs/migrations/add-onboarders-tables.sql, add-onboarders-sow-reminder.sql

-- Depends on: 20260617000001_core_hr.sql (users)
--             20260617000003_ats_recruiting.sql (candidates)

-- ─────────────────────────────────────────────────────────────────────────────
-- onboarders  (one row per new hire being onboarded)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarders (
  id             SERIAL PRIMARY KEY,

  -- Links to ATS row (if originated there) or created manually
  candidate_id   INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
  user_id        INTEGER REFERENCES users(id)      ON DELETE SET NULL,

  full_name      TEXT NOT NULL,
  personal_email TEXT NOT NULL,
  romega_email   TEXT,
  phone          TEXT,

  onboarder_type    TEXT NOT NULL DEFAULT 'contractor'
                    CHECK (onboarder_type IN ('contractor', 'intern')),
  role_title        TEXT,
  team              TEXT,
  direct_supervisor TEXT,
  chief_of_staff    TEXT,
  onboarding_lead   TEXT,
  hrbp              TEXT,

  status TEXT NOT NULL DEFAULT 'offer_signed'
         CHECK (status IN (
           'offer_signed', 'background_check', 'pre_onboarding', 'day_one',
           'thirty_day', 'ninety_day', 'regularized',
           'failed_probation', 'withdrew'
         )),

  -- SOW tracking
  sow_sent_at          TIMESTAMPTZ,
  sow_signed_at        TIMESTAMPTZ,
  sow_reminder_sent_at TIMESTAMPTZ,  -- dedup guard for daily n8n sweep

  -- Forms / Compliance
  onboarding_form_submitted_at TIMESTAMPTZ,
  w8_uploaded_at               TIMESTAMPTZ,
  wise_details_submitted_at    TIMESTAMPTZ,

  -- Day-1 checklist (pre-allocated for post-MVP)
  teams_installed_at    TIMESTAMPTZ,
  gmail_created_at      TIMESTAMPTZ,
  signature_set_at      TIMESTAMPTZ,
  jibble_invited_at     TIMESTAMPTZ,
  wise_setup_at         TIMESTAMPTZ,
  group_chats_joined_at TIMESTAMPTZ,
  orientation_done_at   TIMESTAMPTZ,

  start_date DATE,
  notes      TEXT,

  -- Email dedup (mirrors candidates.last_email_template / last_email_sent_at)
  last_email_template TEXT,
  last_email_sent_at  TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS onboarders_status_idx       ON onboarders(status);
CREATE INDEX IF NOT EXISTS onboarders_start_date_idx   ON onboarders(start_date);
CREATE INDEX IF NOT EXISTS onboarders_candidate_id_idx ON onboarders(candidate_id);
CREATE INDEX IF NOT EXISTS onboarders_user_id_idx      ON onboarders(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- onboarder_references  (3+ character references per new hire per SOP §3)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarder_references (
  id              SERIAL PRIMARY KEY,
  onboarder_id    INTEGER NOT NULL REFERENCES onboarders(id) ON DELETE CASCADE,

  referee_name    TEXT NOT NULL,
  referee_role    TEXT,
  referee_company TEXT,
  relationship    TEXT,
  dates_worked    TEXT,
  email           TEXT NOT NULL,
  mobile          TEXT,
  best_time       TEXT,

  request_sent_at TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  response_path   TEXT,   -- Supabase Storage path to the PDF reply
  outcome         TEXT CHECK (outcome IN ('positive', 'neutral', 'concerns', 'no_response')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS onboarder_references_onboarder_idx
  ON onboarder_references(onboarder_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- onboarder_employment_verifications  (prior-HR contacts per SOP §4)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarder_employment_verifications (
  id              SERIAL PRIMARY KEY,
  onboarder_id    INTEGER NOT NULL REFERENCES onboarders(id) ON DELETE CASCADE,

  company         TEXT NOT NULL,
  hr_contact_name TEXT,
  hr_email        TEXT NOT NULL,
  hr_phone        TEXT,
  best_time       TEXT,

  request_sent_at TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  response_path   TEXT,
  outcome         TEXT CHECK (outcome IN ('verified', 'partial', 'no_response', 'discrepancy')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS onboarder_employment_verifications_onboarder_idx
  ON onboarder_employment_verifications(onboarder_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- onboarder_documents  (gov IDs, NBI, W-8, contracts, reference PDFs, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarder_documents (
  id           SERIAL PRIMARY KEY,
  onboarder_id INTEGER NOT NULL REFERENCES onboarders(id) ON DELETE CASCADE,

  kind TEXT NOT NULL CHECK (kind IN (
    'sow', 'w8', 'nda', 'contract', 'gov_id', 'nbi',
    'reference_response', 'employment_verification', 'other'
  )),
  label        TEXT,
  storage_path TEXT NOT NULL,   -- Supabase Storage path
  mime_type    TEXT,
  size_bytes   BIGINT,

  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS onboarder_documents_onboarder_idx
  ON onboarder_documents(onboarder_id, uploaded_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- onboarder_history  (append-only audit log, mirrors candidate_history)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarder_history (
  id           SERIAL PRIMARY KEY,
  onboarder_id INTEGER NOT NULL REFERENCES onboarders(id) ON DELETE CASCADE,

  user_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,     -- snapshot at write time
  field     TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  summary   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS onboarder_history_onboarder_idx
  ON onboarder_history(onboarder_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for onboarding documents (private; app uses signed URLs)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarder-docs', 'onboarder-docs', false)
ON CONFLICT (id) DO NOTHING;
