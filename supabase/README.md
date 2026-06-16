# Supabase Migrations — RS Web Digital

Ported and consolidated from the RS-Tool-Ticketing-System.  
All migrations are idempotent (`IF NOT EXISTS`, `ON CONFLICT`) and use proper PostgreSQL types (TIMESTAMPTZ, JSONB, etc.).

## Run order

Apply in the Supabase SQL Editor or via the Supabase CLI (`supabase db push`):

| File | Tables |
|------|--------|
| `migrations/20260617000001_core_hr.sql` | `users`, `timesheets`, `weekly_reports`, `attendance` |
| `migrations/20260617000002_project_management.sql` | `projects`, `project_states`, `cycles`, `work_items`, `work_item_assignees`, `work_item_comments`, `labels`, `work_item_labels`, `project_members`, `work_item_activity`, `saved_views` |
| `migrations/20260617000003_ats_recruiting.sql` | `candidates`, `candidate_history`, `positions` + `mint_application_code()` |
| `migrations/20260617000004_onboarding.sql` | `onboarders`, `onboarder_references`, `onboarder_employment_verifications`, `onboarder_documents`, `onboarder_history` |
| `migrations/20260617000005_lms.sql` | `lms_courses`, `lms_lessons`, `lms_lesson_completions`, `lms_quizzes`, `lms_quiz_questions`, `lms_quiz_attempts`, `lms_certificates`, `lms_course_assignments`, `lms_lesson_comments` |
| `migrations/20260617000006_sales_crm.sql` | `leads` |
| `migrations/20260617000007_overtime.sql` | `overtime_requests` |
| `migrations/20260617000008_ai_reporting.sql` | `briefings`, `status_drafts`, `content_drafts` |
| `migrations/20260617000009_presence.sql` | `presence_pings` |
| `seed.sql` | Demo users (all passwords = `Demo@1234`) |

## Notes

- `migration 004` inserts a row into `storage.buckets` for `onboarder-docs` — this requires the Supabase Storage extension to be enabled.
- The `candidates.status` field uses the 11-stage SOP model (not the old 6-stage model).
- `work_item_assignees` does NOT have a `member_key` / `plane_member_id` column — those were removed in the ticketing system's `drop-plane-member-id` migration and were never included here.
