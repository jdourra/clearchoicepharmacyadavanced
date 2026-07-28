-- Patient balance payment requests + payment ledger for admin collection of remaining balances.
-- Run: psql $DATABASE_URL -f scripts/035_patient_balance_payments.sql

CREATE TABLE IF NOT EXISTS patient_balance_requests (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  description TEXT NOT NULL DEFAULT 'Balance due',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_url TEXT,
  emailed_to TEXT,
  created_by_staff_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_balance_requests_patient
  ON patient_balance_requests (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_balance_requests_session
  ON patient_balance_requests (stripe_checkout_session_id);

CREATE TABLE IF NOT EXISTS patient_payment_ledger (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  source TEXT NOT NULL,
  source_id TEXT,
  note TEXT,
  stripe_payment_intent_id TEXT,
  created_by_staff_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_payment_ledger_patient
  ON patient_payment_ledger (patient_id, created_at DESC);
