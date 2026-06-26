export type SpecialtyMedication = {
  id: string
  name: string
  indication: string
}

export const COMMON_SPECIALTY_MEDICATIONS: SpecialtyMedication[] = [
  { id: "humira", name: "Humira (adalimumab)", indication: "Rheumatoid arthritis, Crohn's disease, psoriasis" },
  { id: "enbrel", name: "Enbrel (etanercept)", indication: "Rheumatoid arthritis, psoriasis, ankylosing spondylitis" },
  { id: "stelara", name: "Stelara (ustekinumab)", indication: "Psoriasis, Crohn's disease, ulcerative colitis" },
  { id: "dupixent", name: "Dupixent (dupilumab)", indication: "Eczema, asthma, chronic rhinosinusitis" },
  { id: "ocrevus", name: "Ocrevus (ocrelizumab)", indication: "Multiple sclerosis" },
  { id: "cosentyx", name: "Cosentyx (secukinumab)", indication: "Psoriasis, psoriatic arthritis, ankylosing spondylitis" },
  { id: "skyrizi", name: "Skyrizi (risankizumab)", indication: "Psoriasis, psoriatic arthritis, Crohn's disease" },
  { id: "keytruda", name: "Keytruda (pembrolizumab)", indication: "Various cancers (immunotherapy)" },
  { id: "eliquis", name: "Eliquis (apixaban)", indication: "Blood clots, atrial fibrillation stroke prevention" },
  { id: "revlimid", name: "Revlimid (lenalidomide)", indication: "Multiple myeloma, myelodysplastic syndromes" },
  { id: "tremfya", name: "Tremfya (guselkumab)", indication: "Psoriasis, psoriatic arthritis" },
  { id: "entyvio", name: "Entyvio (vedolizumab)", indication: "Ulcerative colitis, Crohn's disease" },
]

export const SPECIALTY_REQUEST_TYPES = [
  { value: "transfer", label: "Transfer from another pharmacy" },
  { value: "new_start", label: "New prescription / starting therapy" },
  { value: "refill", label: "Refill / renewal" },
] as const

export const SPECIALTY_PRIOR_AUTH_STATUSES = [
  { value: "not_started", label: "Not started yet" },
  { value: "in_progress", label: "In progress with current pharmacy" },
  { value: "approved", label: "Already approved" },
  { value: "denied", label: "Denied or needs appeal" },
  { value: "unsure", label: "Not sure" },
] as const

export const SPECIALTY_FULFILLMENT_OPTIONS = [
  { value: "pickup", label: "Pickup at Novi pharmacy" },
  { value: "delivery", label: "Home delivery" },
] as const

export const SPECIALTY_INTAKE_STATUS = {
  pending: "pending_review",
  coordinating: "coordinating_transfer",
  priorAuth: "prior_auth_in_progress",
  copay: "copay_assistance",
  ready: "ready_for_fulfillment",
  completed: "completed",
  cancelled: "cancelled",
} as const
