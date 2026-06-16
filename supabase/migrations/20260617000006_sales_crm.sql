-- Migration 006: Sales CRM
-- leads  (lightweight in-app CRM for /sales/leads)
-- Source: docs/migrations/add-leads-table.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- leads
-- ─────────────────────────────────────────────────────────────────────────────
-- Stage values: new | contacted | qualified | proposal | won | lost
CREATE TABLE IF NOT EXISTS leads (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  company     TEXT,
  stage       TEXT NOT NULL DEFAULT 'new',
  value       INTEGER NOT NULL DEFAULT 0,  -- deal value in USD
  notes       TEXT,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_stage_idx       ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
