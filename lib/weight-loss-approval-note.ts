export type WeightLossDiabetesStatus = "none" | "type2" | "type1"

export const WEIGHT_LOSS_DIABETES_OPTIONS: Array<{
  id: WeightLossDiabetesStatus
  label: string
}> = [
  { id: "none", label: "Patient does not have diabetes" },
  { id: "type2", label: "Patient has type II diabetes mellitus" },
  { id: "type1", label: "Patient has type I diabetes mellitus" },
]

export function isWeightLossDiabetesStatus(value: string): value is WeightLossDiabetesStatus {
  return value === "none" || value === "type2" || value === "type1"
}

export function buildWeightLossApprovalNote(params: {
  medicationName: string
  diabetesStatus: WeightLossDiabetesStatus
}): string {
  const drug = params.medicationName.trim() || "tirzepatide"
  const diabetes =
    WEIGHT_LOSS_DIABETES_OPTIONS.find((option) => option.id === params.diabetesStatus)?.label ??
    WEIGHT_LOSS_DIABETES_OPTIONS[0].label

  return `SUBJECTIVE
CC/Purpose: Pharmacologic-assisted weight loss approaches.

HPI:
Patient is interested in getting more information and seeking perhaps a drug therapy to assist in broader holistic weight management strategies. Has dieted and has been unsuccessful at losing weight. We discussed in lengthy detail today their PMH, current medications. Also we discussed all FDA approved medication options to assist in weight management. Further we discussed the general treatment principles, the pros/cons, risks/benefits, and limitations of our current knowledge. As such we navigated the question of "is a medication needed at all" as a general principle along with side effects which include nausea, vomiting and possible gastroparesis in addition to diarrhea or constipation.

FAMILY / SOCIAL HISTORY:
Relevant family history: none
Tobacco use: none
Alcohol use: none
Diet: high protein, low carb, moderate fats

================================================================================
OBJECTIVE
Vitals: reviewed

Relevant labs:
--------------------------------------------------------------------------------
Allergies/ADRs:

Medication List: reviewed

================================================================================
ASSESSMENT:

Current BMI: over 28
No history of pancreatitis
No history of severe GI disease
Patient is not pregnant or is not capable of becoming pregnant
No personal or family history of thyroid cancers

${diabetes}

Medications that may be causing weight gain:

No medications identified that may be contributing to weight gain
--------------------------------------------------------------------------------
- Given patient's comorbidities, labs, and goals, subq ${drug} is the best option to try first for weight loss.

================================================================================
PLAN:
- Taking into account the patient's risk tolerances, personal perspectives and philosophies, patient wanted to proceed.
- Start ${drug} and titrate up according to tolerance and weight loss

================================================================================

EDUCATION:
- Writer reviewed disease states and risks associated with them.
- A review of labs, goals and laboratory values was discussed with the patient.
- Provided recommendations on diet and exercise.
- Reviewed all medication indications and the importance of adherence.
- A review of signs and symptoms associated with medications and disease state discussed with patient. Patient given instructions on how to contact the clinic in the event of an adverse drug reaction, questions or concerns.
- In the event of an emergency, patient instructed to seek immediate medical attention.
- References given. Patient voiced understanding and agreement.

Patient is aware this is a compounded ${drug}, not from the brand manufacturer, and produced by a 503A pharmacy.
All side effects discussed.

Pt is aware of all possible side effects and has agreed to proceed with medication / supplement.`
}
