import {
  formatConditionAnswerLabel,
} from "@/lib/rx-visit-conditions"

/** Human-readable labels for intake validation error lists */
export const INTAKE_FIELD_LABELS: Record<string, string> = {
  selectedProduct: "Treatment selection",
  selectedProgram: "Program selection",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  dateOfBirth: "Date of birth",
  state: "State",
  address: "Street address",
  city: "City",
  zipCode: "ZIP code",
  systolicBP: "Systolic blood pressure",
  diastolicBP: "Diastolic blood pressure",
  heartRate: "Heart rate",
  lastBPCheck: "Last BP check date",
  edDuration: "How long you've had ED",
  edSeverity: "ED severity",
  diabetes: "Diabetes history",
  hypertension: "Hypertension history",
  heartCondition: "Heart condition history",
  liverDisease: "Liver disease history",
  kidneyDisease: "Kidney disease history",
  visionProblems: "Vision problems history",
  shippingAddress: "Shipping street address",
  shippingCity: "Shipping city",
  shippingState: "Shipping state",
  shippingZip: "Shipping ZIP",
  idFrontFile: "ID front photo",
  idBackFile: "ID back photo",
  stripePayment: "Payment authorization",
  agreeToTerms: "Terms of service",
  agreeToTelehealth: "Telehealth consent",
  agreeToPrivacy: "Privacy / HIPAA acknowledgment",
  authorizeHold: "Payment hold authorization",
  priorTrtExperience: "Prior TRT experience",
  hasRecentLabs: "Recent labs",
  symptoms: "Symptoms",
  treatmentGoals: "Treatment goals",
  confirmedNoContraindications: "Contraindication confirmation",
  heightFeet: "Height (feet)",
  heightInches: "Height (inches)",
  weightLbs: "Current weight",
  goalWeightLbs: "Goal weight",
  comorbidities: "Qualifying conditions",
  selectedDoseTier: "Weekly dose",
  priorGlpExperience: "Prior GLP experience",
  priorGlpForm: "Prior GLP form",
  priorGlpCurrentDose: "Prior GLP current dose",
  priorGlpDuration: "Prior GLP duration",
  priorGlpTolerability: "Prior GLP tolerability",
  weightLossGoals: "Weight loss goals",
  selectedConditions: "Conditions for visit",
  otherConditionNotes: "Other condition description",
  primaryCondition: "Reason for visit",
  newOrWorseningSymptoms: "New or worsening symptoms",
  currentMedications: "Current medications",
  allergies: "Allergies",
  idUploading: "ID upload in progress",
}

export function labelsForFields(fields: string[]): string[] {
  return fields.map(
    (f) =>
      INTAKE_FIELD_LABELS[f] ??
      (f.includes("-") ? formatConditionAnswerLabel(f) : null) ??
      f.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
  )
}

export function scrollToFirstField(fields: string[]) {
  if (fields.length === 0) return
  requestAnimationFrame(() => {
    document.querySelector(`[data-field="${fields[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  })
}
