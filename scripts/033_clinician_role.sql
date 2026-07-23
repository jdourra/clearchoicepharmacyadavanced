-- Doctor-only portal: allow clinician role + seed login
-- Paste into Neon SQL Editor.

ALTER TABLE staff_users DROP CONSTRAINT IF EXISTS staff_users_role_check;

ALTER TABLE staff_users
  ADD CONSTRAINT staff_users_role_check
  CHECK (role IN ('admin', 'pharmacist', 'tech', 'clinician', 'doctor'));

-- Prefer columns used by app auth (full_name, is_active).
-- If this INSERT fails, use the alternate block at the bottom.

INSERT INTO staff_users (email, password_hash, role, full_name, is_active)
SELECT
  'doctor@clearchoicepharmacy.com',
  crypt('ChangeMeDoctor1!', gen_salt('bf')),
  'clinician',
  'Dr. Dourra',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM staff_users WHERE lower(email) = 'doctor@clearchoicepharmacy.com'
);

-- Alternate (older schema with first_name / last_name / active):
-- INSERT INTO staff_users (email, password_hash, role, first_name, last_name, active)
-- SELECT 'doctor@clearchoicepharmacy.com', crypt('ChangeMeDoctor1!', gen_salt('bf')),
--        'clinician', 'Dr.', 'Dourra', true
-- WHERE NOT EXISTS (
--   SELECT 1 FROM staff_users WHERE lower(email) = 'doctor@clearchoicepharmacy.com'
-- );
