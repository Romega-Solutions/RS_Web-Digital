-- Migration 002: Project Management
-- projects, project_states, cycles, work_items, work_item_assignees,
-- work_item_comments, labels, work_item_labels, project_members,
-- work_item_activity, saved_views
-- Consolidated final state from drizzle/0007–0008, docs/migrations/add-pm-phase1.sql,
-- add-pm-phases-2-4.sql, add-project-team.sql, drop-plane-member-id.sql

-- Depends on: 20260617000001_core_hr.sql (users)

-- ─────────────────────────────────────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  identifier    TEXT NOT NULL UNIQUE,               -- e.g. "RS-TECH"
  name          TEXT NOT NULL,
  description   TEXT,
  network       INTEGER NOT NULL DEFAULT 2,         -- 1=private 2=internal
  next_sequence INTEGER NOT NULL DEFAULT 1,
  archived      INTEGER NOT NULL DEFAULT 0,
  team          TEXT,                               -- canonical org-chart dept
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_team_idx ON projects(team);

-- ─────────────────────────────────────────────────────────────────────────────
-- project_states  (workflow states per project)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_states (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  "group"    TEXT NOT NULL,       -- backlog | started | unstarted | completed | cancelled
  color      TEXT NOT NULL DEFAULT '#6b7280',
  sequence   INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────────────────
-- cycles  (sprints — Phase 3)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cycles (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  start_date TEXT NOT NULL,      -- YYYY-MM-DD
  end_date   TEXT NOT NULL,      -- YYYY-MM-DD
  archived   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cycles_project_idx ON cycles(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- work_items  (tasks / tickets)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_items (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sequence_id  INTEGER NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  priority     TEXT NOT NULL DEFAULT 'none',  -- none | low | medium | high | urgent
  state_id     INTEGER REFERENCES project_states(id) ON DELETE SET NULL,
  target_date  TEXT,                          -- YYYY-MM-DD
  completed_at TIMESTAMPTZ,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  archived     INTEGER NOT NULL DEFAULT 0,
  cycle_id     INTEGER REFERENCES cycles(id) ON DELETE SET NULL,
  parent_id    INTEGER REFERENCES work_items(id) ON DELETE CASCADE,  -- sub-issues (Phase 4)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, sequence_id)
);

CREATE INDEX IF NOT EXISTS work_items_cycle_idx  ON work_items(cycle_id);
CREATE INDEX IF NOT EXISTS work_items_parent_idx ON work_items(parent_id);
CREATE INDEX IF NOT EXISTS work_items_state_idx  ON work_items(state_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- work_item_assignees  (many-to-many: items ↔ users)
-- Note: plane_member_id / member_key columns were removed (drop-plane-member-id migration)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_item_assignees (
  id           SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS work_item_assignees_user_idx ON work_item_assignees(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- work_item_comments
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_item_comments (
  id           SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  author_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_item_comments_work_item_idx ON work_item_comments(work_item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- labels  (per-project tags)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  UNIQUE (project_id, name)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- work_item_labels  (many-to-many: items ↔ labels)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_item_labels (
  id           SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  label_id     INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  UNIQUE (work_item_id, label_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- project_members  (controls assignee picker + project visibility)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_members (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member',   -- lead | member | viewer
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- work_item_activity  (audit log surfaced in task detail drawer)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_item_activity (
  id           SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  actor_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action       TEXT NOT NULL,   -- created | edited | state_changed | assigned | unassigned | commented | archived
  from_value   TEXT,
  to_value     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_item_activity_work_item_idx ON work_item_activity(work_item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- saved_views  (per-user filter presets — Phase 4)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_views (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,  -- NULL = global (my-tasks)
  name       TEXT NOT NULL,
  filters    JSONB NOT NULL,   -- { assignee?, label?, priority?, dueSoon?, cycle? }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_views_user_idx    ON saved_views(user_id);
CREATE INDEX IF NOT EXISTS saved_views_project_idx ON saved_views(project_id);
