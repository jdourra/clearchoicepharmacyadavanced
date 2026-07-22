-- Clinical prescriptions generated on intake approval (Dropbox Sign / printable Rx)
-- Run: psql $DATABASE_URL -f scripts/032_clinical_prescriptions.sql

CREATE TABLE IF NOT EXISTS clinical_prescriptions (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  strength TEXT,
  directions TEXT NOT NULL,
  quantity TEXT NOT NULL,
  refills INTEGER NOT NULL DEFAULT 0,
  patient_name TEXT NOT NULL,
  patient_dob TEXT,
  patient_address TEXT,
  patient_city TEXT,
  patient_state TEXT,
  patient_zip TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  prescriber_name TEXT NOT NULL,
  prescriber_credentials TEXT,
  prescriber_license TEXT,
  prescriber_npi TEXT,
  pharmacy_name TEXT NOT NULL DEFAULT 'Clear Choice Pharmacy',
  pharmacy_address TEXT NOT NULL DEFAULT 'Novi, MI',
  status TEXT NOT NULL DEFAULT 'awaiting_signature',
  dropbox_signature_request_id TEXT,
  unsigned_pdf_key TEXT,
  signed_pdf_key TEXT,
  clinician_esign_name TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_prescriptions_intake
  ON clinical_prescriptions (service_type, intake_id);

CREATE INDEX IF NOT EXISTS idx_clinical_prescriptions_dropbox
  ON clinical_prescriptions (dropbox_signature_request_id)
  WHERE dropbox_signature_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_prescriptions_status
  ON clinical_prescriptions (status, created_at DESC);
