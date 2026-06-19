-- Partner, payment, and ID storage fields for all clinical intake tables
-- Run: psql $DATABASE_URL -f scripts/020_intake_partner_payment_fields.sql

ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS partner_case_id TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS partner_status TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS id_front_key TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS id_back_key TEXT;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS partner_case_id TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS partner_status TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS id_front_key TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS id_back_key TEXT;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS partner_case_id TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS partner_status TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS id_front_key TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS id_back_key TEXT;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS partner_case_id TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS partner_status TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS id_front_key TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS id_back_key TEXT;
ALTER TABLE rejuvenation_vial_intakes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS id_front_key TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS id_back_key TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE patient_intake SET status = 'pending_provider_review' WHERE status = 'pending_review';
UPDATE trt_intake SET status = 'pending_provider_review' WHERE status IN ('pending_review', 'pending');
UPDATE weight_loss_intake SET status = 'pending_provider_review' WHERE status IN ('pending_review', 'pending');

CREATE INDEX IF NOT EXISTS idx_patient_intake_partner_case ON patient_intake (partner_case_id);
CREATE INDEX IF NOT EXISTS idx_trt_intake_partner_case ON trt_intake (partner_case_id);
CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_partner_case ON weight_loss_intake (partner_case_id);
