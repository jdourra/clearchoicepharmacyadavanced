-- Link clinical intakes to patient profiles and persist payment status.
-- Run against Neon: psql $DATABASE_URL -f scripts/034_intake_patient_and_payment.sql

-- ── patient_id + payment_status on payment-bearing intake tables ─────────────

ALTER TABLE weight_loss_intake
  ADD COLUMN IF NOT EXISTS patient_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE patient_intake
  ADD COLUMN IF NOT EXISTS patient_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE trt_intake
  ADD COLUMN IF NOT EXISTS patient_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE rejuvenation_vial_intakes
  ADD COLUMN IF NOT EXISTS patient_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE iv_booking_requests
  ADD COLUMN IF NOT EXISTS patient_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE specialty_intake
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

ALTER TABLE prescription_telemedicine_intake
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_patient_id ON weight_loss_intake (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_intake_patient_id ON patient_intake (patient_id);
CREATE INDEX IF NOT EXISTS idx_trt_intake_patient_id ON trt_intake (patient_id);
CREATE INDEX IF NOT EXISTS idx_rejuvenation_vial_intakes_patient_id ON rejuvenation_vial_intakes (patient_id);
CREATE INDEX IF NOT EXISTS idx_iv_booking_requests_patient_id ON iv_booking_requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_email_lower ON weight_loss_intake (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_patient_intake_email_lower ON patient_intake (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_trt_intake_email_lower ON trt_intake (LOWER(email));

-- ── Backfill payment_status from existing status + stripe PI ─────────────────

UPDATE weight_loss_intake SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

UPDATE patient_intake SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

UPDATE trt_intake SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

UPDATE rejuvenation_vial_intakes SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

UPDATE iv_booking_requests SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

UPDATE specialty_intake SET payment_status = COALESCE(payment_status, 'none')
WHERE payment_status IS NULL;

UPDATE prescription_telemedicine_intake SET payment_status = CASE
  WHEN stripe_payment_intent_id IS NULL OR stripe_payment_intent_id = '' THEN 'none'
  WHEN status IN ('rx_at_pharmacy', 'preparing', 'shipped', 'completed') THEN 'captured'
  WHEN status IN ('provider_denied', 'cancelled') THEN 'released'
  ELSE 'authorized'
END
WHERE payment_status IS NULL;

-- ── Create missing patient profiles from intake buyers (unusable random pw) ──
-- Patients can set a real password later via account recovery / signup with same email.

WITH intake_people AS (
  SELECT DISTINCT ON (LOWER(email))
    LOWER(email) AS email,
    first_name,
    last_name,
    phone,
    date_of_birth,
    address,
    city,
    state,
    zip_code,
    created_at
  FROM (
    SELECT email, first_name, last_name, phone, date_of_birth, address, city, state, zip_code, created_at
    FROM weight_loss_intake
    UNION ALL
    SELECT email, first_name, last_name, phone, date_of_birth, address, city, state, zip_code, created_at
    FROM patient_intake
    UNION ALL
    SELECT email, first_name, last_name, phone, date_of_birth, address, city, state, zip_code, created_at
    FROM trt_intake
    UNION ALL
    SELECT email, first_name, last_name, phone, NULL::text AS date_of_birth,
           shipping_address AS address, shipping_city AS city, shipping_state AS state, shipping_zip AS zip_code, created_at
    FROM rejuvenation_vial_intakes
    UNION ALL
    SELECT email, first_name, last_name, phone, NULL::text AS date_of_birth,
           service_address AS address, service_city AS city, service_state AS state, service_zip AS zip_code, created_at
    FROM iv_booking_requests
  ) all_intakes
  WHERE email IS NOT NULL AND TRIM(email) <> ''
  ORDER BY LOWER(email), created_at ASC
)
INSERT INTO patients (email, password_hash, first_name, last_name, phone, date_of_birth, address_line1, city, state, zip_code)
SELECT
  i.email,
  crypt(encode(gen_random_bytes(24), 'hex'), gen_salt('bf')),
  COALESCE(NULLIF(TRIM(i.first_name), ''), 'Patient'),
  COALESCE(NULLIF(TRIM(i.last_name), ''), 'Customer'),
  i.phone,
  CASE
    WHEN NULLIF(TRIM(i.date_of_birth), '') IS NULL THEN NULL
    WHEN TRIM(i.date_of_birth) ~ '^\d{4}-\d{2}-\d{2}' THEN TRIM(i.date_of_birth)::date
    ELSE NULL
  END,
  i.address,
  i.city,
  i.state,
  i.zip_code
FROM intake_people i
WHERE NOT EXISTS (
  SELECT 1 FROM patients p WHERE LOWER(p.email) = i.email
);

-- Link intakes to patients by email

UPDATE weight_loss_intake w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE patient_intake w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE trt_intake w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE rejuvenation_vial_intakes w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE iv_booking_requests w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE specialty_intake w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);

UPDATE prescription_telemedicine_intake w
SET patient_id = p.id::text
FROM patients p
WHERE w.patient_id IS NULL
  AND LOWER(w.email) = LOWER(p.email);
