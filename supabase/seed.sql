-- Seed: Demo users for local development / staging
-- All passwords = Demo@1234
-- Hash: $2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C
--
-- Run AFTER all migrations. Safe to re-run (ON CONFLICT DO NOTHING).

INSERT INTO users (username, password_hash, name, email, role, team, job_title, is_active) VALUES

  -- CEO / Admin
  ('ceo',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Ken Garcia', 'ken@romega-solutions.com', 'ceo', NULL, 'Chief Executive Officer', 1),

  -- IC Leads
  ('lead_tech',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Mark Siazon', 'mark@romega-solutions.com', 'lead', 'AI & Technology', 'Tech Lead', 1),

  ('lead_design',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Anna Reyes', 'anna@romega-solutions.com', 'lead', 'Design', 'Design Lead', 1),

  -- Tech ICs
  ('ic_john',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'John Santos', 'john@romega-solutions.com', 'ic', 'AI & Technology', 'Software Engineer', 1),

  ('ic_miguel',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Miguel Cruz', 'miguel@romega-solutions.com', 'ic', 'AI & Technology', 'Frontend Developer', 1),

  ('ic_sofia',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Sofia Lim', 'sofia@romega-solutions.com', 'ic', 'AI & Technology', 'QA Engineer', 1),

  -- Design ICs
  ('ic_trisha',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Trisha Mendoza', 'trisha@romega-solutions.com', 'ic', 'Design', 'UI/UX Designer', 1),

  ('ic_rafael',
   '$2b$10$DTOKt60D2dzQF8MPAEfrP.YVSeDIlpB3/1LeAnuYjKMIocxLgxq0C',
   'Rafael Aquino', 'rafael@romega-solutions.com', 'ic', 'Design', 'Graphic Designer', 1)

ON CONFLICT (username) DO NOTHING;
