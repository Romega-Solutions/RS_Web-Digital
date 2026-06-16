-- Migration 007: Overtime
-- overtime_requests  (admin-approval queue replacing the old self-consent model)
-- Source: docs/migrations/add-overtime-requests.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- overtime_requests
-- ─────────────────────────────────────────────────────────────────────────────
-- Lifecycle: contractor submits → admin approves/denies
-- An active approval (status='approved', approved_until > NOW()) suspends both
-- the 3h session cap and the 15h weekly cap for the requesting user.
CREATE TABLE IF NOT EXISTS overtime_requests (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start   TEXT NOT NULL,    -- Monday YYYY-MM-DD (target week)
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | denied
  reason       TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  decided_at   TIMESTAMPTZ,
  approved_until TIMESTAMPTZ,

  CONSTRAINT overtime_requests_status_chk CHECK (status IN ('pending', 'approved', 'denied'))
);

CREATE INDEX IF NOT EXISTS overtime_requests_user_idx     ON overtime_requests(user_id);
CREATE INDEX IF NOT EXISTS overtime_requests_status_idx   ON overtime_requests(status);
-- Fast "is there an active approval for this user?" lookup used by cron + clock-in
CREATE INDEX IF NOT EXISTS overtime_requests_approval_idx
  ON overtime_requests(user_id, status, approved_until);
